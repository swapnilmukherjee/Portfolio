import "server-only";

import { timingSafeEqual, createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { unstable_noStore as noStore } from "next/cache";
import { cookies } from "next/headers";

import fallbackJson from "@/data/content.json";
import type {
  AboutStat,
  Certification,
  Content,
  Education,
  Experience,
  Highlight,
  Profile,
  Project,
  SiteCopy,
  SkillGroup,
} from "@/data/content-types";

export const ADMIN_COOKIE_NAME = "portfolio_admin_session";

const FALLBACK_CONTENT = fallbackJson as Content;
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

const POSTGRES_URL =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  "";

type SaveTarget = "postgres" | "local-json" | "draft";

function configuredAdminToken() {
  if (process.env.ADMIN_SYNC_TOKEN) return process.env.ADMIN_SYNC_TOKEN;
  if (process.env.NODE_ENV !== "production") return "dev-admin";
  return "";
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeEquals(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function getAdminStatus() {
  noStore();
  const hasConfiguredToken = Boolean(process.env.ADMIN_SYNC_TOKEN);
  return {
    enabled: Boolean(configuredAdminToken()),
    usesDevToken: !hasConfiguredToken && process.env.NODE_ENV !== "production",
    devToken: !hasConfiguredToken && process.env.NODE_ENV !== "production" ? "dev-admin" : "",
    storage: POSTGRES_URL ? "Postgres" : "local JSON",
    missingDatabase: !POSTGRES_URL && process.env.NODE_ENV === "production",
  };
}

export function verifyAdminToken(token: string) {
  const expected = configuredAdminToken();
  if (!expected) return false;
  return safeEquals(sha256(token.trim()), sha256(expected));
}

export function setAdminSession() {
  const token = configuredAdminToken();
  if (!token) return;
  cookies().set({
    name: ADMIN_COOKIE_NAME,
    value: sha256(token),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export function clearAdminSession() {
  cookies().delete(ADMIN_COOKIE_NAME);
}

export function isAdminAuthenticated() {
  const expected = configuredAdminToken();
  const session = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!expected || !session) return false;
  return safeEquals(session, sha256(expected));
}

async function ensureContentTable(client: import("pg").Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS portfolio_content (
      key         TEXT PRIMARY KEY,
      data        JSONB NOT NULL,
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS portfolio_changelog (
      id            SERIAL PRIMARY KEY,
      saved_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      save_type     TEXT NOT NULL DEFAULT 'live',
      sections      TEXT[] NOT NULL DEFAULT '{}',
      note          TEXT
    );
  `);
}

export type ChangelogEntry = {
  id: number;
  saved_at: string;
  save_type: string;
  sections: string[];
  note: string | null;
};

async function recordChangelog(
  client: import("pg").Client,
  sections: string[],
  saveType: string,
) {
  await client.query(
    "INSERT INTO portfolio_changelog (saved_at, save_type, sections) VALUES (NOW(), $1, $2)",
    [saveType, sections],
  );
}

function diffSections(prev: Content | null, next: Content): string[] {
  if (!prev) return Object.keys(next);
  return Object.keys(next).filter((k) => {
    return JSON.stringify((prev as Record<string, unknown>)[k]) !==
      JSON.stringify((next as Record<string, unknown>)[k]);
  });
}

export async function getChangelog(): Promise<ChangelogEntry[]> {
  if (!POSTGRES_URL) return [];
  const { Client } = await import("pg");
  const client = new Client({ connectionString: POSTGRES_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    await ensureContentTable(client);
    const { rows } = await client.query<ChangelogEntry>(
      "SELECT id, saved_at, save_type, sections, note FROM portfolio_changelog ORDER BY saved_at DESC LIMIT 30"
    );
    return rows;
  } finally {
    await client.end().catch(() => {});
  }
}

async function readPostgresContent() {
  if (!POSTGRES_URL) return null;
  const { Client } = await import("pg");
  const client = new Client({
    connectionString: POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await ensureContentTable(client);
    const { rows } = await client.query<{ data: Content }>(
      "SELECT data FROM portfolio_content WHERE key = $1 LIMIT 1",
      ["main"],
    );
    return rows[0]?.data ?? null;
  } finally {
    await client.end().catch(() => {});
  }
}

async function writePostgresContent(content: Content, key = "main") {
  if (!POSTGRES_URL) return false;
  const { Client } = await import("pg");
  const client = new Client({
    connectionString: POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await ensureContentTable(client);

    // Read current for diff
    const { rows: existing } = await client.query<{ data: Content }>(
      "SELECT data FROM portfolio_content WHERE key = $1 LIMIT 1",
      [key],
    );
    const prev = existing[0]?.data ?? null;

    await client.query(
      `
      INSERT INTO portfolio_content (key, data, updated_at)
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE
        SET data = EXCLUDED.data,
            updated_at = NOW();
      `,
      [key, JSON.stringify(content)],
    );

    const changed = diffSections(prev, content);
    await recordChangelog(client, changed, key === "draft" ? "draft" : "live");

    return true;
  } finally {
    await client.end().catch(() => {});
  }
}

async function readJsonContent() {
  const file = join(process.cwd(), "src", "data", "content.json");
  const raw = await readFile(file, "utf-8");
  return JSON.parse(raw) as Content;
}

async function writeJsonContent(content: Content) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Postgres is required for CMS saves in production.");
  }

  const serialized = `${JSON.stringify(content, null, 2)}\n`;
  await Promise.all([
    writeFile(join(process.cwd(), "src", "data", "content.json"), serialized, "utf-8"),
    writeFile(join(process.cwd(), "api", "content.json"), serialized, "utf-8"),
  ]);
}

export async function getEditableContent() {
  noStore();
  if (POSTGRES_URL) {
    const fromDb = await readPostgresContent();
    if (fromDb) return fromDb;
  }

  return readJsonContent().catch(() => FALLBACK_CONTENT);
}

export async function getDraftContent(): Promise<Content | null> {
  noStore();
  if (!POSTGRES_URL) return null;
  const { Client } = await import("pg");
  const client = new Client({ connectionString: POSTGRES_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    await ensureContentTable(client);
    const { rows } = await client.query<{ data: Content }>(
      "SELECT data FROM portfolio_content WHERE key = 'draft' LIMIT 1"
    );
    return rows[0]?.data ?? null;
  } finally {
    await client.end().catch(() => {});
  }
}

export async function saveEditableContent(raw: unknown, asDraft = false): Promise<SaveTarget> {
  const content = normalizeContent(raw);
  const key = asDraft ? "draft" : "main";
  const wrotePostgres = await writePostgresContent(content, key);
  if (wrotePostgres) return asDraft ? "draft" : "postgres";

  if (asDraft) throw new Error("Draft mode requires Postgres.");
  await writeJsonContent(content);
  return "local-json";
}

export async function publishDraft(): Promise<boolean> {
  if (!POSTGRES_URL) return false;
  const { Client } = await import("pg");
  const client = new Client({ connectionString: POSTGRES_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    await ensureContentTable(client);
    // Copy draft → main
    await client.query(`
      INSERT INTO portfolio_content (key, data, updated_at)
      SELECT 'main', data, NOW() FROM portfolio_content WHERE key = 'draft'
      ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
    `);
    return true;
  } finally {
    await client.end().catch(() => {});
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function nullableStringValue(value: unknown) {
  if (value === null) return null;
  return typeof value === "string" ? value : null;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function arrayValue<T>(
  value: unknown,
  fallback: T[],
  normalizer: (item: unknown, fallbackItem?: T) => T,
) {
  if (!Array.isArray(value)) return fallback;
  return value.map((item, index) => normalizer(item, fallback[index])).filter(Boolean);
}

function normalizeProfile(value: unknown): Profile {
  const input = asRecord(value);
  const fallback = FALLBACK_CONTENT.profile;
  const socials = asRecord(input.socials);
  return {
    name: stringValue(input.name, fallback.name),
    firstName: stringValue(input.firstName, fallback.firstName),
    title: stringValue(input.title, fallback.title),
    tagline: stringValue(input.tagline, fallback.tagline),
    headline: stringValue(input.headline, fallback.headline),
    shortBio: stringValue(input.shortBio, fallback.shortBio),
    about: stringValue(input.about, fallback.about),
    location: stringValue(input.location, fallback.location),
    email: stringValue(input.email, fallback.email),
    publicEmail: stringValue(input.publicEmail, fallback.publicEmail),
    phone: stringValue(input.phone, fallback.phone),
    availability: stringValue(input.availability, fallback.availability),
    socials: {
      github: stringValue(socials.github, fallback.socials.github),
      linkedin: stringValue(socials.linkedin, fallback.socials.linkedin),
      email: stringValue(socials.email, fallback.socials.email),
    },
    resume: stringValue(input.resume, fallback.resume),
    ...(input.headshotUrl ? { headshotUrl: stringValue(input.headshotUrl, "") } : {}),
  };
}

function normalizeHighlight(value: unknown, fallback?: Highlight): Highlight {
  const input = asRecord(value);
  return {
    label: stringValue(input.label, fallback?.label),
    value: stringValue(input.value, fallback?.value),
    detail: stringValue(input.detail, fallback?.detail),
  };
}

function normalizeSkill(value: unknown, fallback?: SkillGroup): SkillGroup {
  const input = asRecord(value);
  return {
    category: stringValue(input.category, fallback?.category),
    icon: stringValue(input.icon, fallback?.icon),
    items: stringArray(input.items),
  };
}

function normalizeExperience(value: unknown, fallback?: Experience): Experience {
  const input = asRecord(value);
  return {
    id: stringValue(input.id, fallback?.id),
    role: stringValue(input.role, fallback?.role),
    company: stringValue(input.company, fallback?.company),
    contractInfo: nullableStringValue(input.contractInfo),
    logo: stringValue(input.logo, fallback?.logo),
    period: stringValue(input.period, fallback?.period),
    location: stringValue(input.location, fallback?.location),
    type: stringValue(input.type, fallback?.type),
    color: stringValue(input.color, fallback?.color),
    accent: stringValue(input.accent, fallback?.accent),
    summary: stringValue(input.summary, fallback?.summary),
    highlights: stringArray(input.highlights),
    tags: stringArray(input.tags),
  };
}

function normalizeEducation(value: unknown, fallback?: Education): Education {
  const input = asRecord(value);
  return {
    id: stringValue(input.id, fallback?.id),
    school: stringValue(input.school, fallback?.school),
    degree: stringValue(input.degree, fallback?.degree),
    period: stringValue(input.period, fallback?.period),
    location: stringValue(input.location, fallback?.location),
    accent: stringValue(input.accent, fallback?.accent),
  };
}

function normalizeCertification(value: unknown, fallback?: Certification): Certification {
  const input = asRecord(value);
  const status = input.status === "in-progress" ? "in-progress" : "earned";
  const cert: Certification = {
    name: stringValue(input.name, fallback?.name),
    issuer: stringValue(input.issuer, fallback?.issuer),
    status,
  };
  const issued = stringValue(input.issued, fallback?.issued);
  const expected = stringValue(input.expected, fallback?.expected);
  if (issued) cert.issued = issued;
  if (expected) cert.expected = expected;
  return cert;
}

function normalizeProject(value: unknown, fallback?: Project): Project {
  const input = asRecord(value);
  const project: Project = {
    id: stringValue(input.id, fallback?.id),
    title: stringValue(input.title, fallback?.title),
    date: stringValue(input.date, fallback?.date),
    category: stringValue(input.category, fallback?.category),
    icon: stringValue(input.icon, fallback?.icon),
    color: stringValue(input.color, fallback?.color),
    summary: stringValue(input.summary, fallback?.summary),
    description: stringValue(input.description, fallback?.description),
    tags: stringArray(input.tags),
  };
  if (input.imageUrl) project.imageUrl = stringValue(input.imageUrl, "");
  return project;
}

function normalizeAboutStat(value: unknown, fallback?: AboutStat): AboutStat {
  const input = asRecord(value);
  return {
    key: stringValue(input.key, fallback?.key),
    value: stringValue(input.value, fallback?.value),
    sub: stringValue(input.sub, fallback?.sub),
  };
}

const FALLBACK_SITE_COPY: SiteCopy = (FALLBACK_CONTENT as unknown as { siteCopy?: SiteCopy }).siteCopy ?? {
  heroStatus: "Okta · Identity & CIAM",
  aboutHeading: "The identity layer\nbehind",
  aboutHeadingBold: "modern apps.",
  aboutSubheading: "Five years operating customer and workforce identity at scale. Now on the platform side at Okta, including the new patterns AI agents demand.",
  aboutStats: [
    { key: "Now", value: "Technical Consultant", sub: "Okta · Auth0" },
    { key: "Specialty", value: "Auth0 & CIAM", sub: "OAuth · OIDC · SAML" },
    { key: "Frontier", value: "Auth0 for AI Agents", sub: "Identity for agentic workflows" },
  ],
  experienceHeading: "Five years,",
  experienceHeadingBold: "three chapters.",
  experienceSubheading: "Healthcare IAM, CIAM in financial services, and now Auth0 platform consulting at Okta.",
  projectsHeading: "Selected",
  projectsHeadingBold: "work.",
  projectsSubheading: "A mix of identity, security research, and full-stack engineering, built across grad school and personal time.",
  skillsHeading: "What I",
  skillsHeadingBold: "reach for.",
  skillsSubheading: "The protocols, platforms, and tools I use day-to-day.",
};

function normalizeSiteCopy(value: unknown): SiteCopy {
  const input = asRecord(value);
  const fb = FALLBACK_SITE_COPY;
  return {
    heroStatus: stringValue(input.heroStatus, fb.heroStatus),
    aboutHeading: stringValue(input.aboutHeading, fb.aboutHeading),
    aboutHeadingBold: stringValue(input.aboutHeadingBold, fb.aboutHeadingBold),
    aboutSubheading: stringValue(input.aboutSubheading, fb.aboutSubheading),
    aboutStats: arrayValue(input.aboutStats, fb.aboutStats, normalizeAboutStat),
    experienceHeading: stringValue(input.experienceHeading, fb.experienceHeading),
    experienceHeadingBold: stringValue(input.experienceHeadingBold, fb.experienceHeadingBold),
    experienceSubheading: stringValue(input.experienceSubheading, fb.experienceSubheading),
    projectsHeading: stringValue(input.projectsHeading, fb.projectsHeading),
    projectsHeadingBold: stringValue(input.projectsHeadingBold, fb.projectsHeadingBold),
    projectsSubheading: stringValue(input.projectsSubheading, fb.projectsSubheading),
    skillsHeading: stringValue(input.skillsHeading, fb.skillsHeading),
    skillsHeadingBold: stringValue(input.skillsHeadingBold, fb.skillsHeadingBold),
    skillsSubheading: stringValue(input.skillsSubheading, fb.skillsSubheading),
  };
}

export function normalizeContent(value: unknown): Content {
  const input = asRecord(value);
  return {
    profile: normalizeProfile(input.profile),
    highlights: arrayValue(input.highlights, FALLBACK_CONTENT.highlights, normalizeHighlight),
    skills: arrayValue(input.skills, FALLBACK_CONTENT.skills, normalizeSkill),
    experience: arrayValue(input.experience, FALLBACK_CONTENT.experience, normalizeExperience),
    education: arrayValue(input.education, FALLBACK_CONTENT.education, normalizeEducation),
    certifications: arrayValue(input.certifications, FALLBACK_CONTENT.certifications, normalizeCertification),
    projects: arrayValue(input.projects, FALLBACK_CONTENT.projects, normalizeProject),
    siteCopy: normalizeSiteCopy(input.siteCopy),
  };
}
