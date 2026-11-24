import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "100svh", display: "grid", placeItems: "center", padding: "24px", textAlign: "center" }}>
      <div>
        <p className="t-meta">{`{ "error": "invalid_request", "status": 404 }`}</p>
        <h1 className="t-section" style={{ marginTop: 24 }}>This route was never granted.</h1>
        <p style={{ marginTop: 16, color: "var(--text-2)" }}>The page you asked for is not in scope.</p>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", minHeight: 48, marginTop: 32, padding: "0 22px", borderRadius: 14, background: "var(--text)", color: "var(--bg)", fontWeight: 600, textDecoration: "none" }}>
          Back to the start
        </Link>
      </div>
    </main>
  );
}
