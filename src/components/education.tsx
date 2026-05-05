"use client";

import { motion } from "framer-motion";
import { Award, Clock } from "lucide-react";

import type { Certification, Education as EduType } from "@/data/content-types";

const reveal = {
  initial: { opacity: 0, y: 28, filter: "blur(8px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
};

export function Education({
  education,
  certifications,
}: {
  education: EduType[];
  certifications: Certification[];
}) {
  const inProgress = certifications.filter((c) => c.status === "in-progress");
  const earned = certifications.filter((c) => (c.status ?? "earned") === "earned");

  return (
    <section id="credentials" className="relative z-[2] py-32 sm:py-44">
      <div className="mx-auto max-w-[1320px] px-6 sm:px-8">
        <motion.div {...reveal} className="mb-6">
          <span className="eyebrow">05 / Credentials</span>
        </motion.div>

        <div className="mb-16 grid items-end gap-12 lg:grid-cols-[1fr_0.55fr] lg:gap-14">
          <motion.h2 {...reveal} className="display-section">
            School &amp; <b className="ir-text">certifications.</b>
          </motion.h2>
          <motion.p {...reveal} className="max-w-[360px] text-base leading-[1.65] text-text/55">
            Education and the credentials shaping how I think about identity, security, and engineering.
          </motion.p>
        </div>

        {/* Education */}
        <motion.div
          {...reveal}
          className="grid overflow-hidden rounded-[28px] border border-white/[0.08] gap-px bg-white/[0.08] sm:grid-cols-2"
        >
          {education.map((edu) => (
            <div key={edu.id} className="bg-bg p-9">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: "rgb(var(--grad-2))" }}>
                {edu.degree}
              </div>
              <div className="mt-5 text-[28px] font-light tracking-tight text-text-strong">{edu.school}</div>
              <div
                className="mt-1.5 text-sm"
                style={{
                  background: "linear-gradient(135deg, rgb(var(--grad-1)), rgb(var(--grad-2)))",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {edu.location}
              </div>
              <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-text/55">{edu.period}</div>
            </div>
          ))}
        </motion.div>

        {/* In-progress */}
        {inProgress.length > 0 && (
          <motion.div {...reveal} className="mt-16">
            <h3 className="mb-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text/55">
              <Clock className="h-3 w-3" /> In Progress
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {inProgress.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center gap-3.5 rounded-2xl border border-dashed p-[18px_22px]"
                  style={{
                    borderColor: "rgb(var(--grad-1) / 0.4)",
                    background:
                      "linear-gradient(135deg, rgb(var(--grad-1) / 0.06), rgb(var(--grad-2) / 0.04))",
                  }}
                >
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border"
                    style={{
                      borderColor: "rgb(var(--grad-1) / 0.3)",
                      background:
                        "linear-gradient(135deg, rgb(var(--grad-1) / 0.15), rgb(var(--grad-2) / 0.15))",
                    }}
                  >
                    <Award className="h-4 w-4" style={{ color: "rgb(var(--grad-1))" }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-text/92">{c.name}</div>
                    <div className="text-xs text-text/55">{c.issuer}</div>
                  </div>
                  {c.expected && (
                    <span
                      className="ml-auto rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em]"
                      style={{
                        borderColor: "rgb(var(--grad-1) / 0.3)",
                        background: "linear-gradient(135deg, rgb(var(--grad-1)), rgb(var(--grad-2)))",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      {c.expected}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Earned */}
        <motion.div {...reveal} className="mt-16">
          <h3 className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-text/55">Earned</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {earned.map((c) => (
              <div key={c.name} className="glass flex items-center gap-3.5 rounded-2xl p-[18px_22px]">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border"
                  style={{
                    borderColor: "rgb(var(--grad-1) / 0.3)",
                    background:
                      "linear-gradient(135deg, rgb(var(--grad-1) / 0.15), rgb(var(--grad-2) / 0.15))",
                  }}
                >
                  <Award className="h-4 w-4" style={{ color: "rgb(var(--grad-1))" }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-text/92">{c.name}</div>
                  <div className="text-xs text-text/55">{c.issuer}</div>
                </div>
                {c.issued && (
                  <span
                    className="ml-auto rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em]"
                    style={{
                      borderColor: "rgb(var(--grad-2) / 0.25)",
                      color: "rgb(var(--text) / 0.55)",
                    }}
                  >
                    {c.issued}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
