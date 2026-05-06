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
│   └── sync-content.mjs              Build-time hook: seeds content.json into Postgres when empty
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
│   ├── data/content.json             Seed content and local-dev fallback
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

Postgres is the live content source. The `/admin` CMS edits the single
`portfolio_content` row keyed on `main`, and the homepage reads that row
through `getContent()` in `src/lib/content.ts`. `src/data/content.json` is a
seed and local-dev fallback. The `prebuild` hook (`scripts/sync-content.mjs`)
only seeds Postgres when the row is empty, so future deploys do not overwrite
CMS edits.

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
   | `ADMIN_SYNC_TOKEN`    | `openssl rand -hex 32`                    |

4. **Redeploy.** The first build's `prebuild` step seeds the `portfolio_content` table. After that, use `/admin` to edit content.
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

## 5 — Updating content in the CMS

Open:

```text
https://your-domain.com/admin
```

Sign in with `ADMIN_SYNC_TOKEN`. The CMS lets you edit:

- Profile, hero copy, about copy, social links, resume path, and contact details
- Highlights and metrics
- Work experience, bullets, tags, role dates, and locations
- Skills and skill groups
- Education and certifications
- Projects, categories, descriptions, icons, colors, and tags

Click **Save content**. In Vercel, saves go to Postgres and the homepage is
revalidated immediately. Locally, if no Postgres URL is configured, saves write
to `src/data/content.json` and `api/content.json`.

### Local JSON fallback

```bash
npm run dev
# visit http://localhost:3000/admin
# local fallback token is: dev-admin, unless ADMIN_SYNC_TOKEN is set
```

If you edit JSON by hand, keep both files in sync:

```bash
cp src/data/content.json api/content.json
```

### Certifications

In the CMS, set a certification to `In progress` and fill `Expected`, or set it
to `Earned`. The site automatically places it in the right section.

### Important

Do not call `/api/admin/sync` after making CMS edits unless you intentionally
want to overwrite Postgres from the bundled JSON seed.
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
| POST   | `/api/admin/sync`     | Emergency JSON seed sync into Postgres (token-gated)     |
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
