"use client";

import { useEffect, useRef, useState } from "react";

import type { Content } from "@/data/content-types";
import { onSecret, SECRET_COUNT } from "@/lib/secrets";

import { ConsoleEgg } from "./console-egg";
import { KonamiEgg } from "./konami";
import { RainEgg } from "./rain";
import { Terminal } from "./terminal";
import type { TokenInfo } from "./types";
import styles from "./eggs.module.css";

export function EasterEggs({ content, token }: { content: Content; token: TokenInfo }) {
  const [text, setText] = useState("");
  const [shown, setShown] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const off = onSecret(({ label, count }) => {
      setText(`Secret found, ${count} of ${SECRET_COUNT}: ${label}`);
      setShown(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setShown(false), 3200);
    });
    return () => {
      off();
      clearTimeout(timer.current);
    };
  }, []);

  return (
    <>
      <Terminal content={content} token={token} />
      <KonamiEgg />
      <RainEgg />
      <ConsoleEgg token={token} />
      <div className={`${styles.toast} ${shown ? styles.toastOn : ""}`} role="status" aria-live="polite">
        {text}
      </div>
    </>
  );
}
