"use client";

import { Github, Linkedin, Mail } from "lucide-react";
import contentJson from "@/data/content.json";

export function Footer() {
  const { profile } = contentJson;

  return (
    <footer className="relative border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
        <div className="flex items-center gap-3">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-accent to-accent-2 text-[11px] font-bold text-white">
            SM
          </span>
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {profile.name}. Built with FastAPI, Next.js, and a lot of identity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={profile.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-9 w-9 place-items-center rounded-full border border-border/70 bg-bg-elevated/60 text-muted transition hover:border-accent/40 hover:text-text"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
          <a
            href={profile.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-9 w-9 place-items-center rounded-full border border-border/70 bg-bg-elevated/60 text-muted transition hover:border-accent/40 hover:text-text"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-4 w-4" />
          </a>
          <a
            href={`mailto:${profile.publicEmail}`}
            className="grid h-9 w-9 place-items-center rounded-full border border-border/70 bg-bg-elevated/60 text-muted transition hover:border-accent/40 hover:text-text"
            aria-label="Email"
          >
            <Mail className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
