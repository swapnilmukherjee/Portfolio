"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/cn";

const links = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export function Nav({ resumeHref }: { resumeHref: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled ? "py-3" : "py-5"
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border px-4 py-2 transition-all duration-500 sm:px-6",
          scrolled
            ? "glass border-border/60 shadow-lg shadow-black/20"
            : "border-transparent bg-transparent"
        )}
      >
        <Link href="/" className="group flex items-center gap-2 px-2">
          <span className="relative grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-accent to-accent-2 text-[11px] font-bold text-white shadow-sm">
            SM
          </span>
          <span className="hidden text-sm font-semibold tracking-tight text-text sm:block">
            Swapnil<span className="text-accent">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative rounded-full px-3 py-1.5 text-sm text-muted transition hover:text-text"
            >
              {link.label}
              <span className="absolute inset-x-3 -bottom-px h-px scale-x-0 bg-gradient-to-r from-transparent via-accent/70 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={resumeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-full border border-border/70 bg-bg-elevated/60 px-3.5 py-1.5 text-xs font-medium text-text transition hover:border-accent/50 hover:bg-accent/10 sm:inline-flex"
          >
            <Download className="h-3.5 w-3.5" /> Resume
          </a>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full border border-border/70 bg-bg-elevated/60 text-text md:hidden"
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mt-2 max-w-6xl px-4 md:hidden"
          >
            <div className="glass rounded-2xl border border-border/60 p-4">
              <div className="flex flex-col gap-1">
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-base text-text/90 transition hover:bg-accent/10 hover:text-text"
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href={resumeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white"
                >
                  <Download className="h-4 w-4" /> Download Resume
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
