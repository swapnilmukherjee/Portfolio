"use client";

import { useEffect } from "react";

import { unlockSecret } from "@/lib/secrets";

function insideToken(node: Node | null) {
  const el = node && (node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement);
  return !!el && !!el.closest("[data-token]");
}

/** Unlocks "copied" when the visitor copies text selected inside the hero token. */
export function CopyEgg() {
  useEffect(() => {
    const onCopy = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      if (insideToken(sel.anchorNode) || insideToken(sel.focusNode) || insideToken(range.commonAncestorContainer)) {
        unlockSecret("copied");
      }
    };
    document.addEventListener("copy", onCopy);
    return () => document.removeEventListener("copy", onCopy);
  }, []);
  return null;
}
