"""
Postgres helpers for the portfolio API.

Why psycopg + a lightweight schema instead of an ORM?
- Vercel Functions are cold-start sensitive; psycopg is fast to import.
- Our schema is tiny: one JSON content row + a counters table. ORM is overkill.

Connection model
----------------
Vercel Postgres / Neon expose `POSTGRES_URL` (pooled). We use `POSTGRES_URL_NON_POOLING`
for writes if available, since the pooler doesn't support session-level features we
might add later. Reads use the pooled URL.

Falls back gracefully:
- If no POSTGRES_URL is set, every helper raises `DBNotConfigured` and the API
  uses the JSON file shipped in the repo. This makes local dev painless.
- In production, the CMS writes directly to the `portfolio_content` row.
"""
from __future__ import annotations

import json
import os
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator

try:
    import psycopg
    from psycopg.rows import dict_row
    PSYCOPG_AVAILABLE = True
except ImportError:  # pragma: no cover, only happens if requirements aren't installed
    psycopg = None  # type: ignore
    dict_row = None  # type: ignore
    PSYCOPG_AVAILABLE = False


class DBNotConfigured(RuntimeError):
    """Raised when the API tries to talk to Postgres but no URL is configured."""


def _read_url() -> str | None:
    # Prefer the non-pooling URL for writes (analytics inserts), fall back to pooled.
    return (
        os.environ.get("POSTGRES_URL_NON_POOLING")
        or os.environ.get("POSTGRES_URL")
        or os.environ.get("DATABASE_URL")
    )


def is_configured() -> bool:
    return PSYCOPG_AVAILABLE and bool(_read_url())


@contextmanager
def get_conn() -> Iterator[Any]:
    if not PSYCOPG_AVAILABLE:
        raise DBNotConfigured("psycopg is not installed")
    url = _read_url()
    if not url:
        raise DBNotConfigured("No POSTGRES_URL / DATABASE_URL configured")
    # Neon requires SSL; psycopg picks this up from the URL automatically.
    conn = psycopg.connect(url, autocommit=True, row_factory=dict_row)
    try:
        yield conn
    finally:
        conn.close()


SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS portfolio_content (
    key         TEXT PRIMARY KEY,
    data        JSONB NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS page_views (
    id          BIGSERIAL PRIMARY KEY,
    page        TEXT NOT NULL,
    viewed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_agent  TEXT,
    referrer    TEXT
);

CREATE INDEX IF NOT EXISTS idx_page_views_page  ON page_views (page);
CREATE INDEX IF NOT EXISTS idx_page_views_time  ON page_views (viewed_at DESC);

CREATE TABLE IF NOT EXISTS project_clicks (
    id          BIGSERIAL PRIMARY KEY,
    project_id  TEXT NOT NULL,
    clicked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_clicks_id ON project_clicks (project_id);
"""


def ensure_schema() -> None:
    """Idempotent, safe to call on every cold start."""
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(SCHEMA_SQL)


def sync_content_from_file(content_path: Path) -> dict[str, Any]:
    """Load JSON from disk and upsert into portfolio_content under key='main'."""
    with content_path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO portfolio_content (key, data, updated_at)
                VALUES (%s, %s, NOW())
                ON CONFLICT (key) DO UPDATE
                  SET data = EXCLUDED.data,
                      updated_at = NOW();
                """,
                ("main", json.dumps(data)),
            )
    return data


def get_content() -> dict[str, Any] | None:
    """Read the active content row. Returns None if the table is empty."""
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT data FROM portfolio_content WHERE key = 'main'")
            row = cur.fetchone()
            return row["data"] if row else None


def record_view(page: str, user_agent: str | None = None, referrer: str | None = None) -> int:
    """Insert a page-view row and return the live total for that page."""
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO page_views (page, user_agent, referrer) VALUES (%s, %s, %s)",
                (page, user_agent, referrer),
            )
            cur.execute("SELECT COUNT(*) AS c FROM page_views WHERE page = %s", (page,))
            row = cur.fetchone()
            return int(row["c"]) if row else 0


def record_project_click(project_id: str) -> int:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO project_clicks (project_id) VALUES (%s)", (project_id,))
            cur.execute("SELECT COUNT(*) AS c FROM project_clicks WHERE project_id = %s", (project_id,))
            row = cur.fetchone()
            return int(row["c"]) if row else 0


def get_stats() -> dict[str, Any]:
    """Aggregate counters for the public /api/stats endpoint."""
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT page, COUNT(*) AS c FROM page_views GROUP BY page")
            page_counts = {row["page"]: int(row["c"]) for row in cur.fetchall()}

            cur.execute("SELECT COUNT(*) AS c FROM page_views")
            total_views = int(cur.fetchone()["c"])

            cur.execute(
                "SELECT project_id, COUNT(*) AS c FROM project_clicks GROUP BY project_id ORDER BY c DESC LIMIT 20"
            )
            project_counts = {row["project_id"]: int(row["c"]) for row in cur.fetchall()}

    return {
        "total_views": total_views,
        "by_page": page_counts,
        "by_project": project_counts,
    }
