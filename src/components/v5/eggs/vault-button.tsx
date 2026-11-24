"use client";

import { SECRET_COUNT, useSecrets } from "@/lib/secrets";

import styles from "./vault-button.module.css";

export function VaultButton() {
  const n = useSecrets().length;
  return (
    <button type="button" className={styles.btn} onClick={() => window.dispatchEvent(new Event("sm:vault"))}>
      Secrets {n} of {SECRET_COUNT}
    </button>
  );
}
