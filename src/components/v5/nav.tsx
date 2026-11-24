"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import styles from "./nav.module.css";
import { ThemeToggle } from "./theme-toggle";

const LINKS = [
  { id: "work", label: "Work", icon: "M4 8h16v11H4zM9 8V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V8" },
  { id: "projects", label: "Projects", icon: "M4 6h16M4 12h16M4 18h10" },
  { id: "credentials", label: "Creds", full: "Credentials", icon: "M3.5 6h17v12h-17zM7 14.5h5M15.5 10.5l1.5 1.5 3-3" },
  { id: "contact", label: "Contact", icon: "M4 5h16v14H4zM4 7l8 6 8-6" },
] as const;

export function Nav({ name }: { name: string }) {
  const [active, setActive] = useState<string>("");
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const taps = useRef<number[]>([]);
  const tabbarRef = useRef<HTMLElement>(null);
  const [lens, setLens] = useState({ x: 0, w: 0, on: false });

  // Glide the glass lens under the active tab (re-measured on resize).
  useLayoutEffect(() => {
    const bar = tabbarRef.current;
    if (!bar) return;
    const place = () => {
      const tab = active ? bar.querySelector<HTMLElement>(`a[href="#${active}"]`) : null;
      // Off: fade out in place rather than sliding back to the start.
      setLens((prev) => (tab && tab.offsetWidth ? { x: tab.offsetLeft, w: tab.offsetWidth, on: true } : { ...prev, on: false }));
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active]);

  // Hide the desktop bar on scroll down, bring it back on scroll up.
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);
        if (Math.abs(y - last) > 6) setHidden(y > last && y > 240);
        last = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Track the section in view for the active marker.
  useEffect(() => {
    const ids = ["top", ...LINKS.map((l) => l.id), "toolkit"];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const id = e.target.id === "toolkit" ? "projects" : e.target.id;
          setActive(id === "top" ? "" : id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Five quick taps on the monogram opens the terminal (the mobile way in).
  const onMonogram = () => {
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 1600), now];
    if (taps.current.length >= 5) {
      taps.current = [];
      window.dispatchEvent(new Event("sm:terminal"));
    }
  };

  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  return (
    <>
      <header className={styles.bar} data-hidden={hidden ? "true" : "false"} data-scrolled={scrolled ? "true" : "false"}>
        <div className={styles.inner}>
          <a href="#top" className={styles.wordmark}>
            {name}
          </a>
          <nav aria-label="Sections" className={styles.links}>
            {LINKS.map((l) => (
              <a key={l.id} href={`#${l.id}`} className={styles.link} aria-current={active === l.id ? "true" : undefined}>
                {"full" in l ? l.full : l.label}
              </a>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <div className={styles.mobileTop}>
        <button type="button" className={styles.monogram} onClick={onMonogram} aria-label={`${name}, back to top`}>
          <span aria-hidden="true">{initials}</span>
        </button>
      </div>

      <nav aria-label="Sections" className={styles.tabbar} ref={tabbarRef}>
        <span
          className={styles.lens}
          aria-hidden="true"
          data-on={lens.on ? "true" : "false"}
          style={{ ["--lx" as string]: `${lens.x}px`, ["--lw" as string]: `${lens.w}px` } as React.CSSProperties}
        />
        {LINKS.map((l) => (
          <a key={l.id} href={`#${l.id}`} className={styles.tab} aria-current={active === l.id ? "true" : undefined}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={l.icon} />
            </svg>
            <span>{l.label}</span>
          </a>
        ))}
        <ThemeToggle variant="tab" />
      </nav>
    </>
  );
}
