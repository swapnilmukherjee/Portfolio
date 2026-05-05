"use client";

import { motion } from "framer-motion";
import type { SkillGroup } from "@/data/content-types";

const reveal = {
  initial: { opacity: 0, y: 28, filter: "blur(8px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
};

export function Skills({ skills }: { skills: SkillGroup[] }) {
  return (
    <section id="skills" className="relative z-[2] py-32 sm:py-44">
      <div className="mx-auto max-w-[1320px] px-6 sm:px-8">
        <motion.div {...reveal} className="mb-6">
          <span className="eyebrow">04 / Toolkit</span>
        </motion.div>

        <div className="mb-16 grid items-end gap-12 lg:grid-cols-[1fr_0.55fr] lg:gap-14">
          <motion.h2 {...reveal} className="display-section">
            What I <b className="ir-text">reach for.</b>
          </motion.h2>
          <motion.p {...reveal} className="max-w-[360px] text-base leading-[1.65] text-text/55">
            The protocols, platforms, and tools I use day-to-day.
          </motion.p>
        </div>

        <motion.div
          {...reveal}
          className="grid overflow-hidden rounded-[28px] border border-white/[0.08] gap-px bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-3"
        >
          {skills.map((g) => (
            <div key={g.category} className="bg-bg p-8">
              <div
                className="font-mono text-[10px] uppercase tracking-[0.22em]"
                style={{ color: "rgb(var(--grad-2))" }}
              >
                {g.category}
              </div>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {g.items.map((item) => (
                  <span
                    key={item}
                    className="glass rounded-md px-3 py-1.5 text-[12px] text-text/92"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
