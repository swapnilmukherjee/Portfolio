/**
 * One-time content update: serve the headshot from /headshot.jpg (the cleaned
 * file in public/) instead of the earlier uploaded copy. Only profile.headshotUrl
 * changes; the previous row is kept in portfolio_content_migrations for rollback.
 */
import pg from "pg";

const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!url) {
  console.log("[headshot] No database configured; bundled content is current.");
  process.exit(0);
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
const migration = "headshot-local-2026-11-24";

try {
  await client.connect();
  await client.query("BEGIN");
  await client.query(
    `CREATE TABLE IF NOT EXISTS portfolio_content_migrations (id TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), previous_content JSONB NOT NULL)`,
  );
  const done = await client.query("SELECT id FROM portfolio_content_migrations WHERE id=$1", [migration]);
  if (done.rowCount) {
    console.log("[headshot] Already applied.");
  } else {
    const { rows } = await client.query("SELECT key, data FROM portfolio_content WHERE key IN ('main','draft') FOR UPDATE");
    for (const row of rows) {
      const data = structuredClone(row.data);
      data.profile = { ...(data.profile || {}), headshotUrl: "/headshot.jpg" };
      await client.query("INSERT INTO portfolio_content_migrations (id, previous_content) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO NOTHING", [
        `${migration}:${row.key}`,
        JSON.stringify(row.data),
      ]);
      await client.query("UPDATE portfolio_content SET data=$1::jsonb, updated_at=NOW() WHERE key=$2", [JSON.stringify(data), row.key]);
      console.log(`[headshot] Updated '${row.key}'.`);
    }
    await client.query("INSERT INTO portfolio_content_migrations (id, previous_content) VALUES ($1, '{}'::jsonb)", [migration]);
  }
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error("[headshot] Failed; no content changes committed.", error?.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
