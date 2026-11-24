"use client";

import { SECRET_COUNT, useSecrets } from "@/lib/secrets";

import styles from "./secrets-counter.module.css";

export function SecretsCounter() {
  const found = useSecrets();
  const n = found.length;
  const done = n === SECRET_COUNT;
  return (
    <span className={`${styles.counter} ${done ? styles.done : ""}`}>
      {done ? "all secrets found. You would make a good pentester." : `secrets found ${n} of ${SECRET_COUNT}`}
    </span>
  );
}
