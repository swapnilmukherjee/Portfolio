# Swapnil Mukherjee — Portfolio

Personal portfolio for **Swapnil Mukherjee**, Technical Consultant at Okta.

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion
- **Backend:** FastAPI (Python) on Vercel Serverless Functions
- **Hosting:** Vercel (Hobby tier is more than enough)
- **Email:** Resend (free tier)
- **Analytics:** Vercel Analytics (free) + a lightweight `/api/track` counter

```
.
├── api/                          FastAPI backend — runs as Vercel Python function
│   ├── content.json              Mirror of web content for /api/* endpoints
│   ├── index.py                  FastAPI app — /api/health, /api/contact, /api/track, ...
│   └── requirements.txt
├── public/
│   └── Swapnil_Mukherjee_Resume.pdf
├── src/
│   ├── app/                      Next.js App Router (layout, page, sitemap, robots)
│   ├── components/               Hero, About, Experience, Projects, Skills, Contact, ...
│   ├── data/content.json         Single source of truth for portfolio content
│   └── lib/                      Utilities (cn, icons)
├── .env.example
├── .eslintrc.json
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
└── README.md
```

---

## 1 — Push to GitHub

From the project root:

```bash
git init
git add .
git commit -m "Initial commit: Next.js + FastAPI portfolio"
git branch -M main
git remote add origin https://github.com/swapnilmukherjee/Portfolio.git   # or a fresh repo
git push -u origin main --force                                           # --force because the existing repo will be replaced
```

If you want to keep the old portfolio's git history, create a new repo (e.g. `Portfolio-v2`) instead and push there.

---

## 2 — Get a Resend API key (for the contact form)

1. Sign up at https://resend.com (free tier: 3,000 emails/month, 100/day).
2. **API Keys** → **Create API Key** → copy the value (starts with `re_`).
3. By default the app sends from Resend's sandbox address `onboarding@resend.dev`, which goes straight to your verified inbox — fine for personal use. To send from your own domain, verify it under **Domains** in Resend, then update `CONTACT_FROM_EMAIL` (see below).

---

## 3 — Deploy on Vercel

1. Go to https://vercel.com/new and import the GitHub repo.
2. Vercel will auto-detect **Next.js** at the repo root. Leave all the build settings on their defaults — `vercel.json` handles the Python function configuration.
3. Add the following **Environment Variables** (Project → Settings → Environment Variables):

   | Name                  | Value                                          |
   | --------------------- | ---------------------------------------------- |
   | `RESEND_API_KEY`      | `re_...` (from step 2)                         |
   | `CONTACT_TO_EMAIL`    | `swapnilmukherjee.jobs@gmail.com`              |
   | `CONTACT_FROM_EMAIL`  | `Portfolio <onboarding@resend.dev>`            |

4. Click **Deploy**. First build takes ~1–2 minutes.
5. Once it's live, in Project → **Analytics**, click **Enable Web Analytics** (free).

That's it — your portfolio is live at `https://<project-name>.vercel.app`.

### Custom domain (optional)
Project → **Settings** → **Domains** → add yours. Vercel will give you the DNS records to add at your registrar.

---

## 4 — Local development

You'll want **Node 18+** and **Python 3.11+**.

The simplest local workflow is `vercel dev`, which runs Next.js and the Python API together at `http://localhost:3000`:

```bash
npm install -g vercel
npm install
vercel dev                # http://localhost:3000  (Next.js + /api/* both work)
```

If you'd rather run them separately:

```bash
# Frontend
npm install
npm run dev               # http://localhost:3000

# Backend (second terminal)
cd api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python index.py           # http://localhost:8000  → docs at /api/docs
```

For the contact form to actually send email locally, copy `.env.example` to `.env.local`. Without `RESEND_API_KEY`, the API logs the message to stdout and returns success — fine for testing the UI flow.

---

## 5 — Updating content

All copy lives in **two synchronized files**:

- `src/data/content.json`  — used by the frontend
- `api/content.json`        — used by the backend's `/api/content` endpoint

After editing `src/data/content.json`:

```bash
cp src/data/content.json api/content.json
git add . && git commit -m "Update content" && git push
```

Vercel auto-deploys on push.

---

## 6 — API endpoints

| Method | Path              | Description                                              |
| ------ | ----------------- | -------------------------------------------------------- |
| GET    | `/api/health`     | Liveness probe                                           |
| GET    | `/api/content`    | Full portfolio content                                   |
| GET    | `/api/profile`    | Profile only                                             |
| GET    | `/api/experience` | Experience list                                          |
| GET    | `/api/projects`   | Projects (optional `?category=Cybersecurity`)            |
| POST   | `/api/contact`    | Send a message (name, email, subject?, message)          |
| GET    | `/api/track`      | Increment a page-view counter (`?page=home`)             |
| GET    | `/api/stats`      | Read aggregate counters                                  |
| GET    | `/api/docs`       | Auto-generated OpenAPI docs (FastAPI)                    |

The resume PDF is served as a static asset at `/Swapnil_Mukherjee_Resume.pdf`.

---

## License
Personal portfolio. Code is fine for inspiration — copy whatever's useful.
Vercel staging deployment trigger.
