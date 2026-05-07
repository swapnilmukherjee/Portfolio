import "server-only";

import { timingSafeEqual, createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { unstable_noStore as noStore } from "next/cache";
import { cookies } from "next/headers";

import fallbackJson from "@/data/content.json";
import type { Content } from "@/data/content-types";
import { normalizeContent } from "@/lib/normalize-content";

const FALLBACK_CONTENT = fallbackJson as Content;

export const ADMIN_COOKIE_NAME = "portfolio_admin_session";

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
  // Run each DDL statement separately — pg does not reliably handle multi-statement queries.
  await client.query(`
    CREATE TABLE IF NOT EXISTS portfolio_content (
      key         TEXT PRIMARY KEY,
      data        JSONB NOT NULL,
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS portfolio_changelog (
      id            SERIAL PRIMARY KEY,
      saved_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      save_type     TEXT NOT NULL DEFAULT 'live',
      sections      TEXT[] NOT NULL DEFAULT '{}',
      note          TEXT
    )
  `);
  await client.query(
    `ALTER TABLE portfolio_changelog ADD COLUMN IF NOT EXISTS diff JSONB`
  );
}

// ── Field-level diff engine ────────────────────────────────────────────────

export type DiffItem = {
  label: string;
  action: "changed" | "added" | "removed";
  old?: string;
  new?: string;
};

function trunc(s: string | null | undefined, max = 80): string {
  const v = (s ?? "").replace(/\s+/g, " ").trim();
  return v.length > max ? v.slice(0, max) + "…" : v;
}

function fieldDiff(label: string, a: string | null | undefined, b: string | null | undefined, out: DiffItem[]) {
  const av = a ?? "";
  const bv = b ?? "";
  if (av !== bv) out.push({ label, action: "changed", old: trunc(av), new: trunc(bv) });
}

