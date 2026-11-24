/** One-time content update: the Okta migration figure is a combined 200M+ users, not 300M+. Previous rows kept for rollback. */
import pg from "pg";

const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!url) {
  console.log("[200m] No database configured; bundled content is current.");
  process.exit(0);
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
export const fix = (s) => s.replaceAll("Led a 300M+ user migration", "Led a combined 200M+ user migration").replaceAll("moved 300 million users", "moved a combined 200 million users").replaceAll("300M+", "200M+");
const migration = "users-200m-2026-11-24";

try {
  await client.connect();
  await client.query("BEGIN");
  await client.query(
    `CREATE TABLE IF NOT EXISTS portfolio_content_migrations (id TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), previous_content JSONB NOT NULL)`,
  );
  const done = await client.query("SELECT id FROM portfolio_content_migrations WHERE id=$1", [migration]);
  if (done.rowCount) {
    console.log("[200m] Already applied.");
  } else {
    const { rows } = await client.query("SELECT key, data FROM portfolio_content WHERE key IN ('main','draft') FOR UPDATE");
    for (const row of rows) {
      const data = structuredClone(row.data);
      const data2 = fix(JSON.stringify(row.data)); Object.assign(data, JSON.parse(data2));
      await client.query("INSERT INTO portfolio_content_migrations (id, previous_content) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO NOTHING", [
        `${migration}:${row.key}`,
        JSON.stringify(row.data),
      ]);
      await client.query("UPDATE portfolio_content SET data=$1::jsonb, updated_at=NOW() WHERE key=$2", [JSON.stringify(data), row.key]);
      console.log(`[200m] Updated '${row.key}'.`);
    }
    await client.query("INSERT INTO portfolio_content_migrations (id, previous_content) VALUES ($1, '{}'::jsonb)", [migration]);
  }
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error("[200m] Failed; no content changes committed.", error?.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
