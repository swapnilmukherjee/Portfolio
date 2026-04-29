"use client";

import { Award, GraduationCap, MapPin } from "lucide-react";

import { Reveal } from "./reveal";
import { SpotlightCard } from "./spotlight-card";
import contentJson from "@/data/content.json";

export function Education() {
  const { education, certifications } = contentJson;

  return (
    <section id="education" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">05 — Education & Credentials</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-text sm:text-5xl">
            School and <span className="text-gradient">certifications</span>.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {education.map((edu, idx) => (
            <Reveal key={edu.id} delay={idx * 0.05}>
              <SpotlightCard className="p-7">
                <div className="flex items-start justify-between">
                  <div className="grid h-9 w-9 place-items-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <span className="font-mono text-xs text-muted">{edu.period}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-text">{edu.school}</h3>
                <p className="mt-1 text-sm text-accent">{edu.degree}</p>
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted">
                  <MapPin className="h-3 w-3" /> {edu.location}
                </p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <h3 className="mt-20 text-xs font-medium uppercase tracking-[0.2em] text-muted">Certifications</h3>
        </Reveal>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {certifications.map((c, idx) => (
            <Reveal key={c.name} delay={idx * 0.03}>
              <SpotlightCard className="flex items-center gap-4 p-5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
                  <Award className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-text">{c.name}</div>
                  <div className="text-xs text-muted">{c.issuer}</div>
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
