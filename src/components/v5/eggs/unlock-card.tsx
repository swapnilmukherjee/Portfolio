"use client";

import { useEffect, useState } from "react";

import { onSecret, SECRET_COUNT, SECRETS, type SecretId } from "@/lib/secrets";

import { CloseIcon } from "./secret-icons";
import styles from "./unlock-card.module.css";

const VISIBLE_MS = 7000;

type Shown = { id: SecretId; count: number; key: number };

export function UnlockCard() {
  const [shown, setShown] = useState<Shown | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let n = 0;
    return onSecret(({ id, count }) => {
      n += 1;
      setPaused(false);
      setShown({ id, count, key: n });
    });
  }, []);

  useEffect(() => {
    if (!shown || paused) return;
    const t = setTimeout(() => setShown(null), VISIBLE_MS);
    return () => clearTimeout(t);
  }, [shown, paused]);

  useEffect(() => {
    const hide = () => setShown(null);
    window.addEventListener("sm:vault", hide);
    return () => window.removeEventListener("sm:vault", hide);
  }, []);

  const info = shown ? SECRETS[shown.id] : null;

  return (
    <div className={styles.region} role="status" aria-live="polite">
      {shown && info && (
        <div
          key={shown.key}
          className={styles.card}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
          }}
        >
          <p className={styles.kicker}>
            Secret {shown.count} of {SECRET_COUNT} unlocked
          </p>
          <h2 className={styles.title}>{info.title}</h2>
          <p className={styles.found}>{info.found}</p>
          <button type="button" className={styles.link} onClick={() => window.dispatchEvent(new Event("sm:vault"))}>
            See all secrets
          </button>
          <button type="button" className={styles.close} aria-label="Dismiss secret notification" onClick={() => setShown(null)}>
            <CloseIcon />
          </button>
        </div>
      )}
    </div>
  );
}
