"""
Swapnil Mukherjee — Portfolio API
FastAPI backend deployed as a Vercel Serverless Function under /api.

Endpoints
---------
GET  /api/health        Liveness probe.
GET  /api/content       Full portfolio content (profile, experience, projects, etc.).
GET  /api/profile       Profile sub-tree only.
GET  /api/experience    Experience list.
GET  /api/projects      Projects list (optional ?category=).
POST /api/contact       Sends a contact-form email via Resend (or logs to console as fallback).
GET  /api/track         Increments a view counter (page=...) in /tmp.
GET  /api/stats         Aggregate view counts.
"""
from __future__ import annotations

import json
import os
import re
import time
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

ROOT = Path(__file__).resolve().parent
CONTENT_PATH = ROOT / "content.json"

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
CONTACT_TO_EMAIL = os.environ.get("CONTACT_TO_EMAIL", "swapnilmukherjee.jobs@gmail.com")
CONTACT_FROM_EMAIL = os.environ.get("CONTACT_FROM_EMAIL", "Portfolio <onboarding@resend.dev>")

# Vercel serverless functions get a writable /tmp; fall back to local path otherwise.
STATS_PATH = Path("/tmp/portfolio_stats.json") if Path("/tmp").exists() else ROOT / "stats.json"


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Swapnil Mukherjee — Portfolio API",
    version="1.0.0",
    description="Backend for swapnilmukherjee.dev — content, contact, and analytics.",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Same-origin in production via Vercel; relaxed for local dev.
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load_content() -> dict[str, Any]:
    if not CONTENT_PATH.exists():
        raise HTTPException(status_code=500, detail="content.json not found")
    with CONTENT_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


def load_stats() -> dict[str, int]:
    if not STATS_PATH.exists():
        return {}
    try:
        with STATS_PATH.open("r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return {}


def save_stats(stats: dict[str, int]) -> None:
    try:
        STATS_PATH.parent.mkdir(parents=True, exist_ok=True)
        with STATS_PATH.open("w", encoding="utf-8") as f:
            json.dump(stats, f)
    except OSError:
        # Best-effort; don't fail the request if /tmp is read-only.
        pass


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class ContactPayload(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    subject: str | None = Field(default=None, max_length=160)
    message: str = Field(..., min_length=10, max_length=5000)
    # Honeypot — humans leave this empty; bots tend to fill every field.
    website: str | None = Field(default=None, max_length=200)


class ContactResponse(BaseModel):
    ok: bool
    detail: str


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health() -> dict[str, Any]:
    return {"ok": True, "ts": int(time.time())}


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
    # Honeypot: if filled, silently accept and drop.
    if payload.website:
        return ContactResponse(ok=True, detail="Thanks!")

    # Light sanitization for the email body.
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
        # No key configured: log and accept so local dev still works.
        print("[contact] RESEND_API_KEY missing — message would have been:")
        print(json.dumps(payload.model_dump(), indent=2))
        return ContactResponse(ok=True, detail="Message received (dev mode — email not sent).")

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

    return ContactResponse(ok=True, detail="Thanks — your message is on its way.")


@app.get("/api/track")
def track(page: str = Query(default="home", min_length=1, max_length=64)) -> dict[str, Any]:
    safe = re.sub(r"[^a-zA-Z0-9_\-/]", "", page)[:64] or "home"
    stats = load_stats()
    stats[safe] = int(stats.get(safe, 0)) + 1
    stats["__total__"] = int(stats.get("__total__", 0)) + 1
    save_stats(stats)
    return {"ok": True, "page": safe, "count": stats[safe]}


@app.get("/api/stats")
def stats() -> dict[str, Any]:
    return {"counts": load_stats()}


# ---------------------------------------------------------------------------
# Local dev entry point — `python api/index.py`
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("index:app", host="0.0.0.0", port=8000, reload=True)
