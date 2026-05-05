"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/cn";

const SECTIONS = [
  { id: "hero", label: "00 / Index" },
  { id: "about", label: "01 / About" },
  { id: "experience", label: "02 / Experience" },
  { id: "projects", label: "03 / Projects" },
  { id: "skills", label: "04 / Skills" },
  { id: "credentials", label: "05 / Credentials" },
  { id: "contact", label: "06 / Contact" },
];

export function Nav({ resumeHref }: { resumeHref: string }) {
  const [active, setActive] = useState("hero");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-50% 0px -45% 0px" }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* Top bar */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex items-center justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-7">
        <Link
          href="#hero"
          className="glass pointer-events-auto inline-flex items-center gap-2.5 rounded-full px-3 py-2"
        >
          <span
            className="grid h-[22px] w-[22px] place-items-center rounded-full text-[11px] font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, rgb(var(--grad-1)), rgb(var(--grad-2)))",
              boxShadow: "0 0 20px rgb(var(--grad-1) / 0.5)",
            }}
          >
            S
          </span>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-text/55 sm:inline">
            Swapnil_Mukherjee
          </span>
        </Link>

        <div className="pointer-events-auto flex items-center gap-2">
          <a
            href={resumeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="glass inline-flex min-h-10 items-center gap-2 rounded-full px-3 py-[9px] text-[13px] font-medium text-text/92 transition hover:bg-white/[0.07] sm:px-4"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Résumé</span>
            <span className="hidden min-[390px]:inline">· PDF</span>
          </a>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="glass grid h-10 w-10 place-items-center rounded-full md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Side rail (desktop only) */}
      <nav className="fixed right-7 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
        <ul className="flex flex-col gap-3.5">
          {SECTIONS.map((s) => {
            const isActive = active === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="group flex items-center justify-end gap-3.5"
                  aria-label={s.label}
                >
                  <span
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300",
                      isActive
                        ? "text-text/92 translate-x-0 opacity-100"
                        : "text-text/55 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                    )}
                  >
                    {s.label}
                  </span>
                  <span
                    className={cn(
                      "block h-px transition-all duration-500",
                      isActive
                        ? "w-9"
                        : "w-[18px] group-hover:w-7"
                    )}
                    style={
                      isActive
                        ? {
                            background:
                              "linear-gradient(90deg, rgb(var(--grad-1)), rgb(var(--grad-2)))",
                          }
                        : { background: "rgb(var(--line) / 0.16)" }
                    }
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] md:hidden"
          >
            <div className="absolute inset-0 bg-bg/90 backdrop-blur-xl" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-strong relative mx-4 mt-20 rounded-3xl p-6"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text/55">Navigate</span>
                <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ul className="mt-6 flex flex-col gap-1.5">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={() => setOpen(false)}
                      className="block rounded-2xl px-4 py-3 text-2xl font-light tracking-tight text-text/92 transition hover:bg-white/[0.07]"
                    >
                      <span
                        className="mr-2 font-mono text-xs"
                        style={{
                          background:
                            "linear-gradient(135deg, rgb(var(--grad-1)), rgb(var(--grad-2)))",
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          color: "transparent",
                        }}
                      >
                        {s.label.split(" / ")[0]}
                      </span>
                      {s.label.split(" / ")[1]}
                    </a>
                  </li>
                ))}
              </ul>
              <a
                href={resumeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-4 w-full justify-center"
                onClick={() => setOpen(false)}
              >
                <Download className="h-4 w-4" /> Résumé · PDF
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
