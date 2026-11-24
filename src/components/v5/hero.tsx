"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import type { Profile } from "@/data/content-types";
import { unlockSecret } from "@/lib/secrets";
import type { TokenParts } from "@/lib/token";

import { gsap, useGSAP } from "./gsap";
import styles from "./hero.module.css";

type Part = { t: string; k: "punct" | "key" | "str" | "num" };

const VERIFY_SECRET = "curiosity";

function claimLines(claims: Record<string, unknown>): Part[][] {
  const entries = Object.entries(claims);
  return [
    [{ t: "{", k: "punct" }],
    ...entries.map(([key, value], i) => [
      { t: `"${key}"`, k: "key" as const },
      { t: ": ", k: "punct" as const },
      { t: JSON.stringify(value), k: typeof value === "number" ? ("num" as const) : ("str" as const) },
      { t: i < entries.length - 1 ? "," : "", k: "punct" as const },
    ]),
    [{ t: "}", k: "punct" }],
  ];
}

function b64urlBytes(buf: ArrayBuffer) {
  let s = "";
  new Uint8Array(buf).forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export function Hero({ profile, token }: { profile: Profile; token: TokenParts }) {
  const root = useRef<HTMLElement>(null);
  const [mobileDecoded, setMobileDecoded] = useState(false);
  const [verify, setVerify] = useState<"idle" | "checking" | "valid" | "invalid">("idle");

  const lines = useMemo(() => claimLines(token.claims), [token.claims]);
  const photo = profile.headshotUrl || "/headshot.jpg";
  const [role, org] = profile.title.split("@").map((s) => s.trim());

  // Scramble engine: rewrites the text of every key/value span based on a 0..1 progress.
  const scrambleRef = useRef<(p: number) => void>(() => {});
  const lastCount = useRef(-1);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const spans = Array.from(el.querySelectorAll<HTMLSpanElement>("[data-s]"));
      const finals = spans.map((s) => s.dataset.s || "");
      const total = finals.reduce((n, s) => n + s.length, 0);
      const glyphs = token.payload;
      const WINDOW = 14;

      const render = (p: number) => {
        const revealed = Math.round(p * total);
        if (revealed === lastCount.current) return;
        lastCount.current = revealed;
        let offset = 0;
        spans.forEach((span, i) => {
          const f = finals[i];
          let out = "";
          for (let c = 0; c < f.length; c++) {
            const at = offset + c;
            if (f[c] === " ") out += " ";
            else if (at < revealed) out += f[c];
            else if (at < revealed + WINDOW) out += glyphs[(at * 7 + revealed) % glyphs.length];
            else out += glyphs[at % glyphs.length];
          }
          offset += f.length;
          if (span.textContent !== out) span.textContent = out;
        });
      };
      scrambleRef.current = render;

      const mm = gsap.matchMedia();
      mm.add(
        {
          scene: "(min-width: 800px) and (prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 799px) and (prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { scene, mobile } = ctx.conditions as Record<string, boolean>;

          // Intro: name lines rise out of their masks, token types in.
          const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
          if (scene || mobile) {
            intro
              .from(`.${styles.line} > span`, { yPercent: 105, duration: 0.9, stagger: 0.08 })
              .from([`.${styles.headline}`, `.${styles.meta}`], { opacity: 0, y: 14, duration: 0.7, stagger: 0.08 }, 0.25)
              .from(`.${styles.token}`, { clipPath: "inset(0 100% 0 0)", duration: 1.1, ease: "power2.inOut" }, 0.35);
          }

          if (scene) {
            render(0);
            gsap.set(`.${styles.decoded}`, { autoAlpha: 0 });
            gsap.set(`.${styles.card}`, { clipPath: "inset(0 0 100% 0 round 20px)" });
            gsap.set(`.${styles.portrait}`, { clipPath: "inset(100% 0 0 0 round 20px)" });
            gsap.set(`.${styles.portrait} img`, { scale: 1.18 });
            gsap.set(`.${styles.verified}`, { autoAlpha: 0, y: 8 });

            const prog = { p: 0 };
            const tl = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.6 },
            });
            tl.to(`.${styles.hint}`, { autoAlpha: 0, duration: 0.06 }, 0)
              .to(`.${styles.name}`, { scale: 0.42, fontStretch: "82%", duration: 0.3, ease: "power2.inOut" }, 0.02)
              .to(`.${styles.lede}`, { autoAlpha: 0, y: -20, duration: 0.14 }, 0.02)
              .to([`.${styles.segH}`, `.${styles.segS}`, `.${styles.dot}`, `.${styles.legend}`], { autoAlpha: 0.12, duration: 0.12 }, 0.08)
              .to(`.${styles.tokenBlock}`, { autoAlpha: 0, y: -40, duration: 0.14 }, 0.22)
              .to(`.${styles.decoded}`, { autoAlpha: 1, duration: 0.01 }, 0.24)
              .to(`.${styles.card}`, { clipPath: "inset(0 0 0% 0 round 20px)", duration: 0.16, ease: "power2.out" }, 0.24)
              .to(prog, { p: 1, duration: 0.42, onUpdate: () => render(prog.p) }, 0.3)
              .to(`.${styles.portrait}`, { clipPath: "inset(0% 0 0 0 round 20px)", duration: 0.3, ease: "power2.out" }, 0.4)
              .to(`.${styles.portrait} img`, { scale: 1, duration: 0.42 }, 0.4)
              .to(`.${styles.verified}`, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.76)
              .to({}, { duration: 0.14 });
          } else if (mobile) {
            render(0);
          } else {
            render(1);
          }
          return () => {
            lastCount.current = -1;
            render(1);
          };
        },
      );
      return () => mm.revert();
    },
    { scope: root },
  );

  const decodeMobile = useCallback(() => {
    if (mobileDecoded) return;
    setMobileDecoded(true);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const prog = { p: 0 };
    if (reduce) return scrambleRef.current(1);
    gsap.to(prog, { p: 1, duration: 1.6, ease: "power1.inOut", onUpdate: () => scrambleRef.current(prog.p) });
  }, [mobileDecoded]);

  const verifySignature = useCallback(async () => {
    if (verify === "checking") return;
    setVerify("checking");
    try {
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey("raw", enc.encode(VERIFY_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${token.header}.${token.payload}`));
      const ok = b64urlBytes(sig) === token.signature;
      await new Promise((r) => setTimeout(r, 450));
      setVerify(ok ? "valid" : "invalid");
      if (ok) unlockSecret("signature");
    } catch {
      setVerify("invalid");
    }
  }, [token, verify]);

  const verifyLabel =
    verify === "checking" ? "Verifying HS256 signature" : verify === "valid" ? "Signature valid. This token is real." : verify === "invalid" ? "Could not verify here" : "";

  return (
    <section id="top" ref={root} className={styles.hero} aria-label="Introduction">
      <div className={styles.stage}>
        <div className={styles.frame}>
          <h1 className={styles.name} aria-label={profile.name}>
            {profile.name.split(" ").map((w) => (
              <span key={w} className={styles.line} aria-hidden="true">
                <span>{w}</span>
              </span>
            ))}
          </h1>

          <div className={styles.lede}>
            <p className={styles.headline}>{profile.headline}</p>
            <p className={styles.meta}>
              {profile.location}
              <br />
              {role}
              {org ? `, ${org}` : ""}
              <br />
              Auth0, CIAM, IAM for AI agents
            </p>
          </div>

          <div className={styles.tokenBlock}>
            <p className={styles.token} aria-label="A signed JSON Web Token describing Swapnil">
              <span className={`${styles.seg} ${styles.segH}`}>{token.header}</span>
              <span className={styles.dot}>.</span>
              <span className={`${styles.seg} ${styles.segP}`}>
                <span className={styles.full}>{token.payload}</span>
                <span className={styles.short} aria-hidden="true">
                  {token.payload.slice(0, 54)}…
                </span>
              </span>
              <span className={styles.dot}>.</span>
              <button type="button" className={`${styles.seg} ${styles.segS}`} onClick={verifySignature} title="Verify this signature">
                {token.signature}
              </button>
            </p>
            <div className={styles.legend}>
              <span className={styles.lgH}>header</span>
              <span className={styles.lgP}>payload</span>
              <span className={styles.lgS}>signature</span>
              <span className={styles.status} role="status" aria-live="polite" data-state={verify}>
                {verify !== "idle" && (
                  <>
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      {verify === "valid" ? <path d="M3 8.5l3.2 3L13 4.5" /> : <circle cx="8" cy="8" r="5.5" />}
                    </svg>
                    {verifyLabel}
                  </>
                )}
              </span>
            </div>
            <button type="button" className={styles.decodeBtn} onClick={decodeMobile} aria-expanded={mobileDecoded}>
              {mobileDecoded ? "Decoded" : "Tap to decode"}
            </button>
          </div>

          <div className={styles.decoded} data-open={mobileDecoded ? "true" : "false"}>
            <div className={styles.decodedInner}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <span>payload</span>
                  <span>{token.headerJson.alg as string}</span>
                </div>
                <pre className={styles.json} aria-label="Decoded claims">
                  {lines.map((line, i) => (
                    <span key={i} className={styles.jl} data-indent={i > 0 && i < lines.length - 1 ? "1" : "0"}>
                      {line.map((part, j) =>
                        part.k === "key" || part.k === "str" || part.k === "num" ? (
                          <span key={j} className={styles[part.k]} data-s={part.t}>
                            {part.t}
                          </span>
                        ) : (
                          <span key={j} className={styles.punct}>
                            {part.t}
                          </span>
                        ),
                      )}
                      {"\n"}
                    </span>
                  ))}
                </pre>
                <p className={styles.verified}>
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M3 8.5l3.2 3L13 4.5" />
                  </svg>
                  signature verified, issued by {String(token.claims.iss)}
                </p>
              </div>
              <figure className={styles.portrait}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt={`Portrait of ${profile.name}`} width={1122} height={1402} fetchPriority="high" />
                <figcaption>&quot;picture&quot;: verified</figcaption>
              </figure>
            </div>
          </div>

          <p className={styles.hint} aria-hidden="true">
            <span className={styles.hintLine} />
            Scroll to decode
          </p>
        </div>
      </div>
    </section>
  );
}
