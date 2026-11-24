"use client";

/**
 * Tiny easter-egg registry. Anything can call unlockSecret(id); the footer
 * counter, unlock card and vault listen via useSecrets(). Persisted in localStorage.
 */
import { useSyncExternalStore } from "react";

export type SecretInfo = {
  /** Short name shown as a heading. */
  title: string;
  /** What the visitor just did and what it means. */
  found: string;
  /** Cryptic clue shown while the secret is still locked. */
  hint: string;
};

export const SECRETS = {
  signature: {
    title: "Signature verified",
    found:
      "You checked the token's HS256 signature in your browser. The token in the hero is a real JWT, signed from this site's content.",
    hint: "The third segment of the token is clickable.",
  },
  terminal: {
    title: "Terminal access",
    found:
      "You opened the guest terminal. Type help to see what it can do, including a way to list every secret.",
    hint: "Tap the monogram five times, or press a key you rarely use.",
  },
  konami: {
    title: "Admin scope granted",
    found:
      "You entered the Konami code. The page briefly switches to an admin theme, the way a role change shows up in a real session.",
    hint: "An old cheat code still works here. Up, up, and onward.",
  },
  rain: {
    title: "Seattle weather",
    found:
      "You held the theme toggle and brought in some Seattle rain. A long press and a click are different gestures, and the site listens for both.",
    hint: "The theme toggle does more if you do not let go.",
  },
  console: {
    title: "Console explorer",
    found:
      "You called the swapnil API from the dev tools. Try swapnil.help() to see what else is exposed there.",
    hint: "Open the dev tools. Something is listening.",
  },
  copied: {
    title: "Token copied",
    found:
      "You copied the hero token. Paste it into jwt.io to decode it and see the claims for yourself.",
    hint: "Select the token in the hero and copy it.",
  },
} as const satisfies Record<string, SecretInfo>;

export type SecretId = keyof typeof SECRETS;
/** Fixed display order, used by the vault, terminal and console. */
export const SECRET_IDS = Object.keys(SECRETS) as SecretId[];
export const SECRET_COUNT = SECRET_IDS.length;

export const SECRETS_STORAGE_KEY = "sm:secrets:v6";
const KEY = SECRETS_STORAGE_KEY;
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
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { id, label: SECRETS[id].title, count: cache.length } }));
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
