#!/usr/bin/env node
/**
 * Build-time hook: pushes src/data/content.json into Postgres.
 * Runs from `npm run build` via the prebuild script.
 *
 * Skips silently if POSTGRES_URL isn't set (local dev) — Postgres is optional.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_PATH = resolve(__dirname, "..", "src", "data", "content.json");

const url =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

if (!url) {
  console.log("[sync-content] No POSTGRES_URL — skipping. (Frontend will use bundled JSON.)");
  process.exit(0);
}

let pg;
try {
  // `pg` is dev-only — only required when POSTGRES_URL is set.
  pg = await import("pg");
} catch {
  console.log("[sync-content] 'pg' not installed — skipping build-time sync.");
  console.log("                Install with: npm i -D pg");
  process.exit(0);
}

const { Client } = pg.default;
const data = JSON.parse(readFileSync(CONTENT_PATH, "utf-8"));
const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS portfolio_content (
      key         TEXT PRIMARY KEY,
      data        JSONB NOT NULL,
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(
    `
    INSERT INTO portfolio_content (key, data, updated_at)
    VALUES ($1, $2::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE
      SET data = EXCLUDED.data,
          updated_at = NOW();
    `,
    ["main", JSON.stringify(data)]
  );

  console.log(`[sync-content] Synced ${Object.keys(data).length} top-level keys to Postgres.`);
} catch (err) {
  console.warn(`[sync-content] Sync failed (non-fatal): ${err.message}`);
  // Exit 0 so the build doesn't fail just because Postgres is down.
  process.exit(0);
} finally {
  await client.end().catch(() => {});
}
