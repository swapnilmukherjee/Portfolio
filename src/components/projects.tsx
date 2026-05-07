"use client";

import { forwardRef, useMemo, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Github, ExternalLink, ArrowUpRight } from "lucide-react";

import type { Project, SiteCopy } from "@/data/content-types";
import { CarouselIndicator, useSnapCarousel } from "@/components/carousel-indicator";
import { cn } from "@/lib/cn";

const CATEGORIES = ["All", "Cybersecurity", "Web Engineering", "Automation & IoT", "AI & Data"] as const;
type Category = (typeof CATEGORIES)[number];

const reveal = {
  initial: { opacity: 0, y: 28, filter: "blur(8px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
};

// A project is "expandable" if it has a long description, github, or website
function isExpandable(p: Project) {
  return (p.description && p.description.length > 0) || !!p.github || !!p.website;
}

export function Projects({ projects, siteCopy }: { projects: Project[]; siteCopy: SiteCopy }) {
  const [active, setActive] = useState<Category>("All");
  const [modalProject, setModalProject] = useState<Project | null>(null);

  const filtered = useMemo(
    () => (active === "All" ? projects : projects.filter((p) => p.category === active)),
    [active, projects]
  );

  const carouselKey = `${active}-${filtered.length}`;
  const carousel = useSnapCarousel(filtered.length, carouselKey);
  const headingLines = siteCopy.projectsHeading.split("\n");

  // Close modal on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setModalProject(null);
  }, []);

  useEffect(() => {
    if (modalProject) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [modalProject, handleKeyDown]);

  return (
    <section id="projects" className="relative z-[2] py-32 sm:py-44">
      <div className="mx-auto max-w-[1320px] px-6 sm:px-8">
        <motion.div {...reveal} className="mb-6">
          <span className="eyebrow">03 / Projects</span>
        </motion.div>

        <div className="mb-12 grid items-end gap-12 lg:grid-cols-[1fr_0.55fr] lg:gap-14">
          <motion.h2 {...reveal} className="display-section">
            {headingLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < headingLines.length - 1 && <br />}
              </span>
            ))}
            {siteCopy.projectsHeadingBold && <> <b className="ir-text">{siteCopy.projectsHeadingBold}</b></>}
          </motion.h2>
          <motion.p {...reveal} className="max-w-[360px] text-base leading-[1.65] text-text/55">
            {siteCopy.projectsSubheading}
          </motion.p>
        </div>

        {/* Filters */}
        <motion.div {...reveal} className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const count = cat === "All" ? projects.length : projects.filter((p) => p.category === cat).length;
            const isActive = active === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                className={cn(
                  "glass rounded-full px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition",
                  isActive ? "text-text-strong" : "text-text/55 hover:text-text/92"
                )}
                style={
                  isActive
                    ? {
                        borderColor: "transparent",
                        background:
                          "linear-gradient(135deg, rgb(var(--grad-1) / 0.25), rgb(var(--grad-2) / 0.25))",
                      }
                    : undefined
                }
              >
                {cat} <span className="text-text/30">· {count}</span>
              </button>
            );
          })}
        </motion.div>

        <div className="relative">
          <motion.div {...reveal}>
            <div
              data-carousel-scroller="true"
              ref={carousel.ref}
              onScroll={carousel.onScroll}
              className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-6 no-scrollbar touch-pan-x sm:-mx-8 sm:px-8 md:gap-5 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:p-0 lg:pb-0 lg:touch-auto"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((p, i) => (
                  <Card key={p.id} project={p} index={i} onMore={() => setModalProject(p)} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          <CarouselIndicator
            count={filtered.length}
            activeIndex={carousel.activeIndex}
            progress={carousel.progress}
            onSelect={carousel.scrollToIndex}
          />
        </div>
      </div>

      {/* Project Detail Modal — rendered via portal to escape filter/transform stacking contexts */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {modalProject && (
              <ProjectModal project={modalProject} onClose={() => setModalProject(null)} />
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────

const Card = forwardRef<HTMLElement, { project: Project; index: number; onMore: () => void }>(
  function Card({ project, index, onMore }, ref) {
    const expandable = isExpandable(project);
    return (
      <motion.article
        ref={ref}
        data-carousel-item="true"
        layout
        initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
        transition={{ duration: 0.55, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
        className="group relative flex w-[82vw] max-w-[380px] shrink-0 snap-start scroll-ml-6 flex-col gap-3 overflow-hidden rounded-[22px] bg-surface p-5 transition-colors duration-300 sm:w-[52vw] sm:scroll-ml-8 md:w-[44vw] lg:min-h-[280px] lg:w-auto lg:max-w-none lg:shrink lg:snap-none lg:scroll-ml-0 lg:rounded-[28px] lg:gap-4 lg:p-9"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
          e.currentTarget.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
        }}
      >
        {/* Spotlight */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgb(var(--grad-1) / 0.15), transparent 40%)",
          }}
        />

        <div className="relative flex items-start justify-between">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.2em]"
            style={{ color: "rgb(var(--grad-2))" }}
          >
            {project.category}
          </span>
          <span className="font-mono text-[11px] text-text/30">/ {String(index + 1).padStart(2, "0")}</span>
        </div>

        <h3 className="relative text-[22px] font-light leading-[1.08] tracking-normal text-text-strong sm:text-[26px] lg:text-[32px]">
          {project.title}
        </h3>

        <p className="relative flex-1 text-[13px] leading-[1.5] text-text/55 lg:text-[14px] lg:leading-[1.55]">
          {project.summary}
        </p>

        <div className="relative flex items-center justify-between gap-4 border-t border-white/[0.08] pt-3 lg:pt-4">
          <div className="flex min-w-0 flex-wrap gap-x-1.5 gap-y-1 font-mono text-[10px] text-text/55">
            {project.tags.slice(0, 3).map((t, i) => (
              <span key={t}>
                {t}
                {i < Math.min(project.tags.length, 3) - 1 ? <span className="px-1">·</span> : null}
              </span>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="font-mono text-[10px] text-text/30">{project.date}</span>
            {expandable && (
              <button
                type="button"
                onClick={onMore}
                className="group/more flex items-center gap-1 rounded-full border border-white/[0.12] bg-white/[0.05] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-text/50 transition hover:border-white/25 hover:bg-white/[0.09] hover:text-text/90"
              >
                More
                <ArrowUpRight className="h-2.5 w-2.5 transition-transform group-hover/more:translate-x-px group-hover/more:-translate-y-px" />
              </button>
            )}
          </div>
        </div>
      </motion.article>
    );
  }
);

// ── Modal ─────────────────────────────────────────────────────────────────────

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    /* Backdrop — theme-aware overlay */
    <motion.div
      key="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-6 md:p-10"
      style={{ background: "rgb(var(--bg) / 0.75)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      {/* Panel */}
      <motion.div
        key="modal-panel"
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-[680px] max-h-[92dvh] flex-col overflow-hidden rounded-t-[28px] sm:rounded-[28px] bg-surface"
        style={{
          border: "1px solid rgb(var(--line) / 0.12)",
          boxShadow: "0 24px 64px rgb(var(--bg) / 0.5), 0 0 0 1px rgb(var(--line) / 0.06) inset",
        }}
      >
        {/* Gradient accent strip */}
        <div
          className="absolute inset-x-0 top-0 h-[2px] rounded-t-[28px]"
          style={{ background: "linear-gradient(90deg, rgb(var(--grad-1) / 0.8), rgb(var(--grad-2) / 0.8))" }}
        />

        {/* Ambient glow — subtle in both themes */}
        <div
          className="pointer-events-none absolute -top-20 left-1/2 h-40 w-56 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "linear-gradient(135deg, rgb(var(--grad-1) / 0.12), rgb(var(--grad-2) / 0.12))" }}
        />

        {/* Drag handle (mobile hint) */}
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-text/10 sm:hidden" />

        {/* Scrollable body */}
        <div className="relative flex flex-1 flex-col overflow-y-auto px-6 pb-8 pt-6 sm:px-10 sm:pb-12 sm:pt-10">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between gap-4 sm:mb-8">
            <div className="flex-1 min-w-0">
              <span
                className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] sm:mb-3"
                style={{ color: "rgb(var(--grad-2))" }}
              >
                {project.category} · {project.date}
              </span>
              <h2 className="text-[24px] font-light leading-[1.08] tracking-tight text-text-strong sm:text-[32px] md:text-[36px]">
                {project.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text/40 transition hover:bg-text/[0.07] hover:text-text"
              style={{ border: "1px solid rgb(var(--line) / 0.12)" }}
              aria-label="Close"
            >
              <X className="h-[15px] w-[15px]" />
            </button>
          </div>

          {/* Description */}
          {project.description && (
            <p className="mb-7 text-[14px] leading-[1.75] text-text/65 sm:mb-8 sm:text-[15px] md:text-[16px]">
              {project.description}
            </p>
          )}

          {/* Tags */}
          {project.tags.length > 0 && (
            <div className="mb-7 sm:mb-8">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-text/35">
                Tech Stack
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full px-3 py-1.5 font-mono text-[11px] text-text/60"
                    style={{
                      background: "rgb(var(--text) / 0.05)",
                      border: "1px solid rgb(var(--line) / 0.1)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {(project.github || project.website) && (
            <div className="mt-auto flex flex-wrap gap-3 border-t pt-6 sm:pt-7"
              style={{ borderColor: "rgb(var(--line) / 0.08)" }}
            >
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-[13px] font-medium text-text/70 transition hover:text-text sm:flex-none"
                  style={{
                    background: "rgb(var(--text) / 0.05)",
                    border: "1px solid rgb(var(--line) / 0.1)",
                  }}
                >
                  <Github className="h-4 w-4 shrink-0" />
                  View on GitHub
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-40 transition-all group-hover/link:opacity-100 group-hover/link:translate-x-px group-hover/link:-translate-y-px" />
                </a>
              )}
              {project.website && (
                <a
                  href={project.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-[13px] font-medium text-text-strong transition sm:flex-none"
                  style={{
                    background: "linear-gradient(135deg, rgb(var(--grad-1) / 0.18), rgb(var(--grad-2) / 0.18))",
                    border: "1px solid rgb(var(--grad-1) / 0.28)",
                  }}
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  Live Site
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-50 transition-all group-hover/link:opacity-100 group-hover/link:translate-x-px group-hover/link:-translate-y-px" />
                </a>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
