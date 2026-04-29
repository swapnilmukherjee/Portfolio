"use client";

import { Reveal } from "./reveal";
import { SpotlightCard } from "./spotlight-card";
import { getIcon } from "@/lib/icons";
import contentJson from "@/data/content.json";

export function Skills() {
  const { skills } = contentJson;

  return (
    <section id="skills" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">04 — Toolkit</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-text sm:text-5xl">
            What I reach <span className="text-gradient">for</span>.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((group, idx) => {
            const Icon = getIcon(group.icon);
            return (
              <Reveal key={group.category} delay={idx * 0.05}>
                <SpotlightCard className="flex h-full flex-col p-7">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold tracking-tight text-text">{group.category}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-md border border-border/50 bg-bg/40 px-2 py-1 text-[11px] font-medium text-text/85 transition hover:border-accent/40 hover:bg-accent/10 hover:text-text"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
