"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Github, Linkedin, Mail, MapPin } from "lucide-react";

import contentJson from "@/data/content.json";

export function Hero() {
  const { profile, highlights } = contentJson;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} id="home" className="relative isolate overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
      {/* Background grid + glows */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid" />
        <motion.div
          style={{ y }}
          className="absolute left-1/2 top-0 h-[60vh] w-[80vw] -translate-x-1/2 rounded-full bg-gradient-to-br from-accent/30 via-accent-2/20 to-transparent blur-3xl"
        />
        <div className="absolute -left-32 top-40 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -right-32 top-72 h-72 w-72 rounded-full bg-accent-2/20 blur-3xl" />
        <div className="bg-noise pointer-events-none absolute inset-0" />
      </div>

      <motion.div style={{ opacity }} className="mx-auto max-w-6xl px-6">
        {/* Status pill */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 flex justify-center"
        >
          <a
            href={profile.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-bg-elevated/60 px-3.5 py-1.5 text-xs font-medium text-muted backdrop-blur transition hover:border-accent/40 hover:text-text"
          >
            <span className="relative grid h-2 w-2 place-items-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/70" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            New chapter — Technical Consultant @ Okta
            <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
          </a>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-4xl text-center text-5xl font-semibold tracking-tighter text-text sm:text-6xl md:text-7xl lg:text-[5.25rem] lg:leading-[0.95]"
        >
          Identity, secured.
          <br />
          <span className="text-gradient">For humans and AI agents.</span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-6 max-w-2xl text-center text-base text-muted sm:text-lg"
        >
          {profile.headline}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href="#projects"
            className="group relative inline-flex items-center gap-2 rounded-full bg-text px-5 py-2.5 text-sm font-medium text-bg transition hover:scale-[1.02]"
          >
            View work
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-bg-elevated/60 px-5 py-2.5 text-sm font-medium text-text transition hover:border-accent/50 hover:bg-accent/10"
          >
            Get in touch
          </a>
        </motion.div>

        {/* Meta row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-muted"
        >
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> {profile.location}
          </span>
          <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 transition hover:text-text">
            <Github className="h-3.5 w-3.5" /> GitHub
          </a>
          <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 transition hover:text-text">
            <Linkedin className="h-3.5 w-3.5" /> LinkedIn
          </a>
          <a href={`mailto:${profile.publicEmail}`} className="inline-flex items-center gap-1.5 transition hover:text-text">
            <Mail className="h-3.5 w-3.5" /> {profile.publicEmail}
          </a>
        </motion.div>

        {/* Highlights strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {highlights.map((h) => (
            <div
              key={h.label}
              className="rounded-2xl border border-border/60 bg-bg-elevated/40 p-4 backdrop-blur transition hover:border-accent/40 hover:bg-bg-elevated/70"
            >
              <div className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">{h.value}</div>
              <div className="mt-1 text-[11px] uppercase tracking-wider text-muted">{h.label}</div>
              <div className="mt-1.5 text-[11px] leading-snug text-muted/70">{h.detail}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
