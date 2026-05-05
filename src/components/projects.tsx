"use client";

import { forwardRef, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import type { Project } from "@/data/content-types";
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

export function Projects({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<Category>("All");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(
    () => (active === "All" ? projects : projects.filter((p) => p.category === active)),
    [active, projects]
  );

  const visible = showAll ? filtered : filtered.slice(0, 6);
  const carouselKey = `${active}-${showAll}-${visible.length}`;
  const carousel = useSnapCarousel(visible.length, carouselKey);

  return (
    <section id="projects" className="relative z-[2] py-32 sm:py-44">
      <div className="mx-auto max-w-[1320px] px-6 sm:px-8">
        <motion.div {...reveal} className="mb-6">
          <span className="eyebrow">03 / Projects</span>
        </motion.div>

        <div className="mb-12 grid items-end gap-12 lg:grid-cols-[1fr_0.55fr] lg:gap-14">
          <motion.h2 {...reveal} className="display-section">
            Selected <b className="ir-text">work.</b>
          </motion.h2>
          <motion.p {...reveal} className="max-w-[360px] text-base leading-[1.65] text-text/55">
            A mix of identity, security research, and full-stack engineering, built across grad school and personal time.
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
                onClick={() => {
                  setActive(cat);
                  setShowAll(false);
                }}
                className={cn(
                  "glass rounded-full px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition",
                  isActive
                    ? "text-text-strong"
                    : "text-text/55 hover:text-text/92"
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
          <motion.div
            {...reveal}
            data-carousel-scroller="true"
            ref={carousel.ref}
            onScroll={carousel.onScroll}
            className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-6 pb-6 no-scrollbar sm:-mx-8 sm:px-8 md:gap-5 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:p-0 lg:pb-0"
          >
            <AnimatePresence mode="popLayout">
              {visible.map((p, i) => (
                <Card key={p.id} project={p} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>

          <CarouselIndicator
            count={visible.length}
            activeIndex={carousel.activeIndex}
            progress={carousel.progress}
            onSelect={carousel.scrollToIndex}
          />
        </div>

        {filtered.length > 6 && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="glass rounded-full px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-text/92 transition hover:bg-white/[0.07]"
            >
              {showAll ? "Show less" : `View all ${filtered.length} projects`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

const Card = forwardRef<HTMLElement, { project: Project; index: number }>(function Card({ project, index }, ref) {
  return (
    <motion.article
      ref={ref}
      data-carousel-item="true"
      layout
      initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
      transition={{ duration: 0.55, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex min-h-[300px] w-[86vw] max-w-[420px] shrink-0 snap-start scroll-ml-6 flex-col gap-4 overflow-hidden rounded-[26px] bg-surface p-6 transition-colors duration-300 sm:w-[56vw] sm:scroll-ml-8 md:w-[46vw] lg:min-h-[280px] lg:w-auto lg:max-w-none lg:shrink lg:snap-none lg:scroll-ml-0 lg:rounded-[28px] lg:p-9"
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

      <h3 className="relative text-[28px] font-light leading-[1.08] tracking-normal text-text-strong sm:text-[30px] lg:text-[32px]">
        {project.title}
      </h3>

      <p className="relative flex-1 text-[14px] leading-[1.55] text-text/55">{project.summary}</p>

      <div className="relative flex items-start justify-between gap-4 border-t border-white/[0.08] pt-4 font-mono text-[10px] text-text/55">
        <div className="flex min-w-0 flex-wrap gap-x-1.5 gap-y-1">
          {project.tags.slice(0, 3).map((t, i) => (
            <span key={t}>
              {t}
              {i < Math.min(project.tags.length, 3) - 1 ? <span className="px-1">·</span> : null}
            </span>
          ))}
        </div>
        <span className="shrink-0">{project.date}</span>
      </div>
    </motion.article>
  );
});
