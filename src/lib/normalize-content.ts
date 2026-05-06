/**
 * Pure content normalization — no server-only imports, no next/headers.
 * Safe to import from both content.ts and admin-content.ts.
 */
import fallbackJson from "@/data/content.json";

import type {
  AboutStat,
  Certification,
  Content,
  Education,
  Experience,
  Highlight,
  Profile,
  Project,
  SiteCopy,
  SkillGroup,
} from "@/data/content-types";

const FALLBACK_CONTENT = fallbackJson as Content;

// ── Primitive helpers ──────────────────────────────────────────────────────

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function nullableStringValue(value: unknown) {
  if (value === null) return null;
  return typeof value === "string" ? value : null;
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function arrayValue<T>(
  value: unknown,
  fallback: T[],
  normalizer: (item: unknown, fallbackItem?: T) => T,
) {
  if (!Array.isArray(value)) return fallback;
  return value.map((item, index) => normalizer(item, fallback[index])).filter(Boolean);
}

// ── Section normalizers ────────────────────────────────────────────────────

function normalizeProfile(value: unknown): Profile {
  const input = asRecord(value);
  const fallback = FALLBACK_CONTENT.profile;
  const socials = asRecord(input.socials);
  return {
    name: stringValue(input.name, fallback.name),
    firstName: stringValue(input.firstName, fallback.firstName),
    title: stringValue(input.title, fallback.title),
    tagline: stringValue(input.tagline, fallback.tagline),
    headline: stringValue(input.headline, fallback.headline),
    shortBio: stringValue(input.shortBio, fallback.shortBio),
    about: stringValue(input.about, fallback.about),
    location: stringValue(input.location, fallback.location),
    email: stringValue(input.email, fallback.email),
    publicEmail: stringValue(input.publicEmail, fallback.publicEmail),
    phone: stringValue(input.phone, fallback.phone),
    availability: stringValue(input.availability, fallback.availability),
    socials: {
      github: stringValue(socials.github, fallback.socials.github),
      linkedin: stringValue(socials.linkedin, fallback.socials.linkedin),
      email: stringValue(socials.email, fallback.socials.email),
    },
    resume: stringValue(input.resume, fallback.resume),
    ...(input.headshotUrl ? { headshotUrl: stringValue(input.headshotUrl, "") } : {}),
  };
}

function normalizeHighlight(value: unknown, fallback?: Highlight): Highlight {
  const input = asRecord(value);
  return {
    label: stringValue(input.label, fallback?.label),
    value: stringValue(input.value, fallback?.value),
    detail: stringValue(input.detail, fallback?.detail),
  };
}

function normalizeSkill(value: unknown, fallback?: SkillGroup): SkillGroup {
  const input = asRecord(value);
  return {
    category: stringValue(input.category, fallback?.category),
    icon: stringValue(input.icon, fallback?.icon),
    items: stringArray(input.items),
  };
}

function normalizeExperience(value: unknown, fallback?: Experience): Experience {
  const input = asRecord(value);
  return {
    id: stringValue(input.id, fallback?.id),
    role: stringValue(input.role, fallback?.role),
    company: stringValue(input.company, fallback?.company),
    contractInfo: nullableStringValue(input.contractInfo),
    logo: stringValue(input.logo, fallback?.logo),
    period: stringValue(input.period, fallback?.period),
    location: stringValue(input.location, fallback?.location),
    type: stringValue(input.type, fallback?.type),
    color: stringValue(input.color, fallback?.color),
    accent: stringValue(input.accent, fallback?.accent),
    summary: stringValue(input.summary, fallback?.summary),
    highlights: stringArray(input.highlights),
    tags: stringArray(input.tags),
  };
}

function normalizeEducation(value: unknown, fallback?: Education): Education {
  const input = asRecord(value);
  return {
    id: stringValue(input.id, fallback?.id),
    school: stringValue(input.school, fallback?.school),
    degree: stringValue(input.degree, fallback?.degree),
    period: stringValue(input.period, fallback?.period),
    location: stringValue(input.location, fallback?.location),
    accent: stringValue(input.accent, fallback?.accent),
  };
}

function normalizeCertification(value: unknown, fallback?: Certification): Certification {
  const input = asRecord(value);
  const status = input.status === "in-progress" ? "in-progress" : "earned";
  const cert: Certification = {
    name: stringValue(input.name, fallback?.name),
    issuer: stringValue(input.issuer, fallback?.issuer),
    status,
  };
  const issued = stringValue(input.issued, fallback?.issued);
  const expected = stringValue(input.expected, fallback?.expected);
  if (issued) cert.issued = issued;
  if (expected) cert.expected = expected;
  return cert;
}

function normalizeProject(value: unknown, fallback?: Project): Project {
  const input = asRecord(value);
  const project: Project = {
    id: stringValue(input.id, fallback?.id),
    title: stringValue(input.title, fallback?.title),
    date: stringValue(input.date, fallback?.date),
    category: stringValue(input.category, fallback?.category),
    icon: stringValue(input.icon, fallback?.icon),
    color: stringValue(input.color, fallback?.color),
    summary: stringValue(input.summary, fallback?.summary),
    description: stringValue(input.description, fallback?.description),
    tags: stringArray(input.tags),
  };
  if (input.imageUrl) project.imageUrl = stringValue(input.imageUrl, "");
  return project;
}

export function normalizeAboutStat(value: unknown, fallback?: AboutStat): AboutStat {
  const input = asRecord(value);
  return {
    key: stringValue(input.key, fallback?.key),
    value: stringValue(input.value, fallback?.value),
    sub: stringValue(input.sub, fallback?.sub),
  };
}

export const FALLBACK_SITE_COPY: SiteCopy =
  (FALLBACK_CONTENT as unknown as { siteCopy?: SiteCopy }).siteCopy ?? {
    heroStatus: "Okta · Identity & CIAM",
    aboutHeading: "The identity layer\nbehind",
    aboutHeadingBold: "modern apps.",
    aboutSubheading:
      "Five years operating customer and workforce identity at scale. Now on the platform side at Okta, including the new patterns AI agents demand.",
    aboutStats: [
      { key: "Now", value: "Technical Consultant", sub: "Okta · Auth0" },
      { key: "Specialty", value: "Auth0 & CIAM", sub: "OAuth · OIDC · SAML" },
      { key: "Frontier", value: "Auth0 for AI Agents", sub: "Identity for agentic workflows" },
    ],
    experienceHeading: "Five years,",
    experienceHeadingBold: "three chapters.",
    experienceSubheading:
      "Healthcare IAM, CIAM in financial services, and now Auth0 platform consulting at Okta.",
    projectsHeading: "Selected",
    projectsHeadingBold: "work.",
    projectsSubheading:
      "A mix of identity, security research, and full-stack engineering, built across grad school and personal time.",
    skillsHeading: "What I",
    skillsHeadingBold: "reach for.",
    skillsSubheading: "The protocols, platforms, and tools I use day-to-day.",
  };

export function normalizeSiteCopy(value: unknown): SiteCopy {
  const input = asRecord(value);
  const fb = FALLBACK_SITE_COPY;
  return {
    heroStatus: stringValue(input.heroStatus, fb.heroStatus),
    aboutHeading: stringValue(input.aboutHeading, fb.aboutHeading),
    aboutHeadingBold: stringValue(input.aboutHeadingBold, fb.aboutHeadingBold),
    aboutSubheading: stringValue(input.aboutSubheading, fb.aboutSubheading),
    aboutStats: arrayValue(input.aboutStats, fb.aboutStats, normalizeAboutStat),
    experienceHeading: stringValue(input.experienceHeading, fb.experienceHeading),
    experienceHeadingBold: stringValue(input.experienceHeadingBold, fb.experienceHeadingBold),
    experienceSubheading: stringValue(input.experienceSubheading, fb.experienceSubheading),
    projectsHeading: stringValue(input.projectsHeading, fb.projectsHeading),
    projectsHeadingBold: stringValue(input.projectsHeadingBold, fb.projectsHeadingBold),
    projectsSubheading: stringValue(input.projectsSubheading, fb.projectsSubheading),
    skillsHeading: stringValue(input.skillsHeading, fb.skillsHeading),
    skillsHeadingBold: stringValue(input.skillsHeadingBold, fb.skillsHeadingBold),
    skillsSubheading: stringValue(input.skillsSubheading, fb.skillsSubheading),
  };
}

export function normalizeContent(value: unknown): Content {
  const input = asRecord(value);
  return {
    profile: normalizeProfile(input.profile),
    highlights: arrayValue(input.highlights, FALLBACK_CONTENT.highlights, normalizeHighlight),
    skills: arrayValue(input.skills, FALLBACK_CONTENT.skills, normalizeSkill),
    experience: arrayValue(input.experience, FALLBACK_CONTENT.experience, normalizeExperience),
    education: arrayValue(input.education, FALLBACK_CONTENT.education, normalizeEducation),
    certifications: arrayValue(input.certifications, FALLBACK_CONTENT.certifications, normalizeCertification),
    projects: arrayValue(input.projects, FALLBACK_CONTENT.projects, normalizeProject),
    siteCopy: normalizeSiteCopy(input.siteCopy),
  };
}
