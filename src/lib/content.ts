/**
 * Server-only content loader.
 *
 * Production: reads from Postgres (Vercel Postgres / Neon). Cached for the
 * duration of the request (React cache) and revalidated every 5 minutes
 * via Next.js fetch revalidation semantics, so a `vercel deploy` / sync
 * picks up changes within minutes without us having to bust caches.
 *
 * Local dev / fallback: reads the bundled JSON file. Means you don't need
 * Postgres running just to `npm run dev`.
 */
import "server-only";

import { cache } from "react";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { Content } from "@/data/content-types";

const REVALIDATE_SECONDS = 300;

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
async function fetchFromPostgres(): Promise<Content | null> {
  if (!POSTGRES_URL) return null;

  try {
    const { Client } = await import("pg");
    const client = new Client({
      connectionString: POSTGRES_URL,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();

    try {
      // Ensure schema exists, first deploy should hit /api/admin/sync, but if
      // the table got dropped we self-heal here rather than 500ing.
      await client.query(`
        CREATE TABLE IF NOT EXISTS portfolio_content (
          key         TEXT PRIMARY KEY,
          data        JSONB NOT NULL,
          updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      const { rows } = await client.query<{ data: Content }>(
        "SELECT data FROM portfolio_content WHERE key = $1 LIMIT 1",
        ["main"],
      );
      return rows[0]?.data ?? null;
    } finally {
      await client.end().catch(() => {});
    }
  } catch (err) {
    console.warn("[content] Postgres read failed, falling back to JSON:", (err as Error).message);
    return null;
  }
}

async function fetchFromJson(): Promise<Content> {
  const file = join(process.cwd(), "src", "data", "content.json");
  const raw = await readFile(file, "utf-8");
  return JSON.parse(raw) as Content;
}

/**
 * `cache` dedupes calls within a single request. Outside that scope, Next's
 * incremental cache + revalidate handles freshness in production.
 */
export const getContent = cache(async (): Promise<Content> => {
  // Prefer Postgres in production. Fall back to JSON if it isn't reachable
  // or hasn't been seeded yet, the prebuild sync covers seeding.
  const fromDb = await fetchFromPostgres();
  if (fromDb) return fromDb;
  return fetchFromJson();
});

export const revalidate = REVALIDATE_SECONDS;
