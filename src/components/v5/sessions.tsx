"use client";

import { useCallback, useRef, useState } from "react";
import type { Experience } from "@/data/content-types";
import { gsap, useGSAP } from "@/components/v5/gsap";
import s from "./sessions.module.css";

function earliestYear(items: Experience[]): string {
  let min = Infinity;
  for (const e of items) {
    const years = e.period.match(/\b(19|20)\d{2}\b/g);
    if (years) for (const y of years) min = Math.min(min, Number(y));
  }
  return Number.isFinite(min) ? String(min) : "";
}

export function Sessions({ experience }: { experience: Experience[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  // Desktop pin: index of the card nearest the viewport center (-1 when not pinned).
  const [active, setActive] = useState(-1);
  // Rail (mobile / reduced motion): index of the card snapped into view.
  const [railIdx, setRailIdx] = useState(0);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { desktop: "(min-width: 800px) and (prefers-reduced-motion: no-preference)" },
        (ctx) => {
          if (!ctx.conditions?.desktop) return;
          const track = trackRef.current;
          const pin = pinRef.current;
          const fill = fillRef.current;
          if (!track || !pin || !fill) return;

          const cards = Array.from(track.children) as HTMLElement[];
          let centers: number[] = [];
          let lastIdx = -2;
          const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);
          const measure = () => {
            centers = cards.map((c) => c.offsetLeft + c.offsetWidth / 2);
          };
          measure();

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: pin,
              pin: true,
              start: "top top",
              end: () => "+=" + distance(),
              scrub: 0.6,
              invalidateOnRefresh: true,
              onRefreshInit: measure,
            },
            onUpdate: () => {
              const x = -(gsap.getProperty(track, "x") as number);
              const mid = x + track.clientWidth / 2;
              let best = 0;
              let bestD = Infinity;
              for (let i = 0; i < centers.length; i++) {
                const d = Math.abs(centers[i] - mid);
                if (d < bestD) {
                  bestD = d;
                  best = i;
                }
              }
              if (best !== lastIdx) {
                lastIdx = best;
                setActive(best);
              }
            },
          });
          tl.fromTo(track, { x: 0 }, { x: () => -distance() }, 0);
          tl.fromTo(fill, { scaleX: 0 }, { scaleX: 1 }, 0);

          return () => {
            setActive(-1);
          };
        }
      );
      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  const onRailScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    if (!cards.length) return;
    // Only meaningful when the track itself scrolls (rail layout).
    if (track.scrollWidth <= track.clientWidth + 1) return;
    let idx = 0;
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) {
      idx = cards.length - 1;
    } else {
      const base = cards[0].offsetLeft;
      let bestD = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft - base - track.scrollLeft);
        if (d < bestD) {
          bestD = d;
          idx = i;
        }
      });
    }
    setRailIdx((prev) => (prev === idx ? prev : idx));
  }, []);

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    const card = cards[i];
    if (!card) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: card.offsetLeft - cards[0].offsetLeft, behavior: reduce ? "auto" : "smooth" });
  };

  const iat = earliestYear(experience);

  return (
    <section id="work" aria-labelledby="work-title" ref={sectionRef} className={s.section}>
      <div className={`wrap ${s.head}`}>
        <h2 id="work-title" className="t-section">
          Session history
        </h2>
        <p className={s.intro}>Healthcare IAM, CIAM in banking, and now Auth0 platform work at Okta.</p>
      </div>

      <div className={s.pin} ref={pinRef}>
        <div className={`wrap ${s.timeline}`} aria-hidden="true">
          <span className="t-meta">iat {iat}</span>
          <span className={s.line}>
            <span className={s.fill} ref={fillRef} />
          </span>
          <span className="t-meta">exp never</span>
        </div>

        <ul className={s.track} ref={trackRef} onScroll={onRailScroll} role="list">
          {experience.map((e, i) => {
            const isOpen = !!open[e.id];
            const hlId = `hl-${e.id}`;
            return (
              <li key={e.id} className={s.card} data-active={active === i ? "true" : "false"}>
                <div className={`t-meta ${s.meta}`}>
                  <span>{e.period}</span>
                  <span>{e.location}</span>
                </div>
                <h3 className={s.company}>{e.company}</h3>
                <p className={s.role}>{e.role}</p>
                {e.contractInfo ? <p className={`t-meta ${s.contract}`}>{e.contractInfo}</p> : null}
                <p className={s.summary}>{e.summary}</p>

                <button
                  type="button"
                  className={s.toggle}
                  aria-expanded={isOpen}
                  aria-controls={hlId}
                  onClick={() => setOpen((o) => ({ ...o, [e.id]: !o[e.id] }))}
                >
                  {isOpen ? "Hide highlights" : `Show ${e.highlights.length} highlights`}
                </button>

                <div className={s.hl} data-open={isOpen ? "true" : "false"} id={hlId}>
                  <div className={s.hlInner}>
                    <ul className={s.list} role="list">
                      {e.highlights.map((h, k) => (
                        <li key={k}>{h}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <ul className={s.tags} role="list" aria-label={`${e.company} tags`}>
                  {e.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>

        <div className={s.dots}>
          {experience.map((e, i) => (
            <button
              key={e.id}
              type="button"
              className={s.dot}
              data-on={railIdx === i ? "true" : "false"}
              aria-label={`Go to ${e.company}`}
              aria-current={railIdx === i ? "true" : undefined}
              onClick={() => goTo(i)}
            >
              <span />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
