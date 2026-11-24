"use client";

import { useEffect, useRef, useState } from "react";

import { unlockSecret } from "@/lib/secrets";

import styles from "./rain.module.css";

const DURATION = 10000;
const FADE = 900;

type Drop = { x: number; y: number; len: number; v: number };

function Canvas({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      onDone();
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const color = getComputedStyle(document.documentElement).getPropertyValue("--c2").trim() || "#4fb8ff";
    let w = 0;
    let h = 0;
    const size = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener("resize", size);

    const count = window.matchMedia("(max-width: 799px)").matches ? 60 : 120;
    const slant = 0.28;
    const drops: Drop[] = Array.from({ length: count }, () => ({
      x: Math.random() * (w + 200) - 100,
      y: Math.random() * h,
      len: 14 + Math.random() * 22,
      v: 900 + Math.random() * 700,
    }));

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.25;
    ctx.lineCap = "round";

    let raf = 0;
    let start = 0;
    let last = 0;
    const frame = (t: number) => {
      if (!start) { start = t; last = t; }
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      const elapsed = t - start;
      if (elapsed >= DURATION) {
        onDone();
        return;
      }
      const fade = elapsed > DURATION - FADE ? (DURATION - elapsed) / FADE : 1;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 0.35 * fade;
      ctx.beginPath();
      for (const d of drops) {
        d.y += d.v * dt;
        d.x += d.v * slant * dt;
        if (d.y > h + 40) {
          d.y = -d.len;
          d.x = Math.random() * (w + 200) - 100;
        }
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.len * slant, d.y + d.len);
      }
      ctx.stroke();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={ref} className={styles.canvas} aria-hidden="true" />;
}

export function RainEgg() {
  const [raining, setRaining] = useState(false);
  const [toast, setToast] = useState(false);
  const rainingRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const start = () => {
      unlockSecret("rain");
      setToast(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(false), 3200);
      if (rainingRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      rainingRef.current = true;
      setRaining(true);
    };
    window.addEventListener("sm:rain", start);
    return () => {
      window.removeEventListener("sm:rain", start);
      clearTimeout(timer.current);
    };
  }, []);

  return (
    <>
      {raining && (
        <Canvas
          onDone={() => {
            rainingRef.current = false;
            setRaining(false);
          }}
        />
      )}
      <div className={`${styles.toast} ${toast ? styles.toastOn : ""}`} role="status" aria-live="polite">
        {toast ? "Seattle forecast: rain. Obviously." : ""}
      </div>
    </>
  );
}
