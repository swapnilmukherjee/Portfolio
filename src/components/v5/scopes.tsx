"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls, useReducedMotion } from "framer-motion";
import type { Project } from "@/data/content-types";
import { ScrollTrigger } from "@/components/v5/gsap";
import { ProjectDiagram, projectAccent } from "@/components/v5/project-diagram";
import styles from "./scopes.module.css";

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}

function year(date: string): string {
  const m = date.match(/\d{4}/);
  return m ? m[0] : date;
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10 10 4M5 4h5v5" />
    </svg>
  );
}

function Links({ project }: { project: Project }) {
  if (!project.github && !project.website) return null;
  return (
    <div className={styles.links}>
      {project.github && (
        <a className={styles.link} href={project.github} target="_blank" rel="noreferrer">
          GitHub <ArrowIcon />
        </a>
      )}
      {project.website && (
        <a className={styles.link} href={project.website} target="_blank" rel="noreferrer">
          Live site <ArrowIcon />
        </a>
      )}
    </div>
  );
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <ul className={styles.tags} aria-label="Tags">
      {tags.map((t) => (
        <li key={t} className={styles.tag}>{t}</li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Detail: right drawer on desktop, bottom sheet on mobile             */
/* ------------------------------------------------------------------ */

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const EASE_DRAWER: [number, number, number, number] = [0.32, 0.72, 0, 1];

function Detail({ project, desktop, onClose }: { project: Project; desktop: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dragControls = useDragControls();
  const reduce = useReducedMotion();
  const dur = reduce ? 0.01 : 0.45;

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const els = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panelRef.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !panelRef.current.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  const paragraphs = project.description.split(/\n\n+/).filter(Boolean);
  const accent = { ["--accent" as string]: projectAccent(project) } as CSSProperties;

  const body = (
    <>
      <button ref={closeRef} type="button" className={styles.close} onClick={onClose} aria-label="Close project details">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <path d="M3 3l10 10M13 3 3 13" />
        </svg>
      </button>
      <div className={styles.scroll} style={accent}>
        <h3 id="scope-detail-title" className={styles.dTitle}>{project.title}</h3>
        <div className={`${styles.dMeta} t-meta`}>
          <span>{project.category}</span>
          <span>{project.date}</span>
        </div>
        <div className={styles.diagram} data-active="true">
          <ProjectDiagram project={project} />
        </div>
        <div className={styles.prose}>
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <Tags tags={project.tags} />
        <Links project={project} />
      </div>
    </>
  );

  return (
    <>
      <motion.div
        className={styles.backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduce ? 0.01 : 0.3 }}
        onClick={onClose}
        aria-hidden="true"
      />
      {desktop ? (
        <motion.div
          ref={panelRef}
          className={`${styles.panel} ${styles.drawer}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="scope-detail-title"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: dur, ease: EASE_DRAWER }}
        >
          {body}
        </motion.div>
      ) : (
        <motion.div
          ref={panelRef}
          className={`${styles.panel} ${styles.sheet}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="scope-detail-title"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: dur, ease: EASE_DRAWER }}
          drag="y"
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.7 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 120 || info.velocity.y > 500) onClose();
          }}
        >
          <div className={styles.grab} onPointerDown={(e) => dragControls.start(e)} aria-hidden="true" />
          {body}
        </motion.div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */

export function Scopes({ projects }: { projects: Project[] }) {
  const desktop = useMediaQuery("(min-width: 800px)");
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState<string | null>(null); // hovered / focused row
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => setMounted(true), []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(projects.map((p) => p.category)))], [projects]);
  const visible = useMemo(() => (filter === "All" ? projects : projects.filter((p) => p.category === filter)), [projects, filter]);
  const preview = visible.find((p) => p.id === previewId) ?? visible[0];
  const open = projects.find((p) => p.id === openId) ?? null;

  // Filtering changes section height; refresh trigger positions without restarting anything.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [filter]);

  // Body scroll lock while detail is open.
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (sbw > 0) body.style.paddingRight = `${sbw}px`;
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
    };
  }, [open]);

  const openProject = (p: Project, el: HTMLElement) => {
    triggerRef.current = el;
    setOpenId(p.id);
  };
  const close = useCallback(() => setOpenId(null), []);

  return (
    <section id="projects" aria-labelledby="projects-title" className={styles.section}>
      <div className="wrap">
        <header className={styles.head}>
          <h2 id="projects-title" className="t-section">Granted scopes</h2>
          <p className={styles.intro}>Side projects and grad school work in identity, security and full stack. Pick one to see how it works.</p>
        </header>

        <div className={styles.chips} role="group" aria-label="Filter projects by category">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={filter === c}
              className={`${styles.chip} ${filter === c ? styles.chipOn : ""}`}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          <ol
            className={`${styles.list} ${active ? styles.listDim : ""}`}
            onMouseLeave={() => setActive(null)}
          >
            {visible.map((p) => (
              <li key={p.id} className={styles.item}>
                <button
                  type="button"
                  className={`${styles.row} ${active === p.id ? styles.rowOn : ""}`}
                  style={{ ["--accent" as string]: projectAccent(p) } as CSSProperties}
                  aria-haspopup="dialog"
                  onMouseEnter={() => {
                    setActive(p.id);
                    setPreviewId(p.id);
                  }}
                  onFocus={() => {
                    setActive(p.id);
                    setPreviewId(p.id);
                  }}
                  onBlur={() => setActive((a) => (a === p.id ? null : a))}
                  onClick={(e) => openProject(p, e.currentTarget)}
                >
                  <span className={styles.title}>{p.title}</span>
                  <span className={`${styles.meta} t-meta`}>
                    <span className={styles.metaCat}>{p.category}</span>
                    <span className={styles.metaYear}>{year(p.date)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <div className={styles.previewCol} aria-hidden={!desktop}>
            <aside className={styles.preview} aria-label="Project preview">
              {preview && (
                <div key={preview.id} className={styles.previewInner} data-active="true" style={{ ["--accent" as string]: projectAccent(preview) } as CSSProperties}>
                  <ProjectDiagram project={preview} />
                  <h3 className={styles.previewTitle}>{preview.title}</h3>
                  <p className={styles.summary}>{preview.summary}</p>
                  <Tags tags={preview.tags} />
                  <Links project={preview} />
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence
            onExitComplete={() => {
              triggerRef.current?.focus({ preventScroll: true });
              triggerRef.current = null;
            }}
          >
            {open && <Detail key={open.id} project={open} desktop={desktop} onClose={close} />}
          </AnimatePresence>,
          document.body,
        )}
    </section>
  );
}
