"use client";

import { motion } from "framer-motion";
import type { Profile, SiteCopy } from "@/data/content-types";

const reveal = {
  initial: { opacity: 0, y: 28, filter: "blur(8px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
};

export function About({ profile, siteCopy }: { profile: Profile; siteCopy: SiteCopy }) {
  const headingLines = siteCopy.aboutHeading.split("\n");

  return (
    <section id="about" className="relative z-[2] py-32 sm:py-44">
      <div className="mx-auto max-w-[1320px] px-6 sm:px-8">
        <motion.div {...reveal} className="mb-6">
          <span className="eyebrow">01 / About</span>
        </motion.div>

        <div className="mb-16 grid items-end gap-12 lg:grid-cols-[1fr_0.55fr] lg:gap-14">
          <motion.h2 {...reveal} className="display-section">
            {headingLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < headingLines.length - 1 && <br />}
              </span>
            ))}
            {siteCopy.aboutHeadingBold && <> <b className="ir-text">{siteCopy.aboutHeadingBold}</b></>}
          </motion.h2>
          <motion.p {...reveal} className="max-w-[360px] text-base leading-[1.65] text-text/55">
            {siteCopy.aboutSubheading}
          </motion.p>
        </div>

        <motion.p
          {...reveal}
          className="max-w-[780px] text-[18px] leading-[1.7] text-text/92"
        >
          {profile.about}
        </motion.p>

        <motion.div {...reveal} className="glass mt-12 grid grid-cols-1 overflow-hidden rounded-[28px] sm:grid-cols-3">
          {siteCopy.aboutStats.map((stat, i, arr) => (
            <div
              key={stat.key}
              className={`p-9 ${i < arr.length - 1 ? "border-b border-white/[0.08] sm:border-b-0 sm:border-r" : ""}`}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: "rgb(var(--grad-2))" }}>
                {stat.key}
              </div>
              <div className="mt-4 text-[28px] font-light tracking-tight text-text-strong">{stat.value}</div>
              <div className="mt-1.5 text-sm text-text/55">{stat.sub}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
