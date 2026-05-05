import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalLink, Lock, LogOut } from "lucide-react";

import { getAdminStatus, getEditableContent, isAdminAuthenticated } from "@/lib/admin-content";

import { loginAction, logoutAction, saveContentAction } from "./actions";
import { AdminEditor } from "./admin-editor";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Portfolio CMS",
  robots: { index: false, follow: false },
};

type AdminPageProps = {
  searchParams?: {
    error?: string;
    saved?: string;
  };
};

const errorText: Record<string, string> = {
  login: "That admin token did not match.",
  save: "Content could not be saved. Confirm Postgres is configured for this Vercel environment.",
  session: "Your admin session expired. Please sign in again.",
};

const savedText: Record<string, string> = {
  login: "Signed in.",
  postgres: "Saved to Postgres. The live site has been revalidated.",
  "local-json": "Saved to local JSON. Commit the JSON files when you are ready.",
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const status = getAdminStatus();
  const isAuthed = isAdminAuthenticated();

  if (!isAuthed) {
    return (
      <AdminFrame>
        <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col justify-center px-6 py-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-black">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">Portfolio CMS</p>
              <h1 className="text-2xl font-semibold text-white">Content editor</h1>
            </div>
          </div>

          <form action={loginAction} className="rounded-[28px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl">
            {searchParams?.error && (
              <p className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errorText[searchParams.error] ?? "Something went wrong."}
              </p>
            )}
            {!status.enabled && (
              <p className="mb-4 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                Set ADMIN_SYNC_TOKEN in Vercel before using the CMS in production.
              </p>
            )}
            {status.usesDevToken && (
              <p className="mb-4 rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
                Local dev token: <span className="font-mono">{status.devToken}</span>
              </p>
            )}
            {status.missingDatabase && (
              <p className="mb-4 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                Set POSTGRES_URL or DATABASE_URL for this Vercel environment before saving content.
              </p>
            )}
            <label htmlFor="token" className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-white/55">
              Admin token
            </label>
            <input
              id="token"
              name="token"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none transition focus:border-cyan-300/60"
              placeholder="Paste ADMIN_SYNC_TOKEN"
              required
            />
            <button
              type="submit"
              disabled={!status.enabled}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Unlock editor
            </button>
          </form>
        </div>
      </AdminFrame>
    );
  }

  const content = await getEditableContent();

  return (
    <AdminFrame>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/75 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">Portfolio CMS</p>
            <h1 className="text-xl font-semibold text-white sm:text-2xl">Edit live content</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/10 px-4 text-sm text-white/80 transition hover:border-white/25 hover:text-white"
            >
              View site <ExternalLink className="h-4 w-4" />
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/10 px-4 text-sm text-white/80 transition hover:border-white/25 hover:text-white"
              >
                Sign out <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 py-6 sm:px-8">
        {(searchParams?.saved || searchParams?.error) && (
          <div
            className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${
              searchParams.error
                ? "border-red-400/30 bg-red-500/10 text-red-100"
                : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
            }`}
          >
            {searchParams.error
              ? errorText[searchParams.error] ?? "Something went wrong."
              : savedText[searchParams.saved ?? ""] ?? "Saved."}
          </div>
        )}
        {status.missingDatabase && (
          <div className="mb-5 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            CMS saves need POSTGRES_URL or DATABASE_URL in this Vercel environment. Add it to Preview for staging, and to Production for main.
          </div>
        )}

        <AdminEditor initialContent={content} saveAction={saveContentAction} storageLabel={status.storage} />
      </main>
    </AdminFrame>
  );
}

function AdminFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(108,227,255,0.18),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(255,143,177,0.14),transparent_30%),linear-gradient(135deg,rgba(183,148,255,0.16),transparent_36%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
