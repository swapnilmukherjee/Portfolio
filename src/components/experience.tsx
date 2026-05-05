"use client";

import { motion } from "framer-motion";
import type { Experience as ExpType } from "@/data/content-types";

const reveal = {
  initial: { opacity: 0, y: 28, filter: "blur(8px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
};

export function Experience({ experience }: { experience: ExpType[] }) {
  return (
    <section id="experience" className="relative z-[2] py-32 sm:py-44">
      <div className="mx-auto max-w-[1320px] px-6 sm:px-8">
        <motion.div {...reveal} className="mb-6">
          <span className="eyebrow">02 / Experience</span>
        </motion.div>

        <div className="mb-16 grid items-end gap-12 lg:grid-cols-[1fr_0.55fr] lg:gap-14">
          <motion.h2 {...reveal} className="display-section">
            Five years,
            <br />
            <b className="ir-text">four chapters.</b>
          </motion.h2>
          <motion.p {...reveal} className="max-w-[360px] text-base leading-[1.65] text-text/55">
            Customer and workforce identity at scale, financial services, healthcare, and now Auth0 platform consulting.
          </motion.p>
        </div>

        {experience.map((job, i) => (
          <Row key={job.id} job={job} index={i} />
        ))}
      </div>
    </section>
  );
}

function Row({ job, index }: { job: ExpType; index: number }) {
  return (
    <motion.article
      {...reveal}
      className="grid grid-cols-1 gap-10 border-t border-white/[0.08] py-14 lg:grid-cols-[0.75fr_2.25fr] lg:gap-16 lg:py-16 last:border-b"
    >
      {/* Left meta column */}
      <div>
        <div className="lg:sticky lg:top-28">
          <div
            className="font-light leading-[0.9] tracking-tighter"
            style={{
              fontSize: "clamp(72px, 9vw, 124px)",
              background: "linear-gradient(135deg, rgb(var(--grad-1)), rgb(var(--grad-2)))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: "-0.06em",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </div>
          <div className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-text/55">{job.period}</div>
          <div className="mt-1.5 font-mono text-[11px] text-text/30">{job.location}</div>
        </div>
      </div>

      {/* Right content column */}
      <div>
        <h3 className="text-[clamp(28px,3.2vw,44px)] font-light leading-[1.05] tracking-tight text-text-strong">
          {job.role}
        </h3>
        <p className="mt-2 text-base text-text/55">
          <strong className="font-medium text-text/92">{job.company}</strong>
          {job.contractInfo ? <span> · {job.contractInfo}</span> : <span> · {job.type}</span>}
        </p>
        <p className="mt-5 max-w-[720px] text-base leading-[1.65] text-text/92">{job.summary}</p>

        <ul className="mt-8 flex flex-col gap-3.5 border-t border-white/[0.08] pt-7">
          {job.highlights.map((line, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-15% 0px -10% 0px" }}
              transition={{ duration: 0.75, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-[32px_1fr] gap-3 text-[15px] leading-[1.6] text-text/92"
            >
              <span
                className="pt-1 font-mono text-[11px]"
                style={{
                  background: "linear-gradient(135deg, rgb(var(--grad-1)), rgb(var(--grad-2)))",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {String(i + 1).padStart(3, "0")}
              </span>
              <span>{line}</span>
            </motion.li>
          ))}
        </ul>

        <div className="mt-7 flex flex-wrap gap-2">
          {job.tags.map((t) => (
            <span
              key={t}
              className="glass rounded-md px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-text/55"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
