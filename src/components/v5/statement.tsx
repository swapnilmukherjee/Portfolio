"use client";

import { useRef } from "react";

import type { Highlight } from "@/data/content-types";

import { gsap, useGSAP } from "./gsap";
import styles from "./statement.module.css";

/** Splits "22,000+" into a countable number and its formatting. */
function parseMetric(value: string) {
  const m = value.match(/^([^\d]*)([\d,.]+)(.*)$/);
  if (!m) return null;
  const n = Number(m[2].replace(/,/g, ""));
  if (!Number.isFinite(n)) return null;
  return { prefix: m[1], n, suffix: m[3], comma: m[2].includes(","), decimals: (m[2].split(".")[1] || "").length };
}

function format(p: NonNullable<ReturnType<typeof parseMetric>>, v: number) {
  const fixed = v.toFixed(p.decimals);
  const body = p.comma ? Number(fixed).toLocaleString("en-US", { minimumFractionDigits: p.decimals }) : fixed;
  return `${p.prefix}${body}${p.suffix}`;
}

/** "300M+" -> "300", "22,000+" -> "22,000": the part that counts up. */
function numberPart(value: string) {
  return value.match(/^[^\d]*[\d,.]+/)?.[0] ?? value;
}

/** The about paragraph, read word by word, then the numbers that back it up. */
export function Statement({ text, metrics }: { text: string; metrics: Highlight[] }) {
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

        const items = gsap.utils.toArray<HTMLElement>(`.${styles.metric}`);
        if (!items.length) return;
        const tl = gsap.timeline({
          paused: true,
          scrollTrigger: { trigger: `.${styles.metrics}`, start: "top 82%", once: true, onEnter: () => tl.play() },
        });
        items.forEach((el, i) => {
          const num = el.querySelector<HTMLElement>("[data-value]");
          const rule = el.querySelector<HTMLElement>(`.${styles.rule}`);
          const at = i * 0.12;
          if (rule) tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "expo.out" }, at);
          tl.fromTo(el.querySelectorAll(`.${styles.label}, .${styles.detail}`), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" }, at + 0.15);
          const parsed = num ? parseMetric(num.dataset.value || "") : null;
          if (num && parsed) {
            num.textContent = format(parsed, 0);
            const o = { v: 0 };
            tl.to(
              o,
              {
                v: parsed.n,
                duration: 1.4,
                ease: "expo.out",
                onUpdate: () => {
                  num.textContent = format(parsed, parsed.decimals ? o.v : Math.round(o.v));
                },
                onComplete: () => {
                  num.textContent = num.dataset.value || "";
                },
              },
              at,
            );
          }
        });
        return () => {
          items.forEach((el) => {
            const num = el.querySelector<HTMLElement>("[data-value]");
            if (num) num.textContent = num.dataset.value || "";
          });
        };
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

        {metrics.length > 0 && (
          <dl className={styles.metrics}>
            {metrics.map((m, i) => (
              <div key={m.label} className={styles.metric} style={{ ["--acc" as string]: ["var(--c2)", "var(--c1)", "var(--c3)"][i % 3] } as React.CSSProperties}>
                <span className={styles.rule} aria-hidden="true" />
                <dt className={styles.label}>{m.label}</dt>
                <dd className={styles.value}>
                  <span data-value={numberPart(m.value)}>{numberPart(m.value)}</span>
                  <span className={styles.suffix}>{m.value.slice(numberPart(m.value).length)}</span>
                </dd>
                <dd className={styles.detail}>{m.detail}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
