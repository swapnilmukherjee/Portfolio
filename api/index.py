"""
Swapnil Mukherjee, Portfolio API
FastAPI backend deployed as Vercel Serverless Functions under /api.

Storage strategy
----------------
- Source of truth for content lives in `content.json` (synced from src/data/content.json).
- On startup (cold start), the API reads from Postgres if `POSTGRES_URL` is configured
  and falls back to the bundled JSON otherwise. This makes local dev frictionless and
  keeps prod fast (Postgres is ~one extra ms per cold start).
- Analytics (page views, project clicks) only persist when Postgres is configured;
  without it, /api/track is a no-op (the UI doesn't care).

Endpoints
---------
GET  /api/health           Liveness probe + DB status.
GET  /api/content          Full portfolio content.
GET  /api/profile          Profile sub-tree.
GET  /api/experience       Experience list.
GET  /api/projects         Projects list (?category= filter).
POST /api/contact          Send a message via Resend (or dev-log fallback).
GET  /api/track            Increment a page view.
POST /api/track-project    Increment a project click (body: {"id": "..."}).
GET  /api/stats            Aggregate analytics.
POST /api/admin/sync       Reload content from JSON into Postgres (token-protected).
"""
from __future__ import annotations

import json
import os
import re
import sys
import time
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, Header, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from db import (
    DBNotConfigured,
    ensure_schema,
    get_content as db_get_content,
    get_stats as db_get_stats,
    is_configured as db_configured,
    record_project_click,
    record_view,
    sync_content_from_file,
)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

CONTENT_PATH = ROOT / "content.json"

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
CONTACT_TO_EMAIL = os.environ.get("CONTACT_TO_EMAIL", "swapnilmukherjee.jobs@gmail.com")
CONTACT_FROM_EMAIL = os.environ.get("CONTACT_FROM_EMAIL", "Portfolio <onboarding@resend.dev>")
ADMIN_TOKEN = os.environ.get("ADMIN_SYNC_TOKEN", "")  # Only needed for /api/admin/sync.


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Swapnil Mukherjee, Portfolio API",
    version="2.0.0",
    description="Backend for swapnilmukherjee.dev, content, contact, analytics. Postgres-backed when configured.",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Cold-start setup: ensure schema + lazy content sync
# ---------------------------------------------------------------------------

_BOOTED = False


def boot_once() -> None:
    """Runs on first request. Ensures schema exists and syncs content if DB is empty."""
    global _BOOTED
    if _BOOTED:
        return
    if db_configured():
        try:
            ensure_schema()
            # If the content table is empty, seed it from the JSON file.
            existing = db_get_content()
            if not existing:
                sync_content_from_file(CONTENT_PATH)
        except Exception as exc:
            # Don't fail requests if Postgres is unreachable, fall back to JSON.
            print(f"[boot] DB setup failed, falling back to JSON: {exc}")
    _BOOTED = True


def load_content_from_json() -> dict[str, Any]:
    if not CONTENT_PATH.exists():
        raise HTTPException(status_code=500, detail="content.json not found")
    with CONTENT_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


