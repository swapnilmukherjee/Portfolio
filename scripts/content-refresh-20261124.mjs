/**
 * One-time content refresh (v5.1): tighter, metric-led copy from the Nov 2026
 * resume, Seattle location, new resume PDF, Auth0 Certified Developer first.
 *
 * Applies field by field to the CMS rows 'main' and 'draft'. Anything not named
 * here (custom projects, images, links, ordering) is left exactly as it is, and
 * the previous row is stored in portfolio_content_migrations for rollback.
 *
 *   node scripts/content-refresh-20261124.mjs          apply to Postgres (build)
 *   node scripts/content-refresh-20261124.mjs --json   apply to src/data/content.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MIGRATION = "content-refresh-2026-11-24";

const PROFILE = {
  headline: "I migrate hundreds of millions of users between identity platforms with zero unplanned login downtime.",
  about:
    "Five years building identity for banks, hospitals and SaaS. At Okta I lead Auth0 rollouts and migrations, including one that moved a combined 200 million users with zero unplanned downtime. I also advise teams on how AI agents should sign in, get scoped access and ask for consent.",
  shortBio: "Technical Consultant at Okta in Seattle. Auth0, CIAM and identity for AI agents, with a 200M+ user migration behind me.",
  location: "Seattle, WA",
  availability: "Based in Seattle, WA and not open to relocation. Happy to talk identity architecture, CIAM, or securing AI agents.",
  resume: "/Swapnil_Mukherjee_Resume.pdf",
};

const HIGHLIGHTS = [
  { label: "Users migrated", value: "200M+", detail: "Public to private Auth0 cloud, zero unplanned login downtime" },
  { label: "Workforce identities", value: "22,000+", detail: "Run on Okta for a global healthcare company" },
  { label: "Apps federated", value: "100+", detail: "Moved off CA SiteMinder, leading 8 engineers" },
  { label: "Years in identity", value: "5", detail: "Auth0 and Okta across banking, healthcare and SaaS" },
];

const EXPERIENCE = {
  okta: {
    location: "Seattle, WA · Remote",
    summary: "I lead Auth0 deployments and migrations for enterprise customers and am the go-to on Auth0 for AI Agents.",
    highlights: [
      "Led a combined 200M+ user migration from public to private Auth0 cloud with phased cutover and zero unplanned downtime to login and MFA.",
      "Run onboarding workshops on Universal Login, Organizations, Actions, MFA, Passkeys and Attack Protection for web, mobile and API teams.",
      "Advise customers on identity for AI agents: token vaulting, scoped delegation, machine to machine auth and consent.",
      "Wrote migration playbooks and reference builds that the consulting org now uses to onboard customers faster.",
    ],
    tags: ["Auth0", "Auth0 for AI Agents", "CIAM", "OAuth 2.0", "OIDC", "Passkeys"],
  },
  "fifth-third": {
    role: "Security Engineer II, CIAM",
    summary: "Owned production Auth0 for Newline, Fifth Third's commercial banking platform, and planned its move to a new identity platform.",
    highlights: [
      "Stood up and ran the production Auth0 tenant for external banking customers and internal staff.",
      "Designed SSO, adaptive MFA and step-up flows over OAuth 2.0, OIDC and SAML, tuned to commercial banking risk.",
      "Built Auth0 Actions, Rules and Hooks for token enrichment, registration, credential recovery and risk checks.",
      "Moved identity config to Terraform with GitHub and Jenkins CI/CD and watched auth health in Splunk and Dynatrace, cutting incidents and audit findings.",
    ],
    tags: ["Auth0", "CIAM", "Adaptive MFA", "OAuth 2.0", "SAML", "Terraform"],
  },
  cardinal: {
    summary: "Okta lead for 22,000+ healthcare workforce identities. Ran the move off CA SiteMinder.",
    highlights: [
      "Led 8 engineers migrating from CA SiteMinder to Okta, federating 100+ B2E, B2B and B2C apps.",
      "Designed SSO with SAML 2.0, OIDC and OAuth 2.0 across on-prem and cloud apps, aligned to SOC 2, ISO 27001 and HIPAA.",
      "Ran SailPoint IdentityIQ joiner, mover and leaver workflows and worked with CyberArk teams to cut orphaned admin access.",
      "Rolled out MFA and adaptive MFA across legacy and cloud platforms.",
    ],
    tags: ["Okta", "SailPoint IIQ", "CyberArk", "SAML", "MFA", "HIPAA"],
  },
  nokia: {
    summary: "Two-month internship building automation and internal tools for network operations.",
    highlights: [
      "Wrote JavaScript and Python scripts and internal APIs that sped up deployments and environment setup.",
      "Added logging, health checks and credential handling to internal tools. My first real security work.",
    ],
  },
};

const PROJECTS = {
  "project-movzuup5": {
    summary: "B2B admin console where four roles see different things, enforced by Auth0 RBAC and permission-checked APIs.",
    description:
      "A multi-tenant admin console that shows how B2B SaaS authorization should work with Auth0. Users sign in through branded Universal Login and get one of four roles: Tenant Admin, Security Analyst, Billing Manager or Viewer.\n\nEvery API route checks permissions from the access token and returns an explicit allow or deny, so you can watch authorization decisions happen. A Token Inspector shows the session, granted permissions and custom claims from an Auth0 Action without exposing raw tokens.\n\nRuns on Vercel with separate staging and production tenants. Next up: Organizations, MFA and Management API tenant admin.",
  },
  tripshare: {
    summary: "Carpool matching that pairs travelers on overlapping routes to split cost and cut emissions.",
    description:
      "Matches travelers whose itineraries overlap so they can share a ride. I built registration, the trip matching logic and a CMS-backed admin layer, shaped by persona research, and shipped it through a CI/CD pipeline.",
  },
  "fast-fuzzer": {
    summary: "Extended the SAFIREFUZZ firmware fuzzer to find gaps between what a spec says and what the code does.",
    description:
      "Firmware drifts from its specification. I extended the SAFIREFUZZ framework to combine signals from the spec, the code and the existing test suite, so the fuzzer goes after those blind spots. Fixed core bugs along the way and added support for legacy systems.",
  },
  pizzeria: {
    summary: "Java and SQL backend that runs orders and inventory for a simulated pizza chain.",
    description:
      "An object-oriented Java backend over a normalized SQL schema on AWS RDS. Handles dine-in, pickup and delivery orders and keeps inventory in sync as orders come in.",
  },
  drown: {
    summary: "Ran the DROWN attack on an SSLv2 server, recovered its RSA private key, then shut the hole.",
    description:
      "DROWN abuses servers that still speak SSLv2 to break modern TLS. I used SSLv2 as an oracle to recover the server's RSA private key, showed what that exposes, then applied and verified the mitigations.",
  },
  "space-hangman": {
    summary: "Space-themed hangman on Flask, wired to several external APIs.",
    description:
      "Classic hangman with a space theme. Flask backend, HTML5 and CSS frontend, and several external APIs feeding the game so rounds stay fresh.",
  },
  sysmon: {
    summary: "Python CLI that tracks CPU, memory and network in real time and flags anomalies.",
    description:
      "Collects system metrics with psutil, plots them live with matplotlib and raises an alert when CPU, memory or network activity crosses a threshold.",
  },
  voicerx: {
    summary: "Alexa voice interface that lets clinicians update medical records hands free.",
    description:
      "Clinicians lose hours to data entry. VoiceRx lets them read and update electronic medical records by talking to Amazon Alexa, taking the clicks out of routine updates.",
  },
  healthfit: {
    summary: "REST API that turns a weight goal into a daily calorie target.",
    description:
      "A Python REST service that takes a user's weight goal and returns a daily calorie target based on published nutrition research. Endpoints are secured with OAuth.",
  },
  tweetfeel: {
    summary: "RNN sentiment model that reads the emotion behind tweets.",
    description: "A full NLP pipeline: cleaning, embeddings and a recurrent neural network that classifies the emotion behind each tweet.",
  },
  "neural-style": {
    summary: "Deep learning app that repaints a photo in the style of another image.",
    description:
      "Neural style transfer in Python. A network optimizes a new image to keep the content of one photo and the style of another. I also explored its use in art therapy.",
  },
  "iot-automation": {
    summary: "NodeMCU firmware that puts ordinary appliances on Wi-Fi at low cost.",
    description:
      "A NodeMCU board and a relay, driven by Java firmware, switch regular household appliances over Wi-Fi. A cheap retrofit instead of buying new smart devices.",
  },
  fraud: {
    summary: "KNN fraud detector tuned for heavily imbalanced credit card data.",
    description:
      "Fraud is rare, which makes it easy to miss. I built a K-Nearest Neighbors classifier with custom features and tuned distance metrics, and judged it on precision and recall instead of accuracy to catch as much fraud as possible.",
  },
};

const SKILL_ADDS = {
  "CIAM & Customer Identity": ["Passkeys"],
  "Protocols & Authorization": ["FAPI 2.0", "DPoP", "PKCE"],
};

/** Replace em dashes in free text. En dashes in date ranges stay. */
function noEmDash(value) {
  if (typeof value === "string") return value.replace(/\s*—\s*/g, ", ");
  if (Array.isArray(value)) return value.map(noEmDash);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, noEmDash(v)]));
  return value;
}

