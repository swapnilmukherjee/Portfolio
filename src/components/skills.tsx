"use client";

import { motion } from "framer-motion";
import type { SkillGroup } from "@/data/content-types";
import { CarouselIndicator, useSnapCarousel } from "@/components/carousel-indicator";

const reveal = {
  initial: { opacity: 0, y: 28, filter: "blur(8px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
};

export function Skills({ skills }: { skills: SkillGroup[] }) {
  const carousel = useSnapCarousel(skills.length, String(skills.length));

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

        <div className="relative">
          <motion.div
            {...reveal}
            data-carousel-scroller="true"
            ref={carousel.ref}
            onScroll={carousel.onScroll}
            className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-6 pb-6 no-scrollbar sm:-mx-8 sm:px-8 md:gap-5 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:p-0 lg:pb-0"
          >
            {skills.map((g) => (
              <div
                key={g.category}
                data-carousel-item="true"
                className="min-h-[280px] w-[86vw] max-w-[420px] shrink-0 snap-start scroll-ml-6 rounded-[26px] bg-surface p-6 sm:w-[56vw] sm:scroll-ml-8 md:w-[46vw] lg:min-h-0 lg:w-auto lg:max-w-none lg:shrink lg:snap-none lg:scroll-ml-0 lg:rounded-[28px] lg:p-8"
              >
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
                      className="glass rounded-md px-3 py-1.5 text-[12px] leading-5 text-text/92"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>

          <CarouselIndicator
            count={skills.length}
            activeIndex={carousel.activeIndex}
            progress={carousel.progress}
            onSelect={carousel.scrollToIndex}
          />
        </div>
      </div>
    </section>
  );
}
