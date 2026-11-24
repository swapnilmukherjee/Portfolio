import type { Certification, Experience, Project } from "@/data/content-types";

/**
 * Links each skill to the jobs, projects and certifications that mention it.
 * Matching is done against the content itself, so edits in the admin stay in sync.
 * Aliases cover the ways the same skill is written across the resume.
 */
const ALIASES: Record<string, string[]> = {
  "OAuth 2.0": ["OAuth"],
  "OpenID Connect": ["OIDC"],
  "SAML 2.0": ["SAML"],
  "Single Sign-On": ["SSO"],
  "Okta Customer Identity": ["CIAM"],
  "Okta Workforce Identity": ["Okta"],
  "Actions / Rules / Hooks": ["Actions", "Rules", "Hooks"],
  "Lifecycle Management": ["joiner", "lifecycle"],
  "SailPoint IdentityIQ": ["SailPoint"],
  "CyberArk PAM": ["CyberArk"],
  "Joiner-Mover-Leaver": ["joiner"],
  "JWT": ["token enrichment"],
  "Token Design": ["token enrichment", "token vaulting"],
  "API Authorization": ["API Security", "Authorization", "machine to machine"],
  "IAM for AI Agents": ["AI agents"],
  "Agent Authorization": ["scoped delegation"],
  "Delegated Access": ["delegation"],
  "Consent Patterns": ["consent"],
  "Fine-Grained Access": ["fine-grained"],
  "Adaptive Access": ["adaptive MFA", "risk checks"],
  "REST APIs": ["REST", "APIs"],
  "GitHub Actions": ["GitHub"],
  "CI/CD for IAM Config": ["CI/CD"],
  "Audit Logging": ["logging", "audit"],
};

/** Jobs a skill should not link to, where the alias would only match the employer name. */
const SKIP_JOBS: Record<string, string[]> = { "Okta Workforce Identity": ["okta"] };

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function skillPattern(skill: string): RegExp {
  const terms = [skill, ...(ALIASES[skill] ?? [])].sort((a, b) => b.length - a.length);
  return new RegExp(`(?<![\\w])(?:${terms.map(esc).join("|")})(?![\\w])`, "i");
}

export type JobProof = { id: string; company: string; period: string; line: string; /** Matched only through the role's stack tags. */ viaTag: boolean };
export type Evidence = {
  jobs: JobProof[];
  projects: Pick<Project, "id" | "title">[];
  certs: string[];
  score: number;
};

export function evidenceFor(
  skill: string,
  experience: Experience[],
  projects: Project[],
  certifications: Certification[],
): Evidence {
  const re = skillPattern(skill);
  const test = (s?: string | null) => !!s && re.test(s);

  const jobs: JobProof[] = [];
  for (const e of experience) {
    // The Okta job is about Auth0; "Okta" there is the employer, not the workforce product.
    if (SKIP_JOBS[skill]?.includes(e.id)) continue;
    const line = e.highlights.find(test) ?? (test(e.summary) ? e.summary : null);
    if (line) jobs.push({ id: e.id, company: e.company, period: e.period, line, viaTag: false });
    else if (e.tags.some(test)) jobs.push({ id: e.id, company: e.company, period: e.period, line: e.summary, viaTag: true });
  }

  const projs = projects
    .filter((p) => p.tags.some(test) || test(p.summary) || test(p.description))
    .map(({ id, title }) => ({ id, title }));

  const certs = certifications.filter((c) => c.status !== "in-progress" && test(c.name)).map((c) => c.name);

  return { jobs, projects: projs, certs, score: jobs.length * 2 + projs.length + certs.length };
}

/** "OpenID Connect" -> "openid_connect", the way it would read inside a scope claim. */
export const scopeSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9.]+/g, "_").replace(/^_|_$/g, "");
