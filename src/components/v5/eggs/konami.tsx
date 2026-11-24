"use client";

import { useEffect, useRef, useState } from "react";

import { unlockSecret } from "@/lib/secrets";

import styles from "./konami.module.css";

const KEYS = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
const SWIPES = ["up", "up", "down", "down", "left", "right", "left", "right", "tap", "tap"];
const GAP = 1200;
const SECONDS = 12;

function typing(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  if (!el || !el.tagName) return false;
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable;
}

export function KonamiEgg() {
  const [left, setLeft] = useState(0);
  const tick = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const root = document.documentElement;
    const grant = () => {
      unlockSecret("konami");
      root.classList.add("scope-admin");
      setLeft(SECONDS);
      clearInterval(tick.current);
      let n = SECONDS;
      tick.current = setInterval(() => {
        n -= 1;
        if (n <= 0) {
          clearInterval(tick.current);
          root.classList.remove("scope-admin");
          setLeft(0);
        } else setLeft(n);
      }, 1000);
    };

    const makeMatcher = (seq: string[]) => {
      let i = 0;
      let at = 0;
      return (tok: string) => {
        const now = Date.now();
        if (i > 0 && now - at > GAP) i = 0;
        at = now;
        if (tok === seq[i]) i += 1;
        else i = tok === seq[0] ? 1 : 0;
        if (i === seq.length) {
          i = 0;
          return true;
        }
        return false;
      };
    };
    const keyMatch = makeMatcher(KEYS);
    const touchMatch = makeMatcher(SWIPES);

    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (keyMatch(k)) grant();
    };

    let sx = 0;
    let sy = 0;
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      sx = t.clientX;
      sy = t.clientY;
    };
    const onEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (!t || typing(e.target)) return;
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      let tok = "tap";
      if (Math.abs(dx) > 40 || Math.abs(dy) > 40) {
        tok = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
      }
      if (touchMatch(tok)) grant();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
      clearInterval(tick.current);
      root.classList.remove("scope-admin");
    };
  }, []);

  if (left <= 0) return null;
  return (
    <div className={styles.banner} role="status">
      <span className="sr-only">scope: admin granted</span>
      <span aria-hidden="true">scope: admin granted, expires in {left}s</span>
    </div>
  );
}
