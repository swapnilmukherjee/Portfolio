"use client";

/**
 * Tiny easter-egg registry. Anything can call unlockSecret(id); the footer
 * counter and toast listen via useSecrets(). Persisted in localStorage.
 */
import { useSyncExternalStore } from "react";

export const SECRETS = {
  signature: "Verified the signature",
  terminal: "Opened the access terminal",
  konami: "Escalated to admin scope",
  rain: "Brought the Seattle weather",
  console: "Decoded from the console",
  expired: "Outlasted the session",
} as const;

export type SecretId = keyof typeof SECRETS;
export const SECRET_COUNT = Object.keys(SECRETS).length;

const KEY = "sm:secrets:v5";
const EVENT = "sm:secret";
let cache: SecretId[] | null = null;
const EMPTY: SecretId[] = [];

function read(): SecretId[] {
  if (cache) return cache;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    cache = Array.isArray(raw) ? raw.filter((x): x is SecretId => x in SECRETS) : [];
  } catch {
    cache = [];
  }
  return cache;
}

export function unlockSecret(id: SecretId) {
  if (typeof window === "undefined") return;
  const found = read();
  if (found.includes(id)) return;
  cache = [...found, id];
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* private mode */ }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { id, label: SECRETS[id], count: cache.length } }));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

export function useSecrets() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function onSecret(cb: (detail: { id: SecretId; label: string; count: number }) => void) {
  const handler = (e: Event) => cb((e as CustomEvent).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