function computeContentDiff(prev: Content | null, next: Content): DiffItem[] {
  if (!prev) return [{ label: "Initial save — full content written", action: "added" }];
  const items: DiffItem[] = [];

  // ── Profile ─────────────────────────────────────────────────────
  const profileStringFields: [keyof import("@/data/content-types").Profile, string][] = [
    ["name", "Name"], ["firstName", "First name"], ["title", "Title"],
    ["tagline", "Tagline"], ["headline", "Headline"], ["shortBio", "Short bio"],
    ["about", "About"], ["location", "Location"], ["email", "Email"],
    ["publicEmail", "Public email"], ["phone", "Phone"],
    ["availability", "Availability"], ["resume", "Resume URL"],
    ["headshotUrl", "Headshot URL"],
  ];
  for (const [key, label] of profileStringFields) {
    fieldDiff(`Profile · ${label}`, prev.profile[key] as string, next.profile[key] as string, items);
  }
  fieldDiff("Profile · GitHub", prev.profile.socials.github, next.profile.socials.github, items);
  fieldDiff("Profile · LinkedIn", prev.profile.socials.linkedin, next.profile.socials.linkedin, items);
  fieldDiff("Profile · Email link", prev.profile.socials.email, next.profile.socials.email, items);

  // ── Site copy ────────────────────────────────────────────────────
  const siteCopyStringFields: [keyof import("@/data/content-types").SiteCopy, string][] = [
    ["heroStatus", "Hero status"],
    ["aboutHeading", "About heading"], ["aboutHeadingBold", "About heading bold"],
    ["aboutSubheading", "About subheading"],
    ["experienceHeading", "Experience heading"], ["experienceHeadingBold", "Experience heading bold"],
    ["experienceSubheading", "Experience subheading"],
    ["projectsHeading", "Projects heading"], ["projectsHeadingBold", "Projects heading bold"],
    ["projectsSubheading", "Projects subheading"],
    ["skillsHeading", "Skills heading"], ["skillsHeadingBold", "Skills heading bold"],
    ["skillsSubheading", "Skills subheading"],
  ];
  for (const [key, label] of siteCopyStringFields) {
    fieldDiff(`Copy · ${label}`, prev.siteCopy[key] as string, next.siteCopy[key] as string, items);
  }
  for (let i = 0; i < Math.max(prev.siteCopy.aboutStats.length, next.siteCopy.aboutStats.length); i++) {
    const pa = prev.siteCopy.aboutStats[i];
    const na = next.siteCopy.aboutStats[i];
    if (!pa) { items.push({ label: `Copy · About stat ${i + 1} added`, action: "added", new: `${na.key}: ${na.value}` }); continue; }
    if (!na) { items.push({ label: `Copy · About stat ${i + 1} removed`, action: "removed", old: `${pa.key}: ${pa.value}` }); continue; }
    fieldDiff(`Copy · About stat ${i + 1} label`, pa.key, na.key, items);
    fieldDiff(`Copy · About stat ${i + 1} value`, pa.value, na.value, items);
    fieldDiff(`Copy · About stat ${i + 1} sub`, pa.sub, na.sub, items);
  }

  // ── Experience ───────────────────────────────────────────────────
  const prevExpMap = new Map(prev.experience.map(e => [e.id, e]));
  const nextExpMap = new Map(next.experience.map(e => [e.id, e]));
  for (const [id, exp] of nextExpMap) {
    const pe = prevExpMap.get(id);
    if (!pe) { items.push({ label: `Experience · Added: ${exp.role} @ ${exp.company}`, action: "added" }); continue; }
    const expFields: [keyof import("@/data/content-types").Experience, string][] = [
      ["role", "Role"], ["company", "Company"], ["period", "Period"],
      ["location", "Location"], ["type", "Type"], ["contractInfo", "Contract info"], ["summary", "Summary"],
    ];
    for (const [key, label] of expFields) {
      fieldDiff(`${exp.company} · ${label}`, pe[key] as string, exp[key] as string, items);
    }
    if (pe.highlights.join("\n") !== exp.highlights.join("\n"))
      items.push({ label: `${exp.company} · Highlights`, action: "changed", old: trunc(pe.highlights.join(" / ")), new: trunc(exp.highlights.join(" / ")) });
    if (pe.tags.join(",") !== exp.tags.join(","))
      items.push({ label: `${exp.company} · Tags`, action: "changed", old: pe.tags.join(", "), new: exp.tags.join(", ") });
  }
  for (const [id, exp] of prevExpMap) {
    if (!nextExpMap.has(id)) items.push({ label: `Experience · Removed: ${exp.role} @ ${exp.company}`, action: "removed" });
  }

  // ── Skills ───────────────────────────────────────────────────────
  const prevSkillMap = new Map(prev.skills.map(s => [s.category, s]));
  const nextSkillMap = new Map(next.skills.map(s => [s.category, s]));
  for (const [cat, skill] of nextSkillMap) {
    const ps = prevSkillMap.get(cat);
    if (!ps) { items.push({ label: `Skills · Added category: ${cat}`, action: "added" }); continue; }
    if (ps.items.join(",") !== skill.items.join(",")) {
      const added = skill.items.filter(i => !ps.items.includes(i));
      const removed = ps.items.filter(i => !skill.items.includes(i));
      if (added.length) items.push({ label: `Skills · ${cat}: added`, action: "added", new: added.join(", ") });
      if (removed.length) items.push({ label: `Skills · ${cat}: removed`, action: "removed", old: removed.join(", ") });
    }
  }
  for (const [cat] of prevSkillMap) {
    if (!nextSkillMap.has(cat)) items.push({ label: `Skills · Removed category: ${cat}`, action: "removed" });
  }

  // ── Projects ─────────────────────────────────────────────────────
  const prevProjMap = new Map(prev.projects.map(p => [p.id, p]));
  const nextProjMap = new Map(next.projects.map(p => [p.id, p]));
  for (const [id, proj] of nextProjMap) {
    const pp = prevProjMap.get(id);
    if (!pp) { items.push({ label: `Projects · Added: ${proj.title}`, action: "added" }); continue; }
    const projFields: [keyof import("@/data/content-types").Project, string][] = [
      ["title", "Title"], ["summary", "Summary"], ["description", "Description"],
      ["date", "Date"], ["category", "Category"],
    ];
    for (const [key, label] of projFields) {
      fieldDiff(`${proj.title} · ${label}`, pp[key] as string, proj[key] as string, items);
    }
    if (pp.tags.join(",") !== proj.tags.join(","))
      items.push({ label: `${proj.title} · Tags`, action: "changed", old: pp.tags.join(", "), new: proj.tags.join(", ") });
    if ((pp.imageUrl ?? "") !== (proj.imageUrl ?? ""))
      items.push({ label: `${proj.title} · Image`, action: "changed" });
  }
  for (const [id, proj] of prevProjMap) {
    if (!nextProjMap.has(id)) items.push({ label: `Projects · Removed: ${proj.title}`, action: "removed" });
  }

  // ── Education ────────────────────────────────────────────────────
  const prevEduMap = new Map(prev.education.map(e => [e.id, e]));
  const nextEduMap = new Map(next.education.map(e => [e.id, e]));
  for (const [id, edu] of nextEduMap) {
    const pe = prevEduMap.get(id);
    if (!pe) { items.push({ label: `Education · Added: ${edu.school}`, action: "added" }); continue; }
    fieldDiff(`Education · ${edu.school} degree`, pe.degree, edu.degree, items);
    fieldDiff(`Education · ${edu.school} period`, pe.period, edu.period, items);
  }
  for (const [id, edu] of prevEduMap) {
    if (!nextEduMap.has(id)) items.push({ label: `Education · Removed: ${edu.school}`, action: "removed" });
  }

  // ── Certifications ───────────────────────────────────────────────
  const prevCertMap = new Map(prev.certifications.map(c => [c.name, c]));
  const nextCertMap = new Map(next.certifications.map(c => [c.name, c]));
  for (const [name, cert] of nextCertMap) {
    const pc = prevCertMap.get(name);
    if (!pc) { items.push({ label: `Certifications · Added: ${cert.name}`, action: "added" }); continue; }
    if (pc.status !== cert.status) fieldDiff(`Certifications · ${name} status`, pc.status, cert.status, items);
    fieldDiff(`Certifications · ${name} issued`, pc.issued, cert.issued, items);
    fieldDiff(`Certifications · ${name} expected`, pc.expected, cert.expected, items);
  }
  for (const [name] of prevCertMap) {
    if (!nextCertMap.has(name)) items.push({ label: `Certifications · Removed: ${name}`, action: "removed" });
  }

  // ── Highlights ───────────────────────────────────────────────────
  for (let i = 0; i < Math.max(prev.highlights.length, next.highlights.length); i++) {
    const ph = prev.highlights[i];
    const nh = next.highlights[i];
    if (!ph) { items.push({ label: `Highlight ${i + 1} added`, action: "added", new: `${nh.label}: ${nh.value}` }); continue; }
    if (!nh) { items.push({ label: `Highlight ${i + 1} removed`, action: "removed", old: `${ph.label}: ${ph.value}` }); continue; }
    fieldDiff(`Highlight ${i + 1} · label`, ph.label, nh.label, items);
    fieldDiff(`Highlight ${i + 1} · value`, ph.value, nh.value, items);
    fieldDiff(`Highlight ${i + 1} · detail`, ph.detail, nh.detail, items);
  }

  return items;
}

export type ChangelogEntry = {
  id: number;
  saved_at: string;
  save_type: string;
  sections: string[];
  note: string | null;
  diff: DiffItem[] | null;
};

async function recordChangelog(
  client: import("pg").Client,
  sections: string[],
  saveType: string,
  diff: DiffItem[],
) {
  await client.query(
    "INSERT INTO portfolio_changelog (saved_at, save_type, sections, diff) VALUES (NOW(), $1, $2, $3::jsonb)",
    [saveType, sections, JSON.stringify(diff)],
  );
}

export async function getChangelog(): Promise<ChangelogEntry[]> {
  if (!POSTGRES_URL) return [];
  const { Client } = await import("pg");
  const client = new Client({ connectionString: POSTGRES_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    await ensureContentTable(client);
    const { rows } = await client.query<ChangelogEntry>(
      "SELECT id, saved_at, save_type, sections, note, diff FROM portfolio_changelog ORDER BY saved_at DESC LIMIT 30"
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

    const diff = computeContentDiff(prev, content);
    await recordChangelog(client, [], key === "draft" ? "draft" : "live", diff);

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

export { normalizeContent } from "@/lib/normalize-content";
