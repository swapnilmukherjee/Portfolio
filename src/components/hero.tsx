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
            Available · Identity consulting
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

          {/* Integrated portrait */}
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto mt-2 w-full max-w-[250px] sm:max-w-[300px] md:max-w-[340px] lg:mt-0 lg:max-w-[500px] lg:justify-self-end xl:max-w-[540px]"
          >
            <PortraitScene ref={portraitRef} name={profile.name} />
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

const PortraitScene = forwardRef<HTMLDivElement, { name: string }>(function PortraitScene({ name }, ref) {
  return (
    <div
      ref={ref}
      className="relative aspect-square w-full lg:aspect-[5/4]"
      style={{
        transform: "rotateX(var(--prx, 0deg)) rotateY(var(--pry, 0deg))",
        transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
        transformStyle: "preserve-3d",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-[-14%] rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(circle at 48% 36%, rgb(var(--grad-2) / 0.24), transparent 34%), radial-gradient(circle at 58% 64%, rgb(var(--grad-1) / 0.20), transparent 42%), radial-gradient(circle at 28% 70%, rgb(var(--grad-3) / 0.15), transparent 38%)",
        }}
      />

      <div
        className="absolute inset-0 overflow-hidden rounded-full lg:inset-x-[-4%] lg:inset-y-[-2%] lg:rounded-[44%]"
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 42%, black 0%, black 43%, rgba(0,0,0,0.78) 58%, transparent 79%)",
          maskImage:
            "radial-gradient(ellipse at 50% 42%, black 0%, black 43%, rgba(0,0,0,0.78) 58%, transparent 79%)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(145deg, rgb(var(--surface) / 0.85), rgb(var(--surface-2) / 0.40)), radial-gradient(circle at 52% 34%, rgb(var(--grad-2) / 0.22), transparent 38%)",
          }}
        />

        <img
          src="/headshot.jpg"
          alt={name}
          width={1024}
          height={1024}
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.84]"
          style={{
            filter: "grayscale(0.22) saturate(0.64) contrast(0.92) brightness(1.04)",
            objectPosition: "50% 36%",
          }}
        />

        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgb(var(--bg) / 0.36), transparent 26%, transparent 64%, rgb(var(--bg) / 0.42)), linear-gradient(180deg, transparent 44%, rgb(var(--bg) / 0.38) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(circle at 62% 26%, rgb(var(--grad-2) / 0.16), transparent 34%), radial-gradient(circle at 34% 72%, rgb(var(--grad-1) / 0.18), transparent 42%)",
          }}
        />
      </div>

      <div
        aria-hidden
        className="absolute bottom-[8%] left-1/2 h-[1px] w-[78%] -translate-x-1/2"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(var(--grad-1) / 0.38), rgb(var(--grad-2) / 0.38), transparent)",
        }}
      />
    </div>
  );
});