export function refresh(input) {
  const data = structuredClone(input);
  data.profile = { ...(data.profile || {}), ...PROFILE };
  data.highlights = HIGHLIGHTS;

  if (Array.isArray(data.experience)) {
    data.experience = data.experience.map((e) => (EXPERIENCE[e?.id] ? { ...e, ...EXPERIENCE[e.id] } : e));
  }
  if (Array.isArray(data.projects)) {
    data.projects = data.projects.map((p) => (PROJECTS[p?.id] ? { ...p, ...PROJECTS[p.id] } : p));
  }
  if (Array.isArray(data.skills)) {
    data.skills = data.skills.map((g) => {
      const add = SKILL_ADDS[g?.category];
      if (!add) return g;
      const items = Array.isArray(g.items) ? g.items : [];
      return { ...g, items: [...items, ...add.filter((x) => !items.includes(x))] };
    });
  }

  const certs = Array.isArray(data.certifications) ? data.certifications.filter((c) => c && c.status !== "in-progress") : [];
  const isAuth0Dev = (c) => /auth0 certified developer/i.test(c.name || "");
  const auth0 = certs.find(isAuth0Dev) || { name: "Auth0 Certified Developer", issuer: "Okta", status: "earned" };
  data.certifications = [{ ...auth0, issuer: "Okta", status: "earned" }, ...certs.filter((c) => !isAuth0Dev(c))];

  return noEmDash(data);
}