def load_content() -> dict[str, Any]:
    """
    Postgres-first. If DB is configured, it must answer or we 503.
    JSON fallback only kicks in when DB isn't configured at all (local dev).
    """
    boot_once()
    if db_configured():
        try:
            data = db_get_content()
            if data:
                return data
            # DB is up but empty, try one self-heal sync, then 503 if still empty.
            sync_content_from_file(CONTENT_PATH)
            data = db_get_content()
            if data:
                return data
            raise HTTPException(status_code=503, detail="Content table is empty")
        except DBNotConfigured:
            # Shouldn't reach here since db_configured() is true, but be safe.
            return load_content_from_json()
        except HTTPException:
            raise
        except Exception as exc:
            print(f"[content] DB read failed: {exc}")
            raise HTTPException(status_code=503, detail="Database unreachable") from exc
    # No DB configured, local dev path.
    return load_content_from_json()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class ContactPayload(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    subject: str | None = Field(default=None, max_length=160)
    message: str = Field(..., min_length=10, max_length=5000)
    website: str | None = Field(default=None, max_length=200)  # honeypot


class ContactResponse(BaseModel):
    ok: bool
    detail: str


class ProjectClickPayload(BaseModel):
    id: str = Field(..., min_length=1, max_length=64)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health() -> dict[str, Any]:
    boot_once()
    return {
        "ok": True,
        "ts": int(time.time()),
        "db": "connected" if db_configured() else "json-only",
    }


@app.get("/api/content")
def get_content() -> dict[str, Any]:
    return load_content()


@app.get("/api/profile")
def get_profile() -> dict[str, Any]:
    return load_content().get("profile", {})


@app.get("/api/experience")
def get_experience() -> list[dict[str, Any]]:
    return load_content().get("experience", [])


@app.get("/api/projects")
def get_projects(category: str | None = Query(default=None)) -> list[dict[str, Any]]:
    projects = load_content().get("projects", [])
    if category and category.lower() != "all":
        projects = [p for p in projects if p.get("category", "").lower() == category.lower()]
    return projects


@app.post("/api/contact", response_model=ContactResponse)
async def contact(payload: ContactPayload, request: Request) -> ContactResponse:
    if payload.website:
        # Honeypot tripped, silently accept and drop.
        return ContactResponse(ok=True, detail="Thanks!")

    safe_name = re.sub(r"[\r\n]+", " ", payload.name).strip()
    safe_subject = (payload.subject or f"Portfolio contact from {safe_name}").strip()
    safe_message = payload.message.strip()

    html = f"""\
<!doctype html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #111;">
  <h2 style="margin: 0 0 12px;">New portfolio message</h2>
  <table style="border-collapse: collapse; margin-bottom: 16px;">
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">From</td><td><strong>{safe_name}</strong> &lt;{payload.email}&gt;</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Subject</td><td>{safe_subject}</td></tr>
  </table>
  <div style="white-space: pre-wrap; padding: 16px; border-left: 3px solid #6366f1; background: #f5f5f7; border-radius: 4px;">{safe_message}</div>
  <p style="color: #888; font-size: 12px; margin-top: 24px;">Sent from swapnilmukherjee.dev · {request.client.host if request.client else 'unknown'}</p>
</body></html>"""

    if not RESEND_API_KEY:
        print("[contact] RESEND_API_KEY missing, message would have been:")
        print(json.dumps(payload.model_dump(), indent=2))
        return ContactResponse(ok=True, detail="Message received (dev mode, email not sent).")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": CONTACT_FROM_EMAIL,
                    "to": [CONTACT_TO_EMAIL],
                    "reply_to": payload.email,
                    "subject": f"[Portfolio] {safe_subject}",
                    "html": html,
                },
            )
        if r.status_code >= 400:
            print(f"[contact] Resend error {r.status_code}: {r.text}")
            raise HTTPException(status_code=502, detail="Email service rejected the request.")
    except httpx.HTTPError as exc:
        print(f"[contact] Resend transport error: {exc}")
        raise HTTPException(status_code=502, detail="Could not reach the email service.") from exc

    return ContactResponse(ok=True, detail="Thanks, your message is on its way.")


@app.get("/api/track")
def track(page: str = Query(default="home", min_length=1, max_length=64), request: Request = None) -> dict[str, Any]:
    boot_once()
    safe = re.sub(r"[^a-zA-Z0-9_\-/]", "", page)[:64] or "home"
    if not db_configured():
        return {"ok": True, "page": safe, "count": None, "stored": False}
    try:
        ua = request.headers.get("user-agent") if request else None
        ref = request.headers.get("referer") if request else None
        count = record_view(safe, user_agent=ua, referrer=ref)
        return {"ok": True, "page": safe, "count": count, "stored": True}
    except Exception as exc:
        print(f"[track] DB write failed: {exc}")
        return {"ok": True, "page": safe, "count": None, "stored": False}


@app.post("/api/track-project")
def track_project(payload: ProjectClickPayload) -> dict[str, Any]:
    boot_once()
    pid = re.sub(r"[^a-zA-Z0-9_\-]", "", payload.id)[:64]
    if not pid or not db_configured():
        return {"ok": True, "stored": False}
    try:
        count = record_project_click(pid)
        return {"ok": True, "id": pid, "count": count, "stored": True}
    except Exception as exc:
        print(f"[track-project] DB write failed: {exc}")
        return {"ok": True, "stored": False}


@app.get("/api/stats")
def stats() -> dict[str, Any]:
    boot_once()
    if not db_configured():
        return {"db": "json-only", "total_views": 0, "by_page": {}, "by_project": {}}
    try:
        return {"db": "connected", **db_get_stats()}
    except Exception as exc:
        print(f"[stats] DB read failed: {exc}")
        return {"db": "error", "total_views": 0, "by_page": {}, "by_project": {}}


@app.post("/api/admin/sync")
def admin_sync(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    """Manually re-sync content.json into Postgres. Token-gated."""
    if not ADMIN_TOKEN:
        raise HTTPException(status_code=503, detail="ADMIN_SYNC_TOKEN not configured")
    if authorization != f"Bearer {ADMIN_TOKEN}":
        raise HTTPException(status_code=401, detail="Unauthorized")
    if not db_configured():
        raise HTTPException(status_code=503, detail="Database not configured")
    try:
        ensure_schema()
        data = sync_content_from_file(CONTENT_PATH)
        return {"ok": True, "synced": len(data.get("projects", [])), "total_keys": list(data.keys())}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ---------------------------------------------------------------------------
# Local dev entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("index:app", host="0.0.0.0", port=8000, reload=True)
