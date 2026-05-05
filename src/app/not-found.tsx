import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="display-section mt-6">
          That page <b className="ir-text">doesn&rsquo;t exist.</b>
        </h1>
        <p className="mt-4 text-sm text-text/55">Looks like you took a wrong turn.</p>
        <Link href="/" className="btn-primary mt-8 inline-flex">
          Take me home
        </Link>
      </div>
    </main>
  );
}
