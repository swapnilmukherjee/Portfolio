"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Reveal } from "./reveal";
import { SpotlightCard } from "./spotlight-card";
import { getIcon } from "@/lib/icons";
import contentJson from "@/data/content.json";
import { cn } from "@/lib/cn";

const CATEGORIES = ["All", "Cybersecurity", "Web Engineering", "Automation & IoT", "AI & Data"] as const;
type Category = (typeof CATEGORIES)[number];

export function Projects() {
  const { projects } = contentJson;
  const [active, setActive] = useState<Category>("All");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(
    () => (active === "All" ? projects : projects.filter((p) => p.category === active)),
    [active, projects]
  );

  const visible = showAll ? filtered : filtered.slice(0, 6);

  return (
    <section id="projects" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">03 — Projects</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-text sm:text-5xl">
                Selected <span className="text-gradient">work</span>.
              </h2>
              <p className="mt-4 max-w-xl text-sm text-muted sm:text-base">
                A mix of identity, security research, and full-stack engineering — built across grad school and personal time.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActive(cat);
                    setShowAll(false);
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    active === cat
                      ? "border-accent/60 bg-accent/15 text-text"
                      : "border-border/60 bg-bg-elevated/40 text-muted hover:border-border hover:text-text"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <motion.div layout className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((p, i) => {
              const Icon = getIcon(p.icon);
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                >
                  <SpotlightCard className="flex h-full flex-col p-0">
                    {/* Visual */}
                    <div className={cn("relative h-40 overflow-hidden bg-gradient-to-br", p.color)}>
                      <div className="absolute inset-0 bg-noise opacity-40" />
                      <div className="absolute inset-0 grid place-items-center">
                        <Icon className="h-14 w-14 text-white/90 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3" />
                      </div>
                      <span className="absolute left-3 top-3 rounded-md bg-black/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">
                        {p.category}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-semibold tracking-tight text-text">{p.title}</h3>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text" />
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm text-text/75">{p.summary}</p>

                      <div className="mt-auto pt-5">
                        <div className="flex items-center justify-between border-t border-border/50 pt-3">
                          <div className="flex flex-wrap gap-1.5">
                            {p.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-md bg-bg/50 px-1.5 py-0.5 text-[10px] font-medium text-muted"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted">
                            <Calendar className="h-3 w-3" /> {p.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filtered.length > 6 && (
          <Reveal>
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="rounded-full border border-border/70 bg-bg-elevated/60 px-6 py-2.5 text-xs font-medium uppercase tracking-widest text-text transition hover:border-accent/40 hover:bg-accent/10"
              >
                {showAll ? "Show less" : `View all ${filtered.length} projects`}
              </button>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
