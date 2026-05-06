/**
 * Server-only content loader.
 *
 * Production: reads from Postgres (Vercel Postgres / Neon). The homepage is
 * dynamic so CMS saves show up on the next request instead of waiting for ISR.
 *
 * Local dev / fallback: reads the bundled JSON file. Means you don't need
 * Postgres running just to `npm run dev`.
 */
import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { unstable_noStore as noStore } from "next/cache";
import { draftMode } from "next/headers";

import type { Content } from "@/data/content-types";
import { normalizeContent } from "@/lib/admin-content";

const REVALIDATE_SECONDS = 0;

const POSTGRES_URL =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  "";

/**
 * Lazy-load `pg` only when we actually have a connection string. Keeps the
 * client bundle clean and avoids importing the driver during dev when JSON
 * is enough.
 */
async function fetchFromPostgres(key = "main"): Promise<Content | null> {
  if (!POSTGRES_URL) return null;

  try {
    const { Client } = await import("pg");
    const client = new Client({
      connectionString: POSTGRES_URL,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();

    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS portfolio_content (
          key         TEXT PRIMARY KEY,
          data        JSONB NOT NULL,
          updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      const { rows } = await client.query<{ data: unknown }>(
        "SELECT data FROM portfolio_content WHERE key = $1 LIMIT 1",
        [key],
      );
      return rows[0]?.data ? normalizeContent(rows[0].data) : null;
    } finally {
      await client.end().catch(() => {});
    }
  } catch (err) {
    console.error("[content] Postgres fetch failed, falling back to JSON:", err);
    return null;
  }
}

async function fetchFromJson(): Promise<Content> {
  const file = join(process.cwd(), "src", "data", "content.json");
  const raw = await readFile(file, "utf-8");
  return normalizeContent(JSON.parse(raw));
}

export async function getContent(): Promise<Content> {
  noStore();

  const { isEnabled: isDraft } = draftMode();

  // In draft mode, try the "draft" row first, then fall back to "main"
  if (POSTGRES_URL) {
    if (isDraft) {
      const draft = await fetchFromPostgres("draft");
      if (draft) return draft;
    }
    const fromDb = await fetchFromPostgres("main");
    if (fromDb) return fromDb;
  }

  return fetchFromJson();
}

export async function isDraftModeEnabled(): Promise<boolean> {
  return draftMode().isEnabled;
}

export const revalidate = REVALIDATE_SECONDS;
