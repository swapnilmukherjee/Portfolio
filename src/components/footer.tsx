import type { Profile } from "@/data/content-types";

export function Footer({ profile }: { profile: Profile }) {
  return (
    <footer className="relative z-[2] border-t border-white/[0.08] py-10">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4 px-6 font-mono text-[11px] uppercase tracking-[0.18em] text-text/55 sm:px-8">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span>FastAPI · Next.js · Postgres</span>
        <div className="flex gap-4">
          <a href={profile.socials.github} className="hover:text-text/92">
            GitHub
          </a>
          <a href={profile.socials.linkedin} className="hover:text-text/92">
            LinkedIn
          </a>
          <a href={`mailto:${profile.publicEmail}`} className="hover:text-text/92">
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
