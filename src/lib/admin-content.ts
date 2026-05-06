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

export { normalizeContent } from "@/lib/normalize-content";
