"use client";

import { VaultButton } from "./eggs/vault-button";
import styles from "./footer.module.css";

export function Footer({ name }: { name: string }) {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.row}`}>
        <span>
          © {new Date().getFullYear()} {name}
        </span>
        <VaultButton />
      </div>
    </footer>
  );
}
