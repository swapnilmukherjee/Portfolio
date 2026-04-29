import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-text sm:text-6xl">
          That page <span className="text-gradient">doesn&rsquo;t exist</span>.
        </h1>
        <p className="mt-4 text-sm text-muted">Looks like you took a wrong turn.</p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-text px-5 py-2.5 text-sm font-medium text-bg transition hover:scale-[1.02]"
        >
          Take me home
        </Link>
      </div>
    </main>
  );
}
