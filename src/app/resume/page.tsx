import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download, FileText } from "lucide-react";

import { getContent } from "@/lib/content";
import { ThemeToggle } from "@/components/theme-toggle";

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getContent();
  return {
    title: `Résumé · ${profile.name}`,
    description: `Download or view the résumé of ${profile.name}, ${profile.title}.`,
    robots: { index: false, follow: false },
  };
}

export default async function ResumePage() {
  const { profile } = await getContent();
  const pdfUrl = profile.resume || "/Swapnil_Mukherjee_Resume.pdf";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bg text-text">

      {/* Ambient background — same orbs as the main site, very subtle */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.35] dark:opacity-50"
          style={{
            background: [
              "radial-gradient(ellipse 60% 40% at 15% 10%, rgb(var(--grad-1) / 0.22), transparent)",
              "radial-gradient(ellipse 50% 35% at 85% 5%,  rgb(var(--grad-3) / 0.16), transparent)",
              "radial-gradient(ellipse 40% 50% at 70% 90%, rgb(var(--grad-2) / 0.14), transparent)",
            ].join(","),
          }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: [
              "linear-gradient(rgb(var(--text)) 1px, transparent 1px)",
              "linear-gradient(90deg, rgb(var(--text)) 1px, transparent 1px)",
            ].join(","),
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-white/[0.07] bg-bg/60 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[960px] items-center justify-between gap-3 px-5 py-3.5 sm:px-8">

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-black/[0.04] px-3.5 py-2 text-sm text-text/65 transition hover:border-black/20 hover:text-text dark:border-white/10 dark:bg-white/[0.05] dark:hover:border-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Portfolio
          </Link>

          {/* Centre label */}
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-text/35 sm:flex">
              <FileText className="h-3.5 w-3.5" />
              Résumé
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href={pdfUrl}
              download
              className="inline-flex items-center gap-2 rounded-2xl bg-text px-4 py-2 text-sm font-semibold text-bg transition hover:opacity-85"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
          </div>
        </div>
      </header>

      {/* PDF viewer */}
      <main className="relative z-10 flex flex-col items-center px-4 pb-10 pt-6 sm:px-8">

        {/* Name + title above the card */}
        <div className="mb-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-text/35">Viewing</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-text sm:text-2xl">
            {profile.name}
          </h1>
          <p className="mt-0.5 text-sm text-text/50">{profile.title}</p>
        </div>

        {/* PDF card */}
        <div
          className="w-full max-w-[860px] rounded-[24px] border border-black/[0.07] bg-white/5 p-2 dark:border-white/[0.07]"
          style={{ boxShadow: "0 24px 64px -12px rgb(var(--grad-1) / 0.10), 0 4px 24px -4px rgb(0 0 0 / 0.12)" }}
        >
          {/*
            Cross-browser PDF embedding strategy:
            - <object> works in Chrome, Firefox, Edge, and desktop Safari
            - The inner <iframe> catches browsers that skip <object> (some Chromium variants)
            - The <a> fallback covers iOS Safari and any browser that blocks embedded PDFs
            - overflow-hidden + extra width hides the native scrollbar across all engines
          */}
          <div className="relative overflow-hidden rounded-[18px]">
            <object
              data={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              type="application/pdf"
              className="block h-[calc(100vh-200px)] min-h-[560px] bg-white"
              style={{ width: "calc(100% + 20px)" }}
              aria-label={`${profile.name} résumé`}
            >
              {/* iframe fallback for browsers that don't render <object> */}
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                className="block h-full w-full bg-white"
                title={`${profile.name} résumé`}
              >
                {/* Last-resort fallback (iOS Safari, etc.) */}
                <div className="flex h-full flex-col items-center justify-center gap-4 bg-white p-8 text-center text-black">
                  <p className="text-sm text-black/60">Your browser can&apos;t display the PDF inline.</p>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Open PDF
                  </a>
                </div>
              </iframe>
            </object>
          </div>
        </div>

        {/* Persistent fallback link for iOS / blocked embeds */}
        <p className="mt-5 text-center text-xs text-text/35">
          Can&apos;t see the PDF?{" "}
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 transition hover:text-text/65">
            Open in new tab
          </a>{" "}
          or{" "}
          <a href={pdfUrl} download className="underline underline-offset-2 transition hover:text-text/65">
            download
          </a>
          .
        </p>
      </main>
    </div>
  );
}
