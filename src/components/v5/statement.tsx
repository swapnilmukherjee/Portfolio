"use client";

import { useRef } from "react";

import { gsap, useGSAP } from "./gsap";
import styles from "./statement.module.css";

/** The about paragraph, read word by word: words light up as they pass the reading line. */
export function Statement({ text }: { text: string }) {
  const root = useRef<HTMLElement>(null);
  const words = text.split(/\s+/).filter(Boolean);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          `.${styles.w}`,
          { opacity: 0.18 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.04,
            scrollTrigger: { trigger: `.${styles.text}`, start: "top 78%", end: "bottom 52%", scrub: 0.5 },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="about" ref={root} className={styles.section} aria-label="About">
      <div className="wrap">
        <p className={styles.text}>
          {words.map((w, i) => (
            <span key={i} className={styles.w}>
              {w}{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
