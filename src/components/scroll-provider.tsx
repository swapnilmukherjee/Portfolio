// Deprecated in v4, kept as a no-op so any stale import doesn't break the build.
// Native CSS scroll-behavior: smooth handles in-page anchors.
import type { ReactNode } from "react";
export function ScrollProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
