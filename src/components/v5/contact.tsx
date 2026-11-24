"use client";

import { useRef, useState } from "react";

import type { Profile } from "@/data/content-types";

import styles from "./contact.module.css";
import { gsap, useGSAP } from "./gsap";

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={styles.copy}
      data-copied={copied ? "true" : "false"}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          /* clipboard blocked; the link still works */
        }
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {copied ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M8 8V5h11v11h-3M5 8h11v11H5z" />}
      </svg>
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

const Arrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.arrow}>
    <path d="M7 17L17 7M9 7h8v8" />
  </svg>
);

export function Contact({ profile }: { profile: Profile }) {
  const root = useRef<HTMLElement>(null);
  const email = profile.publicEmail || profile.email;

  // The heading stretches from condensed to wide as it arrives, like the hero name in reverse.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          `.${styles.title}`,
          { fontStretch: "62%", letterSpacing: "-0.01em" },
          {
            fontStretch: "125%",
            letterSpacing: "-0.045em",
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top 85%", end: "top 25%", scrub: 0.6 },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="contact" ref={root} className={styles.section} aria-labelledby="contact-title">
      <div className="wrap">
        <h2 id="contact-title" className={styles.title}>
          Contact me
        </h2>
        <p className={styles.sub}>{profile.availability}</p>

        <div className={styles.grid}>
          <div className={styles.channel}>
            <a href={`mailto:${email}`} className={styles.big}>
              <span className={styles.kind}>Email</span>
              <span className={styles.value}>{email}</span>
              <Arrow />
            </a>
            <CopyButton value={email} label="email address" />
          </div>
          {profile.phone && (
            <div className={styles.channel} data-kind="phone">
              <a href={telHref(profile.phone)} className={styles.big}>
                <span className={styles.kind}>Phone</span>
                <span className={styles.value}>{profile.phone}</span>
                <Arrow />
              </a>
              <CopyButton value={profile.phone} label="phone number" />
            </div>
          )}
        </div>

        <ul className={styles.links} role="list">
          <li>
            <a href={profile.socials.linkedin} target="_blank" rel="noreferrer">
              LinkedIn <Arrow />
            </a>
          </li>
          <li>
            <a href={profile.socials.github} target="_blank" rel="noreferrer">
              GitHub <Arrow />
            </a>
          </li>
          <li>
            <a href="/resume" target="_blank" rel="noreferrer">
              Résumé <Arrow />
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
