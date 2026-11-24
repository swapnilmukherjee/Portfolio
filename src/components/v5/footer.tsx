"use client";

import { VaultButton } from "./eggs/vault-button";
import styles from "./footer.module.css";

export function Footer({ name }: { name: string }) {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.row}`}>
        <span>
          {name}, {new Date().getFullYear()}. Built in code, no generated assets.
        </span>
        <VaultButton />
      </div>
    </footer>
  );
}
