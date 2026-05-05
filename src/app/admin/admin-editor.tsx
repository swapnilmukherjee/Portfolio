"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowDown,
  ArrowUp,
  Award,
  BriefcaseBusiness,
  Copy,
  FileJson,
  GraduationCap,
  IdCard,
  ListChecks,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Wrench,
} from "lucide-react";

import type {
  Certification,
  Content,
  Education,
  Experience,
  Highlight,
  Project,
  SkillGroup,
} from "@/data/content-types";

type AdminEditorProps = {
  initialContent: Content;
  saveAction: (formData: FormData) => void | Promise<void>;
  storageLabel: string;
};

type TabId = "profile" | "highlights" | "experience" | "skills" | "education" | "projects" | "json";
type ListKey = "highlights" | "experience" | "skills" | "education" | "certifications" | "projects";

const tabs: Array<{ id: TabId; label: string; icon: typeof IdCard }> = [
  { id: "profile", label: "Profile", icon: IdCard },
  { id: "highlights", label: "Highlights", icon: Sparkles },
  { id: "experience", label: "Experience", icon: BriefcaseBusiness },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "projects", label: "Projects", icon: ListChecks },
  { id: "json", label: "JSON", icon: FileJson },
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

export function AdminEditor({ initialContent, saveAction, storageLabel }: AdminEditorProps) {
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
          {activeTab === "profile" && (
            <div className="space-y-5">
              <SectionHeading title="Profile" detail="Hero copy, contact details, social links, and resume path." />
              <div className="grid gap-5 xl:grid-cols-2">
                <Group title="Identity">
                  <Field label="Name" value={content.profile.name} onChange={(name) => setContent((current) => ({ ...current, profile: { ...current.profile, name } }))} />
                  <Field label="First name" value={content.profile.firstName} onChange={(firstName) => setContent((current) => ({ ...current, profile: { ...current.profile, firstName } }))} />
                  <Field label="Title" value={content.profile.title} onChange={(title) => setContent((current) => ({ ...current, profile: { ...current.profile, title } }))} />
                  <Field label="Tagline" value={content.profile.tagline} onChange={(tagline) => setContent((current) => ({ ...current, profile: { ...current.profile, tagline } }))} />
                  <Field label="Location" value={content.profile.location} onChange={(location) => setContent((current) => ({ ...current, profile: { ...current.profile, location } }))} />
                </Group>

                <Group title="Contact">
                  <Field label="Private email" value={content.profile.email} onChange={(email) => setContent((current) => ({ ...current, profile: { ...current.profile, email } }))} />
                  <Field label="Public email" value={content.profile.publicEmail} onChange={(publicEmail) => setContent((current) => ({ ...current, profile: { ...current.profile, publicEmail } }))} />
                  <Field label="Phone" value={content.profile.phone} onChange={(phone) => setContent((current) => ({ ...current, profile: { ...current.profile, phone } }))} />
                  <Field label="Resume path" value={content.profile.resume} onChange={(resume) => setContent((current) => ({ ...current, profile: { ...current.profile, resume } }))} />
                  <Field label="Availability" value={content.profile.availability} onChange={(availability) => setContent((current) => ({ ...current, profile: { ...current.profile, availability } }))} />
                </Group>
              </div>

              <Group title="Main copy">
                <Textarea label="Headline" rows={3} value={content.profile.headline} onChange={(headline) => setContent((current) => ({ ...current, profile: { ...current.profile, headline } }))} />
                <Textarea label="Short bio" rows={4} value={content.profile.shortBio} onChange={(shortBio) => setContent((current) => ({ ...current, profile: { ...current.profile, shortBio } }))} />
                <Textarea label="About" rows={8} value={content.profile.about} onChange={(about) => setContent((current) => ({ ...current, profile: { ...current.profile, about } }))} />
              </Group>

              <Group title="Social links">
                <Field
                  label="GitHub"
                  value={content.profile.socials.github}
                  onChange={(github) => setContent((current) => ({ ...current, profile: { ...current.profile, socials: { ...current.profile.socials, github } } }))}
                />
                <Field
                  label="LinkedIn"
                  value={content.profile.socials.linkedin}
                  onChange={(linkedin) => setContent((current) => ({ ...current, profile: { ...current.profile, socials: { ...current.profile.socials, linkedin } } }))}
                />
                <Field
                  label="Email link"
                  value={content.profile.socials.email}
                  onChange={(email) => setContent((current) => ({ ...current, profile: { ...current.profile, socials: { ...current.profile.socials, email } } }))}
                />
              </Group>
            </div>
          )}

          {activeTab === "highlights" && (
            <div className="space-y-5">
              <SectionHeading
                title="Highlights"
                detail="Small proof points that appear near the top of the site."
                actionLabel="Add highlight"
                onAction={() =>
                  setContent((current) => ({
                    ...current,
                    highlights: [...current.highlights, { label: "New metric", value: "0", detail: "Short detail" }],
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

          {activeTab === "experience" && (
            <div className="space-y-5">
              <SectionHeading
                title="Experience"
                detail="Role cards, summaries, bullet points, tags, dates, and locations."
                actionLabel="Add role"
                onAction={() =>
                  setContent((current) => ({
                    ...current,
                    experience: [
                      ...current.experience,
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
                >
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Field label="ID" value={item.id} onChange={(id) => updateExperience(index, { id })} />
                    <Field label="Role" value={item.role} onChange={(role) => updateExperience(index, { role })} />
                    <Field label="Company" value={item.company} onChange={(company) => updateExperience(index, { company })} />
                    <Field label="Contract info" value={item.contractInfo ?? ""} onChange={(contractInfo) => updateExperience(index, { contractInfo: contractInfo || null })} />
                    <Field label="Logo key" value={item.logo} onChange={(logo) => updateExperience(index, { logo })} />
                    <Field label="Period" value={item.period} onChange={(period) => updateExperience(index, { period })} />
                    <Field label="Location" value={item.location} onChange={(location) => updateExperience(index, { location })} />
                    <Field label="Type" value={item.type} onChange={(type) => updateExperience(index, { type })} />
                    <Field label="Gradient class" value={item.color} onChange={(color) => updateExperience(index, { color })} />
                    <Field label="Accent color" value={item.accent} onChange={(accent) => updateExperience(index, { accent })} />
                  </div>
                  <Textarea label="Summary" rows={4} value={item.summary} onChange={(summary) => updateExperience(index, { summary })} />
                  <LinesField label="Highlights, one per line" value={item.highlights} onChange={(highlights) => updateExperience(index, { highlights })} rows={7} />
                  <LinesField label="Tags, one per line" value={item.tags} onChange={(tags) => updateExperience(index, { tags })} rows={4} />
                </ItemFrame>
              ))}
            </div>
          )}

          {activeTab === "skills" && (
            <div className="space-y-5">
              <SectionHeading
                title="Skills"
                detail="Skill groups and the chips listed under each group."
                actionLabel="Add skill group"
                onAction={() =>
                  setContent((current) => ({
                    ...current,
                    skills: [...current.skills, { category: "New skill group", icon: "shield", items: ["Skill"] }],
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
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Field label="Category" value={skill.category} onChange={(category) => updateSkill(index, { category })} />
                    <Field label="Icon key" value={skill.icon} onChange={(icon) => updateSkill(index, { icon })} />
                  </div>
                  <LinesField label="Skills, one per line" value={skill.items} onChange={(items) => updateSkill(index, { items })} rows={8} />
                </ItemFrame>
              ))}
            </div>
          )}

          {activeTab === "education" && (
            <div className="space-y-5">
              <SectionHeading
                title="Education and certifications"
                detail="Degrees and certification cards. Use expected for in-progress certifications."
              />

              <div className="flex justify-end gap-2">
                <AddButton
                  label="Add education"
                  onClick={() =>
                    setContent((current) => ({
                      ...current,
                      education: [
                        ...current.education,
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
                <AddButton
                  label="Add certification"
                  onClick={() =>
                    setContent((current) => ({
                      ...current,
                      certifications: [
                        ...current.certifications,
                        {
                          name: "Certification",
                          issuer: "Issuer",
                          status: "earned",
                        },
                      ],
                    }))
                  }
                />
              </div>

              <div className="space-y-5">
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
                      <Field label="ID" value={school.id} onChange={(id) => updateEducation(index, { id })} />
                      <Field label="School" value={school.school} onChange={(schoolName) => updateEducation(index, { school: schoolName })} />
                      <Field label="Degree" value={school.degree} onChange={(degree) => updateEducation(index, { degree })} />
                      <Field label="Period" value={school.period} onChange={(period) => updateEducation(index, { period })} />
                      <Field label="Location" value={school.location} onChange={(location) => updateEducation(index, { location })} />
                      <Field label="Accent color" value={school.accent} onChange={(accent) => updateEducation(index, { accent })} />
                    </div>
                  </ItemFrame>
                ))}
              </div>

              <div className="space-y-5">
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
                      <Field label="Name" value={cert.name} onChange={(name) => updateCertification(index, { name })} />
                      <Field label="Issuer" value={cert.issuer} onChange={(issuer) => updateCertification(index, { issuer })} />
                      <Select
                        label="Status"
                        value={cert.status ?? "earned"}
                        options={[
                          { label: "Earned", value: "earned" },
                          { label: "In progress", value: "in-progress" },
                        ]}
                        onChange={(status) => updateCertification(index, { status: status as Certification["status"] })}
                      />
                      <Field label="Issued" value={cert.issued ?? ""} onChange={(issued) => updateCertification(index, { issued })} />
                      <Field label="Expected" value={cert.expected ?? ""} onChange={(expected) => updateCertification(index, { expected })} />
                    </div>
                  </ItemFrame>
                ))}
              </div>
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-5">
              <SectionHeading
                title="Projects"
                detail="Project cards, categories, descriptions, icons, and tags."
                actionLabel="Add project"
                onAction={() =>
                  setContent((current) => ({
                    ...current,
                    projects: [
                      ...current.projects,
                      {
                        id: newId("project"),
                        title: "New project",
                        date: "Month YYYY",
                        category: "Category",
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
                >
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Field label="ID" value={project.id} onChange={(id) => updateProject(index, { id })} />
                    <Field label="Title" value={project.title} onChange={(title) => updateProject(index, { title })} />
                    <Field label="Date" value={project.date} onChange={(date) => updateProject(index, { date })} />
                    <Field label="Category" value={project.category} onChange={(category) => updateProject(index, { category })} />
                    <Field label="Icon key" value={project.icon} onChange={(icon) => updateProject(index, { icon })} />
                    <Field label="Gradient class" value={project.color} onChange={(color) => updateProject(index, { color })} />
                  </div>
                  <Textarea label="Summary" rows={3} value={project.summary} onChange={(summary) => updateProject(index, { summary })} />
                  <Textarea label="Description" rows={5} value={project.description} onChange={(description) => updateProject(index, { description })} />
                  <LinesField label="Tags, one per line" value={project.tags} onChange={(tags) => updateProject(index, { tags })} rows={4} />
                </ItemFrame>
              ))}
            </div>
          )}

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
            <p className="text-xs text-white/45">The form keeps the site layout intact. Save writes the same schema the homepage reads.</p>
          </div>
          <div className="flex items-center gap-2">
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
      {pending ? "Saving" : "Save content"}
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

function ItemFrame({
  title,
  children,
  index,
  total,
  onMove,
  onRemove,
}: {
  title: string;
  children: ReactNode;
  index: number;
  total: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
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
