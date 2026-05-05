import "server-only";

import { timingSafeEqual, createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { cookies } from "next/headers";

import fallbackJson from "@/data/content.json";
import type {
  Certification,
  Content,
  Education,
  Experience,
  Highlight,
  Profile,
  Project,
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

type SaveTarget = "postgres" | "local-json";

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
  const hasConfiguredToken = Boolean(process.env.ADMIN_SYNC_TOKEN);
  return {
    enabled: Boolean(configuredAdminToken()),
    usesDevToken: !hasConfiguredToken && process.env.NODE_ENV !== "production",
    devToken: !hasConfiguredToken && process.env.NODE_ENV !== "production" ? "dev-admin" : "",
    storage: POSTGRES_URL ? "Postgres" : "local JSON",
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
  `);
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

async function writePostgresContent(content: Content) {
  if (!POSTGRES_URL) return false;
  const { Client } = await import("pg");
  const client = new Client({
    connectionString: POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await ensureContentTable(client);
    await client.query(
      `
      INSERT INTO portfolio_content (key, data, updated_at)
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE
        SET data = EXCLUDED.data,
            updated_at = NOW();
      `,
      ["main", JSON.stringify(content)],
    );
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
  const fromDb = await readPostgresContent().catch((error) => {
    console.warn("[admin] Postgres read failed, using JSON fallback:", (error as Error).message);
    return null;
  });
  return fromDb ?? (await readJsonContent().catch(() => FALLBACK_CONTENT));
}

export async function saveEditableContent(raw: unknown): Promise<SaveTarget> {
  const content = normalizeContent(raw);
  const wrotePostgres = await writePostgresContent(content);
  if (wrotePostgres) return "postgres";

  await writeJsonContent(content);
  return "local-json";
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
  return {
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
  };
}
