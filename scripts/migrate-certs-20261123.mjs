/**
 * One-time, field-scoped content update: drop certifications that are still
 * in progress (e.g. CISSP). Everything else in the CMS row is preserved and the
 * previous row is kept in portfolio_content_migrations for rollback.
 */
import pg from "pg";

if (process.env.VERCEL_ENV === "preview") {
  console.log("[certs-cleanup] Preview deployment; live content is unchanged.");
  process.exit(0);
}
const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!url) {
  console.log("[certs-cleanup] No database configured; bundled content is current.");
  process.exit(0);
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
const migration = "remove-in-progress-certs-2026-11-23";

try {
  await client.connect();
  await client.query("BEGIN");
  await client.query(
    `CREATE TABLE IF NOT EXISTS portfolio_content_migrations (id TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), previous_content JSONB NOT NULL)`,
  );
  const done = await client.query("SELECT id FROM portfolio_content_migrations WHERE id=$1", [migration]);
  if (done.rowCount) {
    console.log("[certs-cleanup] Already applied; preserving current CMS content.");
  } else {
    const { rows } = await client.query("SELECT key, data FROM portfolio_content WHERE key IN ('main','draft') FOR UPDATE");
    for (const row of rows) {
      const before = row.data;
      const data = structuredClone(before);
      const certs = Array.isArray(data.certifications) ? data.certifications : [];
      data.certifications = certs.filter((c) => c && c.status !== "in-progress");
      if (data.certifications.length === certs.length) continue;
      await client.query("UPDATE portfolio_content SET data=$1::jsonb, updated_at=NOW() WHERE key=$2", [JSON.stringify(data), row.key]);
      await client.query("INSERT INTO portfolio_content_migrations (id, previous_content) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO NOTHING", [
        `${migration}:${row.key}`,
        JSON.stringify(before),
      ]);
      console.log(`[certs-cleanup] Removed ${certs.length - data.certifications.length} in-progress certification(s) from '${row.key}'.`);
    }
    await client.query("INSERT INTO portfolio_content_migrations (id, previous_content) VALUES ($1, '{}'::jsonb)", [migration]);
  }
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error("[certs-cleanup] Failed; no content changes committed.", error?.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
