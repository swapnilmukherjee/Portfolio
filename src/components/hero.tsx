"use client";

import { forwardRef, useEffect, useRef } from "react";
import { ArrowDown, Github, Linkedin, MapPin } from "lucide-react";
import { motion } from "framer-motion";

import type { Profile } from "@/data/content-types";

export function Hero({ profile }: { profile: Profile }) {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);

  // Variable-weight headline (200 → 700) tied to scroll progress through the first viewport
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let raf = 0;
    const updateWeight = () => {
      raf = 0;
      const local = Math.max(0, Math.min(1, window.scrollY / window.innerHeight));
      const w = Math.round(200 + local * 500);
      if (headlineRef.current) headlineRef.current.style.setProperty("--hw", String(w));
    };
    const scheduleUpdate = () => {
      if (!raf) raf = requestAnimationFrame(updateWeight);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  // Portrait tilt is intentionally subtle so the image feels part of the hero.
  useEffect(() => {
    const el = portraitRef.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--prx", `${-py * 3.5}deg`);
      el.style.setProperty("--pry", `${px * 4.5}deg`);
    };
    const leave = () => {
      el.style.setProperty("--prx", "0deg");
      el.style.setProperty("--pry", "0deg");
    };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <section id="hero" className="relative z-[2] flex min-h-[100svh] items-center overflow-visible pb-20 pt-28 sm:pt-36 lg:min-h-[900px]">
      <div className="mx-auto w-full max-w-[1320px] px-6 sm:px-8">
        {/* Top meta row */}
        <div className="mb-12 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-text/55 sm:mb-16">
          <span className="inline-flex items-center gap-2.5">
            <span
              className="relative inline-block h-[7px] w-[7px] rounded-full bg-emerald-400"
              style={{ boxShadow: "0 0 0 4px rgb(108 255 174 / 0.18)" }}
            />
            Okta · Identity & CIAM
          </span>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)] lg:gap-16">
          {/* Headline + lead */}
          <div className="min-w-0 overflow-visible">
            <h1
              ref={headlineRef}
              className="display-hero max-w-[820px] overflow-visible"
              aria-label="Identity, secured. For humans and AI agents."
            >
              <span className="hero-line">Identity,</span>
              <span className="hero-line ir-text">secured.</span>
              <span className="small block">For humans &amp; AI agents.</span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-12 max-w-xl text-[17px] leading-[1.65] text-text/92"
            >
              {profile.headline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <a href="#projects" className="btn-primary">
                Explore work →
              </a>
              <a href="#contact" className="btn-secondary">
                Start a conversation
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.75 }}
              className="mt-11 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-text/55"
            >
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {profile.location}
              </span>
              <a
                href={profile.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 transition hover:text-text/92"
              >
                <Github className="h-3.5 w-3.5" /> github
              </a>
              <a
                href={profile.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 transition hover:text-text/92"
              >
                <Linkedin className="h-3.5 w-3.5" /> linkedin
              </a>
            </motion.div>
          </div>

          {/* Headshot */}
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto mt-2 w-full max-w-[230px] sm:max-w-[280px] md:max-w-[320px] lg:mt-0 lg:max-w-[360px] lg:justify-self-end xl:max-w-[390px]"
          >
            <PortraitCard ref={portraitRef} name={profile.name} title={profile.title} />
          </motion.div>
        </div>

        {/* Scroll cue */}
        <div className="absolute inset-x-0 bottom-8 hidden flex-col items-center gap-2 text-text/55 sm:flex">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ color: "rgb(var(--grad-2))" }}
          >
            <ArrowDown className="h-4 w-4" />
          </motion.span>
        </div>
      </div>
    </section>
  );
}

const PortraitCard = forwardRef<HTMLDivElement, { name: string; title: string }>(function PortraitCard({ name, title }, ref) {
  return (
    <div className="relative aspect-[4/5] w-full">
      {/* Ambient glow — static, no animation to avoid repaints */}
      <div
        aria-hidden
        className="absolute inset-[-14%] rounded-[50px]"
        style={{
          background:
            "radial-gradient(circle at 52% 16%, rgb(var(--grad-2) / 0.22), transparent 36%), radial-gradient(circle at 22% 82%, rgb(var(--grad-1) / 0.18), transparent 40%), radial-gradient(circle at 80% 60%, rgb(var(--grad-3) / 0.10), transparent 32%)",
          filter: "blur(28px)",
        }}
      />

      {/* Tilt container — ref lives here for the mousemove effect */}
      <div
        ref={ref}
        className="absolute inset-0"
        style={{
          transform: "rotateX(var(--prx, 0deg)) rotateY(var(--pry, 0deg))",
          transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Photo frame */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[30px] p-2 backdrop-blur-xl sm:rounded-[34px] sm:p-2.5"
          style={{
            border: "1px solid transparent",
            background:
              "linear-gradient(rgb(var(--surface) / 0.8), rgb(var(--surface) / 0.8)) padding-box, " +
              "linear-gradient(135deg, rgb(var(--grad-1) / 0.55), rgb(var(--grad-3) / 0.35) 50%, rgb(var(--grad-2) / 0.50)) border-box",
            boxShadow: "0 28px 90px -50px rgb(var(--text) / 0.34)",
          }}
        >
          <div className="relative h-full overflow-hidden rounded-[24px] bg-surface-2 sm:rounded-[28px]">
            <img
              src="/headshot.jpg"
              alt={name}
              width={1024}
              height={1024}
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover"
              style={{
                filter: "saturate(1.06) contrast(1.02) brightness(1.0)",
                objectPosition: "50% 36%",
              }}
            />

            {/* Iridescent colour wash — very subtle screen blend */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(150deg, rgb(var(--grad-1) / 0.12) 0%, transparent 45%, rgb(var(--grad-2) / 0.09) 100%)",
                mixBlendMode: "screen",
              }}
            />

            {/* Bottom dissolve — photo fades into the card surface */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0"
              style={{
                height: "42%",
                background:
                  "linear-gradient(to bottom, transparent 0%, rgb(var(--surface) / 0.55) 65%, rgb(var(--surface) / 0.92) 100%)",
              }}
            />
          </div>
        </div>

        {/* Name badge — gradient border matches the card */}
        <div
          className="absolute -bottom-5 left-1/2 w-[86%] -translate-x-1/2 rounded-2xl px-4 py-3 text-center backdrop-blur-xl"
          style={{
            border: "1px solid transparent",
            background:
              "linear-gradient(rgb(var(--surface) / 0.92), rgb(var(--surface) / 0.92)) padding-box, " +
              "linear-gradient(135deg, rgb(var(--grad-1) / 0.45), rgb(var(--grad-3) / 0.28) 50%, rgb(var(--grad-2) / 0.40)) border-box",
            boxShadow: "0 18px 70px -44px rgb(var(--text) / 0.45)",
          }}
        >
          <p className="text-sm font-semibold text-text-strong">{name}</p>
          <p className="text-[11px] leading-snug text-text/55">{title.split("@")[0].trim()}</p>
          <p className="text-[11px] leading-snug text-text/40">{title.split("@")[1]?.trim()}</p>
        </div>
      </div>
    </div>
  );
});
