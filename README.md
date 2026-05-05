# Swapnil Mukherjee — Portfolio

Personal portfolio for **Swapnil Mukherjee**, Technical Consultant at Okta.

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind + Framer Motion
- **Backend:** FastAPI (Python) on Vercel Serverless Functions
- **Database:** Vercel Postgres / Neon — **source of truth for content**
- **Email:** Resend (free tier)
- **Analytics:** Vercel Analytics + Postgres-backed counters
- **Hosting:** Vercel (Hobby tier covers everything)

```
.
├── api/                              FastAPI backend (Vercel Python function)
│   ├── content.json                  Mirror of content.json — only used as a seed
│   ├── db.py                         Postgres helpers (psycopg)
│   ├── index.py                      FastAPI app
│   └── requirements.txt
├── public/
│   ├── Swapnil_Mukherjee_Resume.pdf
│   └── headshot.jpg                  Drop your portrait here
├── scripts/
│   └── sync-content.mjs              Build-time hook: syncs content.json → Postgres
├── src/
│   ├── app/                          Next.js App Router (layout, page, sitemap, robots)
│   ├── components/
│   │   ├── spatial-stage.tsx         CSS-3D scene (lock cube + IAM satellites)
│   │   ├── nav.tsx                   Top bar + side rail
│   │   ├── hero.tsx                  Variable-weight headline + portrait card
│   │   ├── about.tsx                 3-pillar grid + manifesto
│   │   ├── experience.tsx            Sticky-num + cascading bullets per role
│   │   ├── projects.tsx              Filterable grid w/ cursor spotlight
│   │   ├── skills.tsx                Toolkit grid by category
│   │   ├── education.tsx             Education + In-progress / Earned certs
│   │   ├── contact.tsx               Form posting to /api/contact
│   │   └── footer.tsx
│   ├── data/content.json             Source content (committed in repo, synced to DB on build)
│   ├── data/content-types.ts         TypeScript schema
│   └── lib/content.ts                Server-only Postgres-first content loader
├── .env.example
├── next.config.mjs
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
└── README.md
```

---

## Architecture in one paragraph

`src/data/content.json` is the canonical source. On every Vercel build, the
**`prebuild` hook** (`scripts/sync-content.mjs`) writes that JSON into a
single-row Postgres table (`portfolio_content` keyed on `'main'`). At
runtime, **the home page is a React Server Component** that calls
`getContent()` (in `src/lib/content.ts`) which reads the row directly from
Postgres. The result is cached at the React/request level and revalidated
every 5 minutes by Next.js. Postgres is the source of truth at runtime;
JSON is only the build-time seed and the local-dev fallback. So the workflow
is still "edit JSON → commit → push", but production reads from the DB.

---