async function applyToPostgres() {
  const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!url) {
    console.log("[content-refresh] No database configured; bundled content is current.");
    return;
  }
  const { default: pg } = await import("pg");
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    await client.query("BEGIN");
    await client.query(
      `CREATE TABLE IF NOT EXISTS portfolio_content_migrations (id TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), previous_content JSONB NOT NULL)`,
    );
    const done = await client.query("SELECT id FROM portfolio_content_migrations WHERE id=$1", [MIGRATION]);
    if (done.rowCount) {
      console.log("[content-refresh] Already applied; preserving current CMS content.");
    } else {
      const { rows } = await client.query("SELECT key, data FROM portfolio_content WHERE key IN ('main','draft') FOR UPDATE");
      for (const row of rows) {
        await client.query("INSERT INTO portfolio_content_migrations (id, previous_content) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO NOTHING", [
          `${MIGRATION}:${row.key}`,
          JSON.stringify(row.data),
        ]);
        await client.query("UPDATE portfolio_content SET data=$1::jsonb, updated_at=NOW() WHERE key=$2", [JSON.stringify(refresh(row.data)), row.key]);
        console.log(`[content-refresh] Updated '${row.key}'.`);
      }
      await client.query("INSERT INTO portfolio_content_migrations (id, previous_content) VALUES ($1, '{}'::jsonb)", [MIGRATION]);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("[content-refresh] Failed; no content changes committed.", error?.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  if (process.argv.includes("--json")) {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
    for (const rel of ["src/data/content.json", "api/content.json"]) {
      const file = resolve(root, rel);
      let raw;
      try {
        raw = readFileSync(file, "utf-8");
      } catch {
        continue;
      }
      writeFileSync(file, JSON.stringify(refresh(JSON.parse(raw)), null, 2) + "\n");
      console.log(`[content-refresh] Wrote ${rel}`);
    }
  } else {
    await applyToPostgres();
  }
}
