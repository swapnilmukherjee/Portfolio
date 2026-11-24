"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { Certification, Experience, Project, SkillGroup } from "@/data/content-types";
import { gsap, ScrollTrigger, useGSAP } from "@/components/v5/gsap";
import { evidenceFor, scopeSlug, skillPattern, type Evidence } from "@/lib/skill-evidence";
import styles from "./toolkit.module.css";

const ACCENTS = ["var(--c2)", "var(--c1)", "var(--c3)"];

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

/** Wraps every match of the skill in a <mark>. */
function Highlight({ text, skill }: { text: string; skill: string }) {
  const re = new RegExp(`(${skillPattern(skill).source})`, "gi");
  return (
    <>
      {text.split(re).map((part, i) => (i % 2 ? <mark key={i} className={styles.hit}>{part}</mark> : <Fragment key={i}>{part}</Fragment>))}
    </>
  );
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function Proof({ skill, ev }: { skill: string; ev: Evidence }) {
  const counts = [
    ev.jobs.length && plural(ev.jobs.length, "role", "roles"),
    ev.projects.length && plural(ev.projects.length, "project", "projects"),
    ev.certs.length && plural(ev.certs.length, "cert", "certs"),
  ].filter(Boolean);

  return (
    <div className={styles.proof} role="region" aria-live="polite" aria-label={`Where ${skill} was used`}>
      <p className={styles.proofHead}>
        <span className={styles.proofSkill}>{skill}</span>
        <span className="t-meta">{counts.join(" · ")}</span>
      </p>

      {ev.jobs.length > 0 && (
        <ol className={styles.jobs}>
          {ev.jobs.map((j, i) => (
            <li key={j.id} className={styles.job} style={{ animationDelay: `${60 + i * 70}ms` }}>
              <p className={styles.jobHead}>
                <span className={styles.jobCo}>{j.company}</span>
                <span className="t-meta">{j.period}</span>
                {j.viaTag && <span className={styles.via}>in role stack</span>}
              </p>
              <p className={styles.jobLine}>
                <Highlight text={j.line} skill={skill} />
              </p>
            </li>
          ))}
        </ol>
      )}

      {(ev.projects.length > 0 || ev.certs.length > 0) && (
        <div className={styles.extras} style={{ animationDelay: `${60 + ev.jobs.length * 70}ms` }}>
          {ev.projects.length > 0 && (
            <div className={styles.extraGroup}>
              <span className="t-meta">Projects</span>
              <ul className={styles.pills}>
                {ev.projects.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className={styles.pill}
                      aria-haspopup="dialog"
                      onClick={(e) => window.dispatchEvent(new CustomEvent("sm:project", { detail: { id: p.id, el: e.currentTarget } }))}
                    >
                      {p.title}
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                        <path d="M3.5 8.5l5-5M4.5 3.5h4v4" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {ev.certs.length > 0 && (
            <div className={styles.extraGroup}>
              <span className="t-meta">Certified</span>
              <ul className={styles.pills}>
                {ev.certs.map((c) => (
                  <li key={c} className={styles.cert}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2.5 6.2l2.3 2.3 4.7-5" />
                    </svg>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type Props = {
  skills: SkillGroup[];
  experience: Experience[];
  projects: Project[];
  certifications: Certification[];
};

export function Toolkit({ skills, experience, projects, certifications }: Props) {
  const ref = useRef<HTMLElement>(null);
  const mobile = useMobile();
  const [openIdx, setOpenIdx] = useState(0);

  const evidence = useMemo(() => {
    const m = new Map<string, Evidence>();
    for (const g of skills) for (const it of g.items) m.set(it, evidenceFor(it, experience, projects, certifications));
    return m;
  }, [skills, experience, projects, certifications]);

  const total = skills.reduce((n, g) => n + g.items.length, 0);

  // One selection per row, so picking a skill never collapses a panel above it and shifts the page.
  // The first row starts open on its first skill with proof, so the interaction explains itself.
  const [sel, setSel] = useState<Record<number, string | null>>(() => {
    const first = skills[0]?.items.find((it) => (evidence.get(it)?.score ?? 0) > 0);
    return first ? { 0: first } : ({} as Record<number, string | null>);
  });

  // Proof panels change the page height; keep later scroll triggers in place.
  const firstSel = useRef(true);
  useEffect(() => {
    if (firstSel.current) {
      firstSel.current = false;
      return;
    }
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [sel, openIdx]);

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

  const jumpTo = (i: number) => {
    setOpenIdx(i);
    const row = ref.current?.querySelectorAll<HTMLElement>("[data-row]")[i];
    row?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  };

  return (
    <section id="toolkit" aria-labelledby="toolkit-title" className={styles.section} ref={ref}>
      <div className="wrap">
        <header className={styles.head}>
          <h2 id="toolkit-title" className="t-section">Toolkit</h2>
          <p className={styles.intro}>
            {total} skills. Each one links to the job, project or cert behind it. Pick one.
          </p>
          <p className={styles.claim}>
            <span className={styles.claimKey}>&quot;scope&quot;</span>: &quot;
            {skills.map((g, i) => (
              <Fragment key={g.category}>
                {i > 0 && " "}
                <button
                  type="button"
                  className={styles.claimTok}
                  style={{ ["--acc" as string]: ACCENTS[i % 3] } as React.CSSProperties}
                  onClick={() => jumpTo(i)}
                >
                  {scopeSlug(g.category.split(" & ")[0])}
                </button>
              </Fragment>
            ))}
            &quot;
          </p>
        </header>

        <ul className={styles.list}>
          {skills.map((g, i) => {
            const open = i === openIdx;
            const pid = `toolkit-panel-${i}`;
            const selHere = sel[i] ?? null;
            const selEv = selHere ? evidence.get(selHere) : undefined;
            return (
              <li key={g.category} data-row className={`${styles.row} ${open ? styles.open : ""}`} style={{ ["--acc" as string]: ACCENTS[i % 3] } as React.CSSProperties}>
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
                      {g.items.map((it) => {
                        const ev = evidence.get(it);
                        const n = ev ? ev.jobs.length + ev.projects.length + ev.certs.length : 0;
                        if (!n) {
                          return (
                            <li key={it} data-tok className={styles.tok}>
                              {it}
                            </li>
                          );
                        }
                        const on = selHere === it;
                        return (
                          <li key={it} data-tok>
                            <button
                              type="button"
                              className={`${styles.tok} ${styles.tokBtn} ${on ? styles.tokOn : ""}`}
                              aria-pressed={on}
                              aria-label={`${it}, used in ${n} ${n === 1 ? "place" : "places"}`}
                              onClick={() => setSel((s) => ({ ...s, [i]: on ? null : it }))}
                            >
                              {it}
                              <span className={styles.n} aria-hidden="true">{n}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    {selHere && selEv && <Proof key={selHere} skill={selHere} ev={selEv} />}
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