## 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: v4 spatial portfolio (Postgres-backed)"
git branch -M main
git remote add origin https://github.com/swapnilmukherjee/Portfolio.git
git push -u origin main --force
```

---

## 2 — Get a Resend API key

1. Sign up at https://resend.com (free tier: 3,000 emails/month).
2. **API Keys** → **Create API Key** → copy `re_...`.
3. Default `from` is Resend's sandbox `onboarding@resend.dev` — works without verifying a domain.

---

## 3 — Deploy on Vercel + connect Postgres

1. Go to https://vercel.com/new → Import the repo. Leave the build settings on auto-detect.
2. Project → **Storage → Create Database → Postgres**. Pick the same project. Vercel auto-injects:
   - `POSTGRES_URL` (pooled)
   - `POSTGRES_URL_NON_POOLING` (direct, used for writes during build)
   - …and a couple of extras you can ignore.
3. Add the Resend env vars under **Settings → Environment Variables**:

   | Name                  | Value                                     |
   | --------------------- | ----------------------------------------- |
   | `RESEND_API_KEY`      | `re_...`                                  |
   | `CONTACT_TO_EMAIL`    | `swapnilmukherjee.jobs@gmail.com`         |
   | `CONTACT_FROM_EMAIL`  | `Portfolio <onboarding@resend.dev>`       |
   | `ADMIN_SYNC_TOKEN`    | `openssl rand -hex 32` (optional)         |

4. **Redeploy.** The first build's `prebuild` step seeds the `portfolio_content` table. Subsequent deploys overwrite it with whatever's in `content.json`.
5. Project → **Analytics → Enable Web Analytics** (free).

> **Local dev without Postgres:** without `POSTGRES_URL`, `getContent()` falls back to reading `src/data/content.json` from disk. So `npm run dev` just works.

### Custom domain
Project → Settings → Domains → add yours.

---

## 4 — Local development

```bash
npm install
npm run dev          # http://localhost:3000  (uses JSON when POSTGRES_URL not set)
```

To run the FastAPI side locally:

```bash
cd api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python index.py      # http://localhost:8000  → docs at /api/docs
```

If you want to test the production-shaped flow end-to-end (Next.js + Python + DB), use `vercel dev`:

```bash
npm install -g vercel
vercel dev
```

---

## 5 — Updating content (the day-to-day workflow)

All copy lives in **`src/data/content.json`**. Edit it, then:

```bash
cp src/data/content.json api/content.json   # keep the FastAPI side in sync
git add . && git commit -m "Update content"
git push
```

Vercel auto-deploys. The `prebuild` script re-syncs `portfolio_content` in Postgres. Within ~5 minutes (or immediately on hard reload after the deploy completes), the live site reflects the change.

### Adding / flipping certifications

In `src/data/content.json`, find the `certifications` array. Each item:

```json
{ "name": "Auth0 Certified Developer", "issuer": "Okta · Auth0", "status": "in-progress", "expected": "May 2026" }
```

When you pass the exam, swap two fields:

```json
{ "name": "Auth0 Certified Developer", "issuer": "Okta · Auth0", "status": "earned" }
```

Same for CISSP. Commit, push — the cert moves from the dashed "In Progress" rail into the "Earned" grid automatically. No code changes needed.

### Updating your role

In the `experience` array, edit the `okta` entry's `role`, `period`, `summary`, `highlights`, and `tags`. Push.

---

## 6 — API endpoints

| Method | Path                  | Description                                            |
| ------ | --------------------- | ------------------------------------------------------ |
| GET    | `/api/health`         | Liveness + DB status                                   |
| GET    | `/api/content`        | Full portfolio content (Postgres-first, 503 if down)   |
| GET    | `/api/profile`        | Profile only                                           |
| GET    | `/api/experience`     | Experience list                                        |
| GET    | `/api/projects`       | Projects (`?category=Cybersecurity` filter)            |
| POST   | `/api/contact`        | Send a message via Resend                              |
| GET    | `/api/track`          | Increment a page-view counter (`?page=home`)           |
| POST   | `/api/track-project`  | Increment a project click (`{"id": "..."}`)            |
| GET    | `/api/stats`          | Aggregate analytics (views + project clicks)           |
| POST   | `/api/admin/sync`     | Manually re-sync `content.json` → Postgres (token-gated) |
| GET    | `/api/docs`           | Auto-generated OpenAPI docs                            |

---

## Design notes (v4)

- Pure black background, iridescent **violet → rose → cyan** as the only accent. No warm tones, no glass tint.
- A CSS-3D **glass padlock cube** is pinned to the viewport. Three IAM satellites — **key**, **shield**, **fingerprint** — orbit at independent radii and tilts. Section-driven camera presets (translate / rotate / blur / scale / opacity) reposition the cube as you scroll.
- Display headline is **variable-weight Inter**: ultra-thin (200) at the top of the page, animates to bold (700) as you scroll the first viewport. Same trick Apple uses on Vision Pro / iPhone Pro reveals.
- Glass primitives (`glass`, `glass-strong`) used on nav pills, theme toggle, certs, marquees.
- Dark + light themes share the gradient. Light mode: off-white `#f5f5f7` à la Apple.

---

## License

Personal portfolio. Code is fine for inspiration — copy whatever's useful.
