"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowDown,
  ArrowUp,
  Award,
  BriefcaseBusiness,
  ChevronDown,
  Clock,
  Copy,
  FileJson,
  GraduationCap,
  IdCard,
  ImagePlus,
  ListChecks,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Type,
  Wrench,
} from "lucide-react";

import type {
  AboutStat,
  Certification,
  Content,
  Education,
  Experience,
  Highlight,
  Project,
  SiteCopy,
  SkillGroup,
} from "@/data/content-types";
import type { ChangelogEntry } from "@/lib/admin-content";

type AdminEditorProps = {
  initialContent: Content;
  saveAction: (formData: FormData) => void | Promise<void>;
  saveDraftAction: (formData: FormData) => void | Promise<void>;
  storageLabel: string;
  hasDraft: boolean;
  changelog: ChangelogEntry[];
};

type TabId = "profile" | "sitecopy" | "highlights" | "experience" | "skills" | "education" | "certifications" | "projects" | "json" | "changelog";
type ListKey = "highlights" | "experience" | "skills" | "education" | "certifications" | "projects";

const tabs: Array<{ id: TabId; label: string; icon: typeof IdCard }> = [
  { id: "profile", label: "Profile", icon: IdCard },
  { id: "sitecopy", label: "Site copy", icon: Type },
  { id: "highlights", label: "Highlights", icon: Sparkles },
  { id: "experience", label: "Experience", icon: BriefcaseBusiness },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "projects", label: "Projects", icon: ListChecks },
  { id: "json", label: "JSON", icon: FileJson },
  { id: "changelog", label: "Changelog", icon: Clock },
];

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`;
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function AdminEditor({ initialContent, saveAction, saveDraftAction, storageLabel, hasDraft, changelog }: AdminEditorProps) {
  const [content, setContent] = useState<Content>(initialContent);
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [copied, setCopied] = useState(false);

  const serialized = useMemo(() => JSON.stringify(content), [content]);
  const prettyJson = useMemo(() => JSON.stringify(content, null, 2), [content]);
  const initialSnapshot = useMemo(() => JSON.stringify(initialContent), [initialContent]);
  const isDirty = serialized !== initialSnapshot;

  function resetContent() {
    setContent(initialContent);
  }

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(prettyJson);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  function moveListItem(key: ListKey, index: number, direction: -1 | 1) {
    setContent((current) => {
      const list = [...(current[key] as unknown[])];
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= list.length) return current;
      const [item] = list.splice(index, 1);
      list.splice(nextIndex, 0, item);
      return { ...current, [key]: list } as Content;
    });
  }

  function removeListItem(key: ListKey, index: number) {
    setContent((current) => {
      const list = [...(current[key] as unknown[])];
      list.splice(index, 1);
      return { ...current, [key]: list } as Content;
    });
  }

  function duplicateListItem(key: ListKey, index: number) {
    setContent((current) => {
      const list = [...(current[key] as unknown[])];
      const item = list[index];
      const duped =
        typeof item === "object" && item !== null
          ? { ...(item as Record<string, unknown>), id: newId("copy") }
          : item;
      list.splice(index + 1, 0, duped);
      return { ...current, [key]: list } as Content;
    });
  }

  function updateSiteCopy(patch: Partial<SiteCopy>) {
    setContent((current) => ({ ...current, siteCopy: { ...current.siteCopy, ...patch } }));
  }

  function updateAboutStat(index: number, patch: Partial<AboutStat>) {
    setContent((current) => ({
      ...current,
      siteCopy: {
        ...current.siteCopy,
        aboutStats: current.siteCopy.aboutStats.map((s, i) => (i === index ? { ...s, ...patch } : s)),
      },
    }));
  }

  function updateHighlight(index: number, patch: Partial<Highlight>) {
    setContent((current) => ({
      ...current,
      highlights: current.highlights.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    }));
  }

  function updateExperience(index: number, patch: Partial<Experience>) {
    setContent((current) => ({
      ...current,
      experience: current.experience.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    }));
  }

  function updateSkill(index: number, patch: Partial<SkillGroup>) {
    setContent((current) => ({
      ...current,
      skills: current.skills.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    }));
  }

  function updateEducation(index: number, patch: Partial<Education>) {
    setContent((current) => ({
      ...current,
      education: current.education.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    }));
  }

  function updateCertification(index: number, patch: Partial<Certification>) {
    setContent((current) => ({
      ...current,
      certifications: current.certifications.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    }));
  }

  function updateProject(index: number, patch: Partial<Project>) {
    setContent((current) => ({
      ...current,
      projects: current.projects.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    }));
  }

  return (
    <div>
    <form action={saveAction} className="pb-28">
      <input type="hidden" name="content" value={serialized} readOnly />

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.055] p-3 backdrop-blur-xl">
            <div className="mb-3 px-3 py-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Storage</p>
              <p className="mt-1 text-sm text-white/75">{storageLabel}</p>
            </div>
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition ${
                      isActive ? "bg-white text-black" : "text-white/70 hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="min-w-0">
          {/* ── Profile ── */}
          {activeTab === "profile" && (
            <div className="space-y-5">
              <SectionHeading title="Profile" detail="Hero copy, contact details, social links, and resume path." />
              <Group title="Headshot">
                <ImageUpload
                  label="Profile photo (replaces headshot.jpg)"
                  currentUrl={content.profile.headshotUrl ?? ""}
                  onUpload={(url) => setContent((c) => ({ ...c, profile: { ...c.profile, headshotUrl: url } }))}
                />
                <p className="text-xs text-white/35">Upload a new headshot. The URL is saved to Postgres — no git push needed. Leave blank to use the bundled headshot.jpg.</p>
              </Group>
              <div className="grid gap-5 xl:grid-cols-2">
                <Group title="Identity">
                  <Field label="Full name" value={content.profile.name} onChange={(name) => setContent((c) => ({ ...c, profile: { ...c.profile, name } }))} />
                  <Field label="First name" value={content.profile.firstName} onChange={(firstName) => setContent((c) => ({ ...c, profile: { ...c.profile, firstName } }))} />
                  <Field label="Title (use @ to split lines in photo badge)" value={content.profile.title} onChange={(title) => setContent((c) => ({ ...c, profile: { ...c.profile, title } }))} placeholder="Technical Consultant @ Okta" />
                  <Field label="Tagline" value={content.profile.tagline} onChange={(tagline) => setContent((c) => ({ ...c, profile: { ...c.profile, tagline } }))} />
                  <Field label="Location" value={content.profile.location} onChange={(location) => setContent((c) => ({ ...c, profile: { ...c.profile, location } }))} />
                </Group>

                <Group title="Contact">
                  <Field label="Private email" value={content.profile.email} onChange={(email) => setContent((c) => ({ ...c, profile: { ...c.profile, email } }))} />
                  <Field label="Public email" value={content.profile.publicEmail} onChange={(publicEmail) => setContent((c) => ({ ...c, profile: { ...c.profile, publicEmail } }))} />
                  <Field label="Phone" value={content.profile.phone} onChange={(phone) => setContent((c) => ({ ...c, profile: { ...c.profile, phone } }))} />
                  <Field label="Availability" value={content.profile.availability} onChange={(availability) => setContent((c) => ({ ...c, profile: { ...c.profile, availability } }))} />
                </Group>

                <Group title="Resume">
                  <ImageUpload
                    label="Upload resume PDF (replaces current resume)"
                    currentUrl={content.profile.resume}
                    onUpload={(url) => setContent((c) => ({ ...c, profile: { ...c.profile, resume: url } }))}
                    accept="application/pdf"
                  />
                  <p className="text-xs text-white/35">Upload a PDF and the URL is saved to Postgres automatically — no git push needed. Or type a path manually below (e.g. /resume.pdf for a file in /public).</p>
                  <Field label="Resume path (manual override)" value={content.profile.resume} onChange={(resume) => setContent((c) => ({ ...c, profile: { ...c.profile, resume } }))} placeholder="/resume.pdf" />
                </Group>
              </div>

              <Group title="Main copy">
                <Textarea label="Headline (shown in hero below your name)" rows={3} value={content.profile.headline} onChange={(headline) => setContent((c) => ({ ...c, profile: { ...c.profile, headline } }))} />
                <Textarea label="Short bio" rows={4} value={content.profile.shortBio} onChange={(shortBio) => setContent((c) => ({ ...c, profile: { ...c.profile, shortBio } }))} />
                <Textarea label="About (long-form paragraph in the About section)" rows={8} value={content.profile.about} onChange={(about) => setContent((c) => ({ ...c, profile: { ...c.profile, about } }))} />
              </Group>

              <Group title="Social links">
                <Field label="GitHub URL" value={content.profile.socials.github} onChange={(github) => setContent((c) => ({ ...c, profile: { ...c.profile, socials: { ...c.profile.socials, github } } }))} placeholder="https://github.com/username" />
                <Field label="LinkedIn URL" value={content.profile.socials.linkedin} onChange={(linkedin) => setContent((c) => ({ ...c, profile: { ...c.profile, socials: { ...c.profile.socials, linkedin } } }))} placeholder="https://linkedin.com/in/username" />
                <Field label="Email link (mailto:)" value={content.profile.socials.email} onChange={(email) => setContent((c) => ({ ...c, profile: { ...c.profile, socials: { ...c.profile.socials, email } } }))} placeholder="mailto:you@example.com" />
              </Group>
            </div>
          )}

          {/* ── Site copy ── */}
          {activeTab === "sitecopy" && (
            <div className="space-y-5">
              <SectionHeading title="Site copy" detail="Section headings, subheadings, and the About stat cards. These are the words baked into the layout that aren't stored as profile or experience data." />

              <Group title="Hero status badge">
                <Field label="Status text (top-left of hero, next to green dot)" value={content.siteCopy.heroStatus} onChange={(heroStatus) => updateSiteCopy({ heroStatus })} placeholder="Okta · Identity & CIAM" />
              </Group>

              <Group title="About section">
                <Field label="Heading (use \\n for a line break)" value={content.siteCopy.aboutHeading} onChange={(aboutHeading) => updateSiteCopy({ aboutHeading })} placeholder="The identity layer\nbehind" />
                <Field label="Heading bold suffix (rendered in colour)" value={content.siteCopy.aboutHeadingBold} onChange={(aboutHeadingBold) => updateSiteCopy({ aboutHeadingBold })} placeholder="modern apps." />
                <Textarea label="Subheading (right column, smaller text)" rows={3} value={content.siteCopy.aboutSubheading} onChange={(aboutSubheading) => updateSiteCopy({ aboutSubheading })} />
              </Group>

              <Group title="About stat cards">
                <p className="text-xs text-white/40">Three cards below the About paragraph — e.g. Now / Specialty / Frontier.</p>
                {content.siteCopy.aboutStats.map((stat, i) => (
                  <div key={i} className="grid gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 md:grid-cols-3">
                    <Field label={`Card ${i + 1} — label`} value={stat.key} onChange={(key) => updateAboutStat(i, { key })} placeholder="Now" />
                    <Field label="Main value" value={stat.value} onChange={(value) => updateAboutStat(i, { value })} placeholder="Technical Consultant" />
                    <Field label="Sub-text" value={stat.sub} onChange={(sub) => updateAboutStat(i, { sub })} placeholder="Okta · Auth0" />
                  </div>
                ))}
              </Group>

              <Group title="Experience section">
                <Field label="Heading (use \\n for line break)" value={content.siteCopy.experienceHeading} onChange={(experienceHeading) => updateSiteCopy({ experienceHeading })} placeholder="Five years," />
                <Field label="Heading bold suffix" value={content.siteCopy.experienceHeadingBold} onChange={(experienceHeadingBold) => updateSiteCopy({ experienceHeadingBold })} placeholder="three chapters." />
                <Textarea label="Subheading" rows={2} value={content.siteCopy.experienceSubheading} onChange={(experienceSubheading) => updateSiteCopy({ experienceSubheading })} />
              </Group>

              <Group title="Projects section">
                <Field label="Heading (use \\n for line break)" value={content.siteCopy.projectsHeading} onChange={(projectsHeading) => updateSiteCopy({ projectsHeading })} placeholder="Selected" />
                <Field label="Heading bold suffix" value={content.siteCopy.projectsHeadingBold} onChange={(projectsHeadingBold) => updateSiteCopy({ projectsHeadingBold })} placeholder="work." />
                <Textarea label="Subheading" rows={2} value={content.siteCopy.projectsSubheading} onChange={(projectsSubheading) => updateSiteCopy({ projectsSubheading })} />
              </Group>

              <Group title="Skills / Toolkit section">
                <Field label="Heading (use \\n for line break)" value={content.siteCopy.skillsHeading} onChange={(skillsHeading) => updateSiteCopy({ skillsHeading })} placeholder="What I" />
                <Field label="Heading bold suffix" value={content.siteCopy.skillsHeadingBold} onChange={(skillsHeadingBold) => updateSiteCopy({ skillsHeadingBold })} placeholder="reach for." />
                <Textarea label="Subheading" rows={2} value={content.siteCopy.skillsSubheading} onChange={(skillsSubheading) => updateSiteCopy({ skillsSubheading })} />
              </Group>
            </div>
          )}

          {/* ── Highlights ── */}
          {activeTab === "highlights" && (
            <div className="space-y-5">
              <SectionHeading
                title="Highlights"
                detail="Small proof-point metrics that appear near the top of the site."
                actionLabel="Add highlight"
                onAction={() =>
                  setContent((c) => ({
                    ...c,
                    highlights: [...c.highlights, { label: "New metric", value: "0", detail: "Short detail" }],
                  }))
                }
              />
              {content.highlights.map((highlight, index) => (
                <ItemFrame
                  key={`${highlight.label}-${index}`}
                  title={highlight.label || `Highlight ${index + 1}`}
                  index={index}
                  total={content.highlights.length}
                  onMove={(direction) => moveListItem("highlights", index, direction)}
                  onRemove={() => removeListItem("highlights", index)}
                >
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Label" value={highlight.label} onChange={(label) => updateHighlight(index, { label })} />
                    <Field label="Value" value={highlight.value} onChange={(value) => updateHighlight(index, { value })} />
                    <Field label="Detail" value={highlight.detail} onChange={(detail) => updateHighlight(index, { detail })} />
                  </div>
                </ItemFrame>
              ))}
            </div>
          )}

          {/* ── Experience ── */}
          {activeTab === "experience" && (
            <div className="space-y-5">
              <SectionHeading
                title="Experience"
                detail="Role cards, summaries, bullet points, tags, dates, and locations."
                actionLabel="Add role"
                onAction={() =>
                  setContent((c) => ({
                    ...c,
                    experience: [
                      ...c.experience,
                      {
                        id: newId("role"),
                        role: "New role",
                        company: "Company",
                        contractInfo: null,
                        logo: "company",
                        period: "Month YYYY to Present",
                        location: "City, State",
                        type: "Full-time",
                        color: "from-cyan-500 to-blue-600",
                        accent: "rgba(108, 227, 255, 0.25)",
                        summary: "Short role summary.",
                        highlights: ["Add a measurable accomplishment."],
                        tags: ["Skill"],
                      },
                    ],
                  }))
                }
              />
              {content.experience.map((item, index) => (
                <ItemFrame
                  key={item.id || index}
                  title={`${item.company || "Company"} · ${item.role || "Role"}`}
                  index={index}
                  total={content.experience.length}
                  onMove={(direction) => moveListItem("experience", index, direction)}
                  onRemove={() => removeListItem("experience", index)}
                  onDuplicate={() => duplicateListItem("experience", index)}
                >
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Field label="Role title" value={item.role} onChange={(role) => updateExperience(index, { role })} />
                    <Field label="Company" value={item.company} onChange={(company) => updateExperience(index, { company })} />
                    <Field label="Period (e.g. Jan 2023 – Present)" value={item.period} onChange={(period) => updateExperience(index, { period })} />
                    <Field label="Location" value={item.location} onChange={(location) => updateExperience(index, { location })} />
                    <Field label="Employment type" value={item.type} onChange={(type) => updateExperience(index, { type })} placeholder="Full-time" />
                    <Field label="Contract info (optional, replaces type)" value={item.contractInfo ?? ""} onChange={(contractInfo) => updateExperience(index, { contractInfo: contractInfo || null })} placeholder="Leave blank unless contract/freelance" />
                  </div>
                  <Textarea label="Summary (1–2 sentences about this role)" rows={3} value={item.summary} onChange={(summary) => updateExperience(index, { summary })} />
                  <LinesField label="Highlights — one bullet per line" value={item.highlights} onChange={(highlights) => updateExperience(index, { highlights })} rows={7} />
                  <LinesField label="Tags — one skill per line" value={item.tags} onChange={(tags) => updateExperience(index, { tags })} rows={4} />
                  <Advanced>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <Field label="ID (slug, auto-generated)" value={item.id} onChange={(id) => updateExperience(index, { id })} />
                      <Field label="Logo key" value={item.logo} onChange={(logo) => updateExperience(index, { logo })} />
                      <Field label="Gradient class" value={item.color} onChange={(color) => updateExperience(index, { color })} placeholder="from-cyan-500 to-blue-600" />
                      <Field label="Accent color (rgba)" value={item.accent} onChange={(accent) => updateExperience(index, { accent })} placeholder="rgba(108, 227, 255, 0.25)" />
                    </div>
                  </Advanced>
                </ItemFrame>
              ))}
            </div>
          )}

          {/* ── Skills ── */}
          {activeTab === "skills" && (
            <div className="space-y-5">
              <SectionHeading
                title="Skills"
                detail="Skill groups and the chips listed under each group."
                actionLabel="Add skill group"
                onAction={() =>
                  setContent((c) => ({
                    ...c,
                    skills: [...c.skills, { category: "New skill group", icon: "shield", items: ["Skill"] }],
                  }))
                }
              />
              {content.skills.map((skill, index) => (
                <ItemFrame
                  key={`${skill.category}-${index}`}
                  title={skill.category || `Skill group ${index + 1}`}
                  index={index}
                  total={content.skills.length}
                  onMove={(direction) => moveListItem("skills", index, direction)}
                  onRemove={() => removeListItem("skills", index)}
                >
                  <Field label="Category name" value={skill.category} onChange={(category) => updateSkill(index, { category })} />
                  <LinesField label="Skills — one per line" value={skill.items} onChange={(items) => updateSkill(index, { items })} rows={8} />
                  <Advanced>
                    <Field label="Icon key" value={skill.icon} onChange={(icon) => updateSkill(index, { icon })} />
                  </Advanced>
                </ItemFrame>
              ))}
            </div>
          )}

          {/* ── Education ── */}
          {activeTab === "education" && (
            <div className="space-y-5">
              <SectionHeading
                title="Education"
                detail="Degrees and academic credentials."
                actionLabel="Add education"
                onAction={() =>
                  setContent((c) => ({
                    ...c,
                    education: [
                      ...c.education,
                      {
                        id: newId("education"),
                        school: "School",
                        degree: "Degree",
                        period: "Year to Year",
                        location: "City, State",
                        accent: "rgba(108, 227, 255, 0.25)",
                      },
                    ],
                  }))
                }
              />
              {content.education.map((school, index) => (
                <ItemFrame
                  key={school.id || index}
                  title={school.school || `Education ${index + 1}`}
                  index={index}
                  total={content.education.length}
                  onMove={(direction) => moveListItem("education", index, direction)}
                  onRemove={() => removeListItem("education", index)}
                >
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Field label="School" value={school.school} onChange={(schoolName) => updateEducation(index, { school: schoolName })} />
                    <Field label="Degree" value={school.degree} onChange={(degree) => updateEducation(index, { degree })} />
                    <Field label="Period (e.g. 2020 – 2022)" value={school.period} onChange={(period) => updateEducation(index, { period })} />
                    <Field label="Location" value={school.location} onChange={(location) => updateEducation(index, { location })} />
                  </div>
                  <Advanced>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <Field label="ID (slug)" value={school.id} onChange={(id) => updateEducation(index, { id })} />
                      <Field label="Accent color (rgba)" value={school.accent} onChange={(accent) => updateEducation(index, { accent })} />
                    </div>
                  </Advanced>
                </ItemFrame>
              ))}
            </div>
          )}

          {/* ── Certifications ── */}
          {activeTab === "certifications" && (
            <div className="space-y-5">
              <SectionHeading
                title="Certifications"
                detail="Earned and in-progress certifications. Use 'expected' for ones you're working toward."
                actionLabel="Add certification"
                onAction={() =>
                  setContent((c) => ({
                    ...c,
                    certifications: [
                      ...c.certifications,
                      { name: "Certification name", issuer: "Issuer", status: "earned" },
                    ],
                  }))
                }
              />
              {content.certifications.map((cert, index) => (
                <ItemFrame
                  key={`${cert.name}-${index}`}
                  title={cert.name || `Certification ${index + 1}`}
                  index={index}
                  total={content.certifications.length}
                  onMove={(direction) => moveListItem("certifications", index, direction)}
                  onRemove={() => removeListItem("certifications", index)}
                >
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Field label="Certification name" value={cert.name} onChange={(name) => updateCertification(index, { name })} />
                    <Field label="Issuer (e.g. Okta, AWS, Google)" value={cert.issuer} onChange={(issuer) => updateCertification(index, { issuer })} />
                    <Select
                      label="Status"
                      value={cert.status ?? "earned"}
                      options={[
                        { label: "✅ Earned", value: "earned" },
                        { label: "⏳ In progress", value: "in-progress" },
                      ]}
                      onChange={(status) => updateCertification(index, { status: status as Certification["status"] })}
                    />
                    <Field label="Date issued (e.g. Jun 2024)" value={cert.issued ?? ""} onChange={(issued) => updateCertification(index, { issued })} placeholder="Leave blank if in progress" />
                    <Field label="Expected date (in-progress only)" value={cert.expected ?? ""} onChange={(expected) => updateCertification(index, { expected })} placeholder="e.g. Q3 2025" />
                  </div>
                </ItemFrame>
              ))}
            </div>
          )}

          {/* ── Projects ── */}
          {activeTab === "projects" && (
            <div className="space-y-5">
              <SectionHeading
                title="Projects"
                detail="Project cards shown in the Projects section. Category must match one of the filter chips."
                actionLabel="Add project"
                onAction={() =>
                  setContent((c) => ({
                    ...c,
                    projects: [
                      ...c.projects,
                      {
                        id: newId("project"),
                        title: "New project",
                        date: "Month YYYY",
                        category: "Cybersecurity",
                        icon: "sparkles",
                        color: "from-cyan-500 to-blue-600",
                        summary: "Short project summary.",
                        description: "Longer project description.",
                        tags: ["Skill"],
                      },
                    ],
                  }))
                }
              />
              {content.projects.map((project, index) => (
                <ItemFrame
                  key={project.id || index}
                  title={project.title || `Project ${index + 1}`}
                  index={index}
                  total={content.projects.length}
                  onMove={(direction) => moveListItem("projects", index, direction)}
                  onRemove={() => removeListItem("projects", index)}
                  onDuplicate={() => duplicateListItem("projects", index)}
                >
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Field label="Title" value={project.title} onChange={(title) => updateProject(index, { title })} />
                    <Field label="Date (e.g. Jan 2024)" value={project.date} onChange={(date) => updateProject(index, { date })} />
                    <Select
                      label="Category (must match a filter chip)"
                      value={project.category}
                      options={[
                        { label: "Cybersecurity", value: "Cybersecurity" },
                        { label: "Web Engineering", value: "Web Engineering" },
                        { label: "Automation & IoT", value: "Automation & IoT" },
                        { label: "AI & Data", value: "AI & Data" },
                      ]}
                      onChange={(category) => updateProject(index, { category })}
                    />
                  </div>
                  <Textarea label="Summary (shown on card)" rows={3} value={project.summary} onChange={(summary) => updateProject(index, { summary })} />
                  <Textarea label="Description (detail view)" rows={5} value={project.description} onChange={(description) => updateProject(index, { description })} />
                  <LinesField label="Tags — one per line" value={project.tags} onChange={(tags) => updateProject(index, { tags })} rows={4} />
                  <ImageUpload
                    label="Project screenshot (optional)"
                    currentUrl={project.imageUrl ?? ""}
                    onUpload={(url) => updateProject(index, { imageUrl: url })}
                  />
                  <Advanced>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <Field label="ID (slug)" value={project.id} onChange={(id) => updateProject(index, { id })} />
                      <Field label="Icon key" value={project.icon} onChange={(icon) => updateProject(index, { icon })} />
                      <Field label="Gradient class" value={project.color} onChange={(color) => updateProject(index, { color })} placeholder="from-cyan-500 to-blue-600" />
                    </div>
                  </Advanced>
                </ItemFrame>
              ))}
            </div>
          )}

          {/* ── Changelog ── */}
          {activeTab === "changelog" && (
            <div className="space-y-5">
              <SectionHeading title="Changelog" detail="A log of every save — what sections changed and when. Recorded automatically whenever you save live or as a draft." />
              {changelog.length === 0 ? (
                <div className="rounded-[24px] border border-white/10 bg-white/[0.055] p-8 text-center backdrop-blur-xl">
                  <Clock className="mx-auto mb-3 h-8 w-8 text-white/20" />
                  <p className="text-sm text-white/45">No saves recorded yet. Changes are logged here after your first save.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {changelog.map((entry) => {
                    const date = new Date(entry.saved_at);
                    const isLive = entry.save_type === "live";
                    return (
                      <div key={entry.id} className="rounded-[20px] border border-white/10 bg-white/[0.055] p-4 backdrop-blur-xl">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${
                                isLive
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : "bg-amber-500/15 text-amber-300"
                              }`}
                            >
                              {isLive ? "Live" : "Draft"}
                            </span>
                            {entry.note && (
                              <span className="text-xs text-white/45">{entry.note}</span>
                            )}
                          </div>
                          <time dateTime={date.toISOString()} className="flex items-center gap-1.5 text-xs text-white/35" title={date.toLocaleString()}>
                            <Clock className="h-3 w-3" />
                            {date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                            {" · "}
                            {date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                          </time>
                        </div>
                        {entry.sections.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {entry.sections.map((section) => (
                              <span
                                key={section}
                                className="rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white/55"
                              >
                                {section}
                              </span>
                            ))}
                          </div>
                        )}
                        {entry.sections.length === 0 && (
                          <p className="mt-2 text-xs text-white/30">No section changes detected</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── JSON ── */}
          {activeTab === "json" && (
            <div className="space-y-5">
              <SectionHeading title="JSON export" detail="Use this for backups or larger edits outside the form." />
              <div className="rounded-[24px] border border-white/10 bg-white/[0.055] p-4 backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm text-white/65">Current draft content</p>
                  <button
                    type="button"
                    onClick={copyJson}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/75 transition hover:border-white/25 hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={prettyJson}
                  className="min-h-[620px] w-full resize-y rounded-2xl border border-white/10 bg-black/70 p-4 font-mono text-xs leading-6 text-cyan-50/85 outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/80 px-5 py-4 backdrop-blur-2xl sm:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white">{isDirty ? "Unsaved changes" : "No unsaved changes"}</p>
            <p className="text-xs text-white/45">Save publishes live. Save as draft lets you preview first.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={resetContent}
              disabled={!isDirty}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 px-4 text-sm text-white/75 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <SubmitButton />
          </div>
        </div>
      </div>
    </form>

    {/* Draft form — separate form so it can share the same serialized content */}
    <form action={saveDraftAction} className="hidden" id="draft-form">
      <input type="hidden" name="content" value={serialized} readOnly />
    </form>

    <div className="fixed inset-x-0 bottom-[72px] z-30 flex justify-center px-5 sm:px-8">
      <div className="flex items-center gap-2">
        <button
          type="submit"
          form="draft-form"
          disabled={!isDirty}
          className="inline-flex h-9 items-center gap-1.5 rounded-2xl border border-white/10 bg-black/60 px-3.5 text-xs text-white/60 backdrop-blur transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save as draft
        </button>
        {hasDraft && (
          <a
            href="/api/draft?action=enable&redirect=/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-2xl border border-cyan-300/25 bg-cyan-500/10 px-3.5 text-xs text-cyan-300 backdrop-blur transition hover:border-cyan-300/50 hover:text-cyan-100"
          >
            Preview draft ↗
          </a>
        )}
      </div>
    </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-cyan-100 disabled:cursor-wait disabled:opacity-60"
    >
      <Save className="h-4 w-4" />
      {pending ? "Saving…" : "Save content"}
    </button>
  );
}

function SectionHeading({
  title,
  detail,
  actionLabel,
  onAction,
}: {
  title: string;
  detail: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Editor section</p>
        <h2 className="mt-1 text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-white/55">{detail}</p>
      </div>
      {actionLabel && onAction && <AddButton label={actionLabel} onClick={onAction} />}
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-white/80 transition hover:border-cyan-200/40 hover:text-white"
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl">
      <h3 className="mb-4 text-sm font-semibold text-white/85">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Advanced({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-xs text-white/40 transition hover:text-white/65"
      >
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        Advanced fields
      </button>
      {open && <div className="space-y-4 border-t border-white/[0.07] p-4">{children}</div>}
    </div>
  );
}

function ItemFrame({
  title,
  children,
  index,
  total,
  onMove,
  onRemove,
  onDuplicate,
}: {
  title: string;
  children: ReactNode;
  index: number;
  total: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  onDuplicate?: () => void;
}) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Item {index + 1}</p>
          <h3 className="mt-1 text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <IconButton label="Move up" disabled={index === 0} onClick={() => onMove(-1)}>
            <ArrowUp className="h-4 w-4" />
          </IconButton>
          <IconButton label="Move down" disabled={index === total - 1} onClick={() => onMove(1)}>
            <ArrowDown className="h-4 w-4" />
          </IconButton>
          {onDuplicate && (
            <IconButton label="Duplicate" onClick={onDuplicate}>
              <Copy className="h-4 w-4" />
            </IconButton>
          )}
          <IconButton label="Remove" danger onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function IconButton({
  label,
  children,
  onClick,
  danger,
  disabled,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-9 w-9 place-items-center rounded-xl border text-sm transition disabled:cursor-not-allowed disabled:opacity-35 ${
        danger
          ? "border-red-300/20 text-red-200 hover:border-red-300/45 hover:bg-red-500/10"
          : "border-white/10 text-white/65 hover:border-white/25 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-white/42">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl border border-white/10 bg-black/50 px-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/60"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-white/42">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-y rounded-2xl border border-white/10 bg-black/50 px-3.5 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/60"
      />
    </label>
  );
}

function LinesField({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  rows: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-white/42">{label}</span>
      <textarea
        value={value.join("\n")}
        rows={rows}
        onChange={(event) => onChange(splitLines(event.target.value))}
        className="w-full resize-y rounded-2xl border border-white/10 bg-black/50 px-3.5 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/60"
      />
    </label>
  );
}

function ImageUpload({
  label,
  currentUrl,
  onUpload,
  accept = "image/*,application/pdf",
}: {
  label: string;
  currentUrl: string;
  onUpload: (url: string) => void;
  accept?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      onUpload(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-white/42">{label}</span>
      {currentUrl && (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          {currentUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
            <img src={currentUrl} alt="Uploaded" className="max-h-48 w-full object-contain" />
          ) : currentUrl.match(/\.pdf$/i) || accept === "application/pdf" ? (
            <div className="flex items-center gap-2 px-3 py-2.5">
              <span className="rounded-lg bg-red-500/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-red-300">PDF</span>
              <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="truncate text-xs text-cyan-300/80 underline hover:text-cyan-200">{currentUrl}</a>
            </div>
          ) : (
            <p className="truncate px-3 py-2 text-xs text-cyan-300/80">{currentUrl}</p>
          )}
          <button
            type="button"
            onClick={() => onUpload("")}
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-xl border border-red-300/20 bg-black/60 text-red-300 backdrop-blur transition hover:bg-red-500/20"
            title="Remove"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <label className={`flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/65 transition hover:border-cyan-300/40 hover:text-white ${uploading ? "pointer-events-none opacity-60" : ""}`}>
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        {uploading ? "Uploading…" : accept === "application/pdf" ? "Upload PDF" : "Upload image"}
        <input type="file" accept={accept} className="hidden" onChange={handleFile} disabled={uploading} />
      </label>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-white/42">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-2xl border border-white/10 bg-black/50 px-3.5 text-sm text-white outline-none transition focus:border-cyan-300/60"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
