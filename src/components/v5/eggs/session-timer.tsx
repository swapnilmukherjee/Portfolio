"use client";

import { useEffect, useRef, useState } from "react";

import { unlockSecret } from "@/lib/secrets";

import styles from "./session-timer.module.css";

const START = 300;

function fmt(s: number) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function SessionTimer() {
  const [left, setLeft] = useState(START);
  const [expired, setExpired] = useState(false);
  const leftRef = useRef(START);
  const expiredRef = useRef(false);

  useEffect(() => {
    let refresh: ReturnType<typeof setTimeout> | undefined;
    const id = setInterval(() => {
      if (document.hidden || expiredRef.current) return;
      leftRef.current -= 1;
      if (leftRef.current <= 0) {
        leftRef.current = 0;
        expiredRef.current = true;
        setLeft(0);
        setExpired(true);
        unlockSecret("expired");
        refresh = setTimeout(() => {
          leftRef.current = START;
          expiredRef.current = false;
          setLeft(START);
          setExpired(false);
        }, 2400);
        return;
      }
      setLeft(leftRef.current);
    }, 1000);
    return () => {
      clearInterval(id);
      clearTimeout(refresh);
    };
  }, []);

  return (
    <span className={styles.timer}>
      <span className="sr-only">Session timer: the demo session token refreshes every five minutes.</span>
      <span aria-hidden="true" className={styles.live}>
        {expired ? (
          <>
            <svg className={styles.ring} width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
              <path d="M6 1.5a4.5 4.5 0 0 1 4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            token expired, refreshing…
          </>
        ) : (
          `session expires in ${fmt(left)}`
        )}
      </span>
    </span>
  );
}
