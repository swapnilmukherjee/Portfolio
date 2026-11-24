"use client";

import { useEffect, useRef, useState } from "react";
import type { SkillGroup } from "@/data/content-types";
import { gsap, useGSAP } from "@/components/v5/gsap";
import styles from "./toolkit.module.css";

function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 799px)");
    const u = () => setM(mq.matches);
    u();
    mq.addEventListener("change", u);
    return () => mq.removeEventListener("change", u);
  }, []);
  return m;
}

export function Toolkit({ skills }: { skills: SkillGroup[] }) {
  const ref = useRef<HTMLElement>(null);
  const mobile = useMobile();
  const [openIdx, setOpenIdx] = useState(0);

  // Scope grants: items fade in one by one as each row crosses the viewport (desktop only).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 800px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-row]").forEach((row) => {
          const toks = row.querySelectorAll("[data-tok]");
          const rule = row.querySelector("[data-rule]");
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: row, start: "top 85%", end: "top 45%", scrub: 0.6 },
          });
          if (rule) tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.3 }, 0);
          tl.fromTo(
            toks,
            { opacity: 0.25 },
            { opacity: 1, duration: 0.25, stagger: { each: 0.65 / Math.max(toks.length, 1) } },
            0.1,
          );
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section id="toolkit" aria-labelledby="toolkit-title" className={styles.section} ref={ref}>
      <div className="wrap">
        <h2 id="toolkit-title" className="t-section">Toolkit</h2>
        <ul className={styles.list}>
          {skills.map((g, i) => {
            const open = i === openIdx;
            const pid = `toolkit-panel-${i}`;
            return (
              <li key={g.category} data-row className={`${styles.row} ${open ? styles.open : ""}`}>
                <h3 className={styles.cat}>
                  {mobile ? (
                    <button
                      type="button"
                      className={styles.catBtn}
                      aria-expanded={open}
                      aria-controls={pid}
                      onClick={() => setOpenIdx(open ? -1 : i)}
                    >
                      <span className={styles.catText}>{g.category}</span>
                      <svg className={styles.chev} width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 7l5 5 5-5" />
                      </svg>
                    </button>
                  ) : (
                    <span className={styles.catText}>
                      {g.category}
                      <span className={styles.rule} data-rule aria-hidden="true" />
                    </span>
                  )}
                </h3>
                <div className={styles.panel} id={pid}>
                  <div className={styles.panelInner}>
                    <ul className={styles.scope} aria-label={`${g.category} skills`}>
                      {g.items.map((it) => (
                        <li key={it} data-tok className={styles.tok}>
                          {it}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
