import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";

import { getContent } from "@/lib/content";

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
    <div className="flex min-h-screen flex-col bg-bg text-text">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-3.5 py-2 text-sm text-text/70 transition hover:border-white/25 hover:text-text"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to portfolio
          </Link>

          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              download
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </a>
          </div>
        </div>
      </header>

      {/* PDF viewer */}
      <main className="flex flex-1 flex-col items-center px-4 py-6 sm:px-8">
        <div className="w-full max-w-[900px] flex-1">
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            className="h-[calc(100vh-100px)] min-h-[600px] w-full rounded-[20px] border border-white/[0.08] bg-white"
            title={`${profile.name} résumé`}
          />
        </div>

        {/* Fallback for browsers that block PDF iframes */}
        <p className="mt-4 text-center text-sm text-text/40">
          Can&apos;t see the PDF?{" "}
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="underline transition hover:text-text/70">
            Open in a new tab
          </a>{" "}
          or{" "}
          <a href={pdfUrl} download className="underline transition hover:text-text/70">
            download it
          </a>
          .
        </p>
      </main>
    </div>
  );
}
