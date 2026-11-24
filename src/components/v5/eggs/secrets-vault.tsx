"use client";

import { useEffect, useRef } from "react";

import { SECRET_COUNT, SECRET_IDS, SECRETS, useSecrets } from "@/lib/secrets";

import { CheckIcon, CloseIcon, LockIcon } from "./secret-icons";
import styles from "./secrets-vault.module.css";

export function SecretsVault() {
  const ref = useRef<HTMLDialogElement>(null);
  const found = useSecrets();
  const all = found.length === SECRET_COUNT;

  useEffect(() => {
    const open = () => {
      const d = ref.current;
      if (d && !d.open) d.showModal();
    };
    window.addEventListener("sm:vault", open);
    return () => window.removeEventListener("sm:vault", open);
  }, []);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="vault-title"
      onClick={(e) => {
        if (e.target === ref.current) ref.current.close();
      }}
    >
      <button type="button" className={styles.close} aria-label="Close secrets vault" onClick={() => ref.current?.close()}>
        <CloseIcon />
      </button>
      <p className={styles.kicker}>
        {found.length} of {SECRET_COUNT} found
      </p>
      <h2 id="vault-title" className={styles.heading}>
        Secrets
      </h2>
      <ol className={styles.list}>
        {SECRET_IDS.map((id) => {
          const ok = found.includes(id);
          const s = SECRETS[id];
          return (
            <li key={id} className={`${styles.item} ${ok ? styles.ok : ""}`}>
              <span className={styles.icon}>{ok ? <CheckIcon /> : <LockIcon />}</span>
              <div>
                <p className={styles.name}>{ok ? s.title : "Locked"}</p>
                <p className={styles.text}>{ok ? s.found : s.hint}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <p className={styles.foot}>
        {all ? "All six found. You would make a good pentester." : "Keep poking around. Every one of them is on this page."}
      </p>
    </dialog>
  );
}
