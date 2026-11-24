"use client";

import { useRef } from "react";
import type { Certification, Education } from "@/data/content-types";
import { gsap, ScrollTrigger, useGSAP } from "@/components/v5/gsap";
import s from "./credentials.module.css";

type Pass = { key: string; issuer: string; title: string; period?: string };

function Seal() {
  return (
    <svg className={s.seal} width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true" focusable="false">
      <circle cx="13" cy="13" r="11.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.4 2.1" />
      <circle cx="13" cy="13" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9.2 13.2l2.6 2.6 5-5.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function tone(i: number) {
  return i < 3 ? s[`solid${i + 1}`] : s.plain;
}

function PassCard({ pass, index }: { pass: Pass; index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLLIElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${((px - 0.5) * 12).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${((0.5 - py) * 12).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <li className={s.item} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className={`${s.pass} ${tone(index)}`} ref={ref}>
        <div className={s.top}>
          <span className={s.issuer}>{pass.issuer}</span>
          <Seal />
        </div>
        <div className={s.bottom}>
          <h3 className={s.name}>{pass.title}</h3>
          {pass.period ? <span className={s.period}>{pass.period}</span> : null}
        </div>
      </div>
    </li>
  );
}

export function Credentials({
  certifications,
  education,
}: {
  certifications: Certification[];
  education: Education[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const passes: Pass[] = [
    ...education.map((e) => ({ key: `edu-${e.id}`, issuer: e.school, title: e.degree, period: e.period })),
    ...certifications
      .filter((c) => c.status !== "in-progress")
      // The Auth0 developer cert is the most relevant one: always first after the degrees.
      .sort((a, b) => Number(/auth0 certified developer/i.test(b.name)) - Number(/auth0 certified developer/i.test(a.name)))
      .map((c, i) => ({ key: `cert-${i}-${c.name}`, issuer: c.issuer, title: c.name })),
  ];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { desktop: "(min-width: 800px) and (prefers-reduced-motion: no-preference)" },
        (ctx) => {
          if (!ctx.conditions?.desktop) return;
          const list = listRef.current;
          if (!list) return;
          const cards = Array.from(list.children) as HTMLElement[];
          if (cards.length < 2) return;
          const first = cards[0];

          // FLIP: the grid is the final layout; passes start stacked on the first one and
          // deal out once, as a played animation (not scrubbed), so any scroll position,
          // including a nav jump, ends on the full grid.
          const stacked = {
            x: (i: number) => first.offsetLeft - cards[i].offsetLeft,
            y: (i: number) => first.offsetTop - cards[i].offsetTop + Math.min(i, 7) * 10,
            rotation: (i: number) => ((i % 5) - 2) * 1.1,
          };
          gsap.set(cards, { zIndex: (i: number) => cards.length - i });
          const deal = gsap.fromTo(
            cards,
            stacked,
            { x: 0, y: 0, rotation: 0, ease: "power3.out", duration: 0.9, stagger: 0.045, paused: true, immediateRender: true },
          );
          ScrollTrigger.create({
            trigger: list,
            start: "top 85%",
            onEnter: () => deal.play(),
            onLeaveBack: () => deal.reverse(),
          });
          // Already past the trigger (reload mid-page or anchor jump): show the grid.
          if (list.getBoundingClientRect().top < window.innerHeight * 0.85) deal.progress(1);
        }
      );
      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [passes.length] }
  );

  return (
    <section id="credentials" aria-labelledby="cred-title" ref={sectionRef} className={s.section}>
      <div className="wrap">
        <div className={s.head}>
          <h2 id="cred-title" className="t-section">
            Verified credentials
          </h2>
          <p className={`t-meta ${s.count}`}>{passes.length} credentials</p>
        </div>
        <ul className={s.list} ref={listRef} role="list">
          {passes.map((p, i) => (
            <PassCard key={p.key} pass={p} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}
