"use client";

import { useEffect } from "react";

/**
 * Fires a single /api/track ping per session (uses sessionStorage as a guard).
 * Failures are silent — analytics shouldn't be load-bearing.
 */
export function Track({ page = "home" }: { page?: string }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const key = `tracked:${page}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
      fetch(`/api/track?page=${encodeURIComponent(page)}`, { keepalive: true }).catch(() => {});
    } catch {
      /* no-op */
    }
  }, [page]);

  return null;
}
