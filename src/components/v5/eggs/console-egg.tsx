"use client";

import { useEffect } from "react";

import { SECRETS, SECRET_IDS, SECRETS_STORAGE_KEY, unlockSecret } from "@/lib/secrets";

import type { TokenInfo } from "./types";

type Api = { decode: () => Record<string, unknown>; jwt: () => string; secrets: () => string[]; help: () => string };

let greeted = false;

export function ConsoleEgg({ token }: { token: TokenInfo }) {
  useEffect(() => {
    const w = window as unknown as { swapnil?: Api };
    const full = `${token.header}.${token.payload}.${token.signature}`;

    if (!greeted) {
      greeted = true;
      console.log(
        "%cSwapnil Mukherjee%c\nYou opened the dev tools, which is exactly what I would do. Try swapnil.decode() or swapnil.jwt()",
        "font: 700 18px ui-monospace, monospace; color: #2bd4b4",
        "font: 13px ui-monospace, monospace; color: #8e979f",
      );
    }

    const api: Api = {
      decode() {
        unlockSecret("console");
        console.log(token.claims);
        return token.claims;
      },
      jwt() {
        unlockSecret("console");
        console.log(
          `%c${token.header}%c.%c${token.payload}%c.%c${token.signature}`,
          "color: #ff7a4d",
          "color: inherit",
          "color: #4fb8ff",
          "color: inherit",
          "color: #2bd4b4",
        );
        console.log("HS256. The secret is a single word, and you are already showing it.");
        return full;
      },
      secrets() {
        const found = JSON.parse(localStorage.getItem(SECRETS_STORAGE_KEY) || "[]") as string[];
        const list = SECRET_IDS.map((id) => (found.includes(id) ? SECRETS[id].title : `??? ${SECRETS[id].hint}`));
        console.log(list.join("\n"));
        return list;
      },
      help() {
        const text = "swapnil.decode(), swapnil.jwt(), swapnil.secrets(), swapnil.help()";
        console.log(text);
        return text;
      },
    };
    w.swapnil = api;
    return () => {
      delete w.swapnil;
    };
  }, [token]);

  return null;
}
