"use client";

import { forwardRef, useEffect, useRef } from "react";
import Image from "next/image";
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

  // Portrait card 3D tilt on mouse
  useEffect(() => {
    const el = portraitRef.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--prx", `${-py * 8}deg`);
      el.style.setProperty("--pry", `${px * 10}deg`);
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
    <section id="hero" className="relative z-[2] flex min-h-screen items-center pt-32 sm:pt-36 pb-20">
      <div className="mx-auto w-full max-w-[1320px] px-6 sm:px-8">
        {/* Top meta row */}
        <div className="mb-16 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-text/55">
          <span className="inline-flex items-center gap-2.5">
            <span
              className="relative inline-block h-[7px] w-[7px] rounded-full bg-emerald-400"
              style={{ boxShadow: "0 0 0 4px rgb(108 255 174 / 0.18)" }}
            />
            Available · Identity consulting
          </span>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Headline + lead */}
          <div>
            <h1 ref={headlineRef} className="display-hero">
              <span className="block">Identity,</span>
              <span className="ir-text block">secured.</span>
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

          {/* Portrait card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="lg:justify-self-end"
          >
            <PortraitCard ref={portraitRef} name={profile.name} />
          </motion.div>
        </div>

        {/* Scroll cue */}
        <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-text/55">
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

const PortraitCard = forwardRef<HTMLDivElement, { name: string }>(function PortraitCard({ name }, ref) {
  return (
    <div
      ref={ref}
      className="glass-strong relative aspect-[4/5] w-full max-w-[440px] overflow-hidden rounded-[28px] shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_40px_90px_-10px_rgb(0_0_0/0.6)]"
      style={{
        transform: "rotateX(var(--prx, 0deg)) rotateY(var(--pry, 0deg))",
        transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Side label */}
      <span
        className="absolute -left-7 top-[30%] font-mono text-[10px] uppercase tracking-[0.22em] text-text/30"
        style={{ transform: "rotate(-90deg)", transformOrigin: "left top" }}
      >
        Charlotte · NC
      </span>

      {/* Placeholder underneath */}
      <div
        className="absolute inset-0 grid place-items-center text-[120px] font-light tracking-tighter text-text/30"
        style={{
          background:
            "radial-gradient(closest-side, rgb(var(--grad-1) / 0.25), transparent), linear-gradient(160deg, rgb(var(--surface-2)), rgb(var(--surface)))",
        }}
      >
        SM
      </div>

      {/* Photo on top, falls back to placeholder via Next/Image error UI */}
      <Image
        src="/headshot.jpg"
        alt={name}
        fill
        sizes="(max-width: 1024px) 80vw, 440px"
        priority
        className="relative z-[1] object-cover"
        style={{ filter: "saturate(1.05) contrast(1.02)" }}
      />

      {/* Bottom HUD */}
      <div className="absolute inset-x-4 bottom-4 z-[2] flex items-center justify-between rounded-2xl border border-white/10 bg-black/55 px-[18px] py-[14px] backdrop-blur-xl">
        <div>
          <div
            className="font-mono text-[10px] uppercase tracking-[0.22em]"
            style={{ color: "rgb(var(--grad-2))" }}
          >
            Now
          </div>
          <div className="mt-1 text-sm font-semibold text-white">Technical Consultant</div>
          <div className="mt-0.5 text-xs text-white/70">Okta · Auth0</div>
        </div>
      </div>
    </div>
  );
});
