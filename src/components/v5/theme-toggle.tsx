"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { unlockSecret } from "@/lib/secrets";

import styles from "./theme-toggle.module.css";

type Props = { variant?: "pill" | "tab" };

const LONG_PRESS_MS = 650;

export function ThemeToggle({ variant = "pill" }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const pressTimer = useRef<number | null>(null);
  const longPressed = useRef(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme !== "light" : true;

  const apply = useCallback(
    (next: "dark" | "light") => {
      const el = btn.current;
      const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!doc.startViewTransition || reduce || !el) {
        setTheme(next);
        return;
      }
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const t = doc.startViewTransition(() => {
        flushSync(() => setTheme(next));
      });
      t.ready.then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 620, easing: "cubic-bezier(0.77, 0, 0.175, 1)", pseudoElement: "::view-transition-new(root)" },
        );
      });
    },
    [setTheme],
  );

  // Terminal (and anything else) can switch the theme with a window event.
  useEffect(() => {
    const onTheme = (e: Event) => {
      const want = (e as CustomEvent<string>).detail;
      const current = document.documentElement.classList.contains("light") ? "light" : "dark";
      const next = want === "dark" || want === "light" ? want : current === "dark" ? "light" : "dark";
      if (next !== current) apply(next);
    };
    window.addEventListener("sm:theme", onTheme);
    return () => window.removeEventListener("sm:theme", onTheme);
  }, [apply]);

  const startPress = () => {
    longPressed.current = false;
    pressTimer.current = window.setTimeout(() => {
      longPressed.current = true;
      window.dispatchEvent(new Event("sm:rain"));
      unlockSecret("rain");
    }, LONG_PRESS_MS);
  };
  const endPress = () => {
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  return (
    <button
      ref={btn}
      type="button"
      className={`${styles.toggle} ${variant === "tab" ? styles.tab : styles.pill}`}
      data-dark={isDark ? "true" : "false"}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title="Theme (try holding it)"
      onPointerDown={startPress}
      onPointerUp={endPress}
      onPointerLeave={endPress}
      onPointerCancel={endPress}
      onContextMenu={(e) => e.preventDefault()}
      onClick={() => {
        if (longPressed.current) {
          longPressed.current = false;
          return;
        }
        apply(isDark ? "light" : "dark");
      }}
    >
      <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
        <mask id={`moon-${variant}`}>
          <rect width="24" height="24" fill="white" />
          <circle className={styles.bite} cx="17" cy="7" r="6.5" fill="black" />
        </mask>
        <circle className={styles.core} cx="12" cy="12" r="5.5" fill="currentColor" mask={`url(#moon-${variant})`} />
        <g className={styles.rays} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 1.5v2.2M12 20.3v2.2M1.5 12h2.2M20.3 12h2.2M4.6 4.6l1.5 1.5M17.9 17.9l1.5 1.5M4.6 19.4l1.5-1.5M17.9 6.1l1.5-1.5" />
        </g>
      </svg>
    </button>
  );
}
