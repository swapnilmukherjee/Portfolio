"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, ChevronDown, MapPin } from "lucide-react";

import { Reveal } from "./reveal";
import { SpotlightCard } from "./spotlight-card";
import contentJson from "@/data/content.json";
import { cn } from "@/lib/cn";

export function Experience() {
  const { experience } = contentJson;
  const [openId, setOpenId] = useState<string | null>(experience[0]?.id ?? null);

  return (
    <section id="experience" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">02 — Experience</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-text sm:text-5xl">
            Where I&rsquo;ve <span className="text-gradient">built things</span>.
          </h2>
          <p className="mt-4 max-w-xl text-sm text-muted sm:text-base">
            Five years operating customer and workforce identity at scale — across financial services, healthcare, and now the platform side at Okta.
          </p>
        </Reveal>

        <div className="mt-14 space-y-4">
          {experience.map((job, idx) => {
            const open = openId === job.id;
            return (
              <Reveal key={job.id} delay={idx * 0.05}>
                <SpotlightCard className="overflow-hidden p-0">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : job.id)}
                    className="flex w-full items-start gap-5 p-6 text-left sm:p-8"
                    aria-expanded={open}
                  >
                    <div
                      className={cn(
                        "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm",
                        job.color
                      )}
                    >
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-lg font-semibold tracking-tight text-text sm:text-xl">
                          {job.role}{" "}
                          <span className="text-muted">·</span>{" "}
                          <span className="text-text/90">{job.company}</span>
                        </h3>
                        <span className="font-mono text-xs text-muted">{job.period}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                        {job.contractInfo ? (
                          <span className="italic">{job.contractInfo}</span>
                        ) : null}
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {job.location}
                        </span>
                        <span>{job.type}</span>
                      </div>
                      <p className="mt-3 text-sm text-text/80 sm:text-base">{job.summary}</p>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {job.tags.slice(0, 6).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md border border-border/60 bg-bg/50 px-2 py-0.5 text-[11px] font-medium text-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronDown
                      className={cn(
                        "mt-1 h-4 w-4 shrink-0 text-muted transition-transform duration-300",
                        open && "rotate-180 text-text"
                      )}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border/50 px-6 pb-8 pt-6 sm:px-8">
                          <ul className="space-y-3">
                            {job.highlights.map((line, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-text/85 sm:text-[15px]">
                                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                                <span>{line}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
