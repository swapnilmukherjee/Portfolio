"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import type { Content } from "@/data/content-types";
import { SECRETS, SECRET_IDS, unlockSecret, useSecrets, SECRET_COUNT } from "@/lib/secrets";

import type { TokenInfo } from "./types";
import styles from "./terminal.module.css";

type Entry = { id: number; node: ReactNode };

const SECTIONS = ["work", "projects", "toolkit", "credentials", "contact"];

function typingTarget(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  if (!el || !el.tagName) return false;
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable;
}

export function Terminal({ content, token }: { content: Content; token: TokenInfo }) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [value, setValue] = useState("");
  const found = useSecrets();
  const idRef = useRef(0);
  const prevFocus = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const hist = useRef<string[]>([]);
  const histPos = useRef(-1);
  const openRef = useRef(false);

  const show = useCallback(() => {
    if (openRef.current) return;
    openRef.current = true;
    prevFocus.current = document.activeElement as HTMLElement | null;
    unlockSecret("terminal");
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    if (!openRef.current) return;
    openRef.current = false;
    setOpen(false);
    const el = prevFocus.current;
    if (el && el.isConnected) el.focus();
  }, []);

  useEffect(() => {
    let buf = "";
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || typingTarget(e.target)) return;
      if (e.key === "`") {
        e.preventDefault();
        show();
        return;
      }
      if (e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-6);
      if (buf === "whoami") {
        buf = "";
        e.preventDefault();
        show();
      }
    };
    const onEvt = () => show();
    window.addEventListener("keydown", onKey);
    window.addEventListener("sm:terminal", onEvt);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("sm:terminal", onEvt);
    };
  }, [show]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, close]);

  useEffect(() => {
    const b = bodyRef.current;
    if (b) b.scrollTop = b.scrollHeight;
  }, [entries, open]);

  const push = (node: ReactNode) => {
    idRef.current += 1;
    const id = idRef.current;
    return { id, node } as Entry;
  };

  const goto = (id: string) => {
    close();
    const el = document.getElementById(id);
    if (el) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  };

  const run = (raw: string): ReactNode[] | "clear" | null => {
    const line = raw.trim();
    if (!line) return [];
    const [cmdRaw, ...args] = line.split(/\s+/);
    const cmd = cmdRaw.toLowerCase();
    const rest = args.join(" ");
    const { profile, projects } = content;
    const out = (s: string) => <span>{s}</span>;

    switch (cmd) {
      case "help":
        return [
          out(
            [
              "help                list commands",
              "whoami              show current identity",
              "ls [projects]       list sections or projects",
              "cat about|contact   read a file",
              "open <n|name>       jump to a project",
              "decode              print the token claims",
              "jwt                 print the full token",
              "contact             go to the contact section",
              "theme [dark|light]  switch theme",
              "rain                check the forecast",
              "secrets             list what you have found",
              "vault               open the secrets vault",
              "clear, exit",
            ].join("\n"),
          ),
        ];
      case "whoami":
        return [out("guest  scope: read:portfolio")];
      case "ls":
        if (rest.toLowerCase() === "projects") {
          return [out(projects.map((p, i) => `${String(i + 1).padStart(2, " ")}  ${p.title} (${p.date})`).join("\n"))];
        }
        if (rest) return [<span key="e" className={styles.err}>{`ls: cannot access '${rest}'`}</span>];
        return [out(SECTIONS.join("  "))];
      case "cat":
        if (rest.toLowerCase() === "about") return [out(profile.about)];
        if (rest.toLowerCase() === "contact") return [out(`${profile.email}\n${profile.phone}`)];
        return [<span key="e" className={styles.err}>{rest ? `cat: ${rest}: no such file` : "cat: missing file. Try cat about."}</span>];
      case "open": {
        if (!rest) return [out("usage: open <n|name>. Try ls projects.")];
        const n = Number(rest);
        const q = rest.toLowerCase();
        const hit = Number.isInteger(n) && n >= 1 && n <= projects.length
          ? projects[n - 1]
          : projects.find((p) => p.title.toLowerCase().includes(q) || p.id.toLowerCase() === q);
        if (!hit) return [<span key="e" className={styles.err}>{`open: no project matches '${rest}'`}</span>];
        goto("projects");
        return null;
      }
      case "decode":
        return [
          <span key="d">
            {JSON.stringify(token.claims, null, 2)
              .split("\n")
              .map((l, i) => {
                const m = /^(\s*)"([^"]+)":(.*)$/.exec(l);
                return m ? (
                  <span key={i}>
                    {m[1]}
                    <span className={styles.key}>{`"${m[2]}"`}</span>:{m[3]}
                    {"\n"}
                  </span>
                ) : (
                  <span key={i}>{l}{"\n"}</span>
                );
              })}
          </span>,
        ];
      case "jwt":
        return [
          <span key="j" className={styles.jwt}>
            <span className={styles.h}>{token.header}</span>.<span className={styles.p}>{token.payload}</span>.
            <span className={styles.s}>{token.signature}</span>
          </span>,
          out("It is a real HS256 token. Paste it into any JWT debugger; the secret is the reason you are here: curiosity"),
        ];
      case "sudo":
        return [<span key="s" className={styles.deny}>403 Forbidden: insufficient scope. Try `contact`.</span>];
      case "contact":
        goto("contact");
        return null;
      case "theme": {
        const a = rest.toLowerCase();
        if (a && a !== "dark" && a !== "light") return [out("usage: theme [dark|light]")];
        const detail = a || "toggle";
        window.dispatchEvent(new CustomEvent("sm:theme", { detail }));
        return [out(a ? `theme: ${a}` : "theme: toggled")];
      }
      case "rain":
        window.dispatchEvent(new Event("sm:rain"));
        return [out("Checking the forecast...")];
      case "secrets": {
        const lines = SECRET_IDS.map((id) => `  ${found.includes(id) ? SECRETS[id].title : `???  ${SECRETS[id].hint}`}`);
        return [out(`Found ${found.length} of ${SECRET_COUNT}\n${lines.join("\n")}`)];
      }
      case "vault":
        window.dispatchEvent(new Event("sm:vault"));
        return [out("Opening the vault...")];
      case "clear":
        return "clear";
      case "exit":
        close();
        return null;
      default:
        return [<span key="u" className={styles.err}>{`command not found: ${cmdRaw}. Try help.`}</span>];
    }
  };

  const submit = () => {
    const line = value;
    setValue("");
    if (line.trim()) {
      hist.current.push(line);
      histPos.current = hist.current.length;
    }
    const echo = push(
      <span>
        <span className={styles.prompt}>guest@swapnil $</span> {line}
      </span>,
    );
    const res = run(line);
    if (res === "clear") {
      setEntries([]);
      return;
    }
    if (res === null) return;
    setEntries((prev) => [...prev, echo, ...res.map((n) => push(n))]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!hist.current.length) return;
      histPos.current = Math.max(0, histPos.current - 1);
      setValue(hist.current[histPos.current] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!hist.current.length) return;
      histPos.current = Math.min(hist.current.length, histPos.current + 1);
      setValue(hist.current[histPos.current] ?? "");
    } else if (e.key === "`") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      e.preventDefault();
    }
  };

  if (!open) return null;

  return (
    <div className={styles.root}>
      <div className={styles.backdrop} onMouseDown={close} aria-hidden="true" />
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Access terminal">
        <div className={styles.bar}>
          <span>guest@swapnil ~ access terminal</span>
          <span>esc to close</span>
        </div>
        <div
          className={styles.body}
          ref={bodyRef}
          onMouseDown={(e) => {
            if (!(e.target as HTMLElement).closest("input")) {
              e.preventDefault();
              inputRef.current?.focus();
            }
          }}
        >
          <div className={styles.line}>Type help to list commands.</div>
          {entries.map((en) => (
            <div key={en.id} className={styles.line}>{en.node}</div>
          ))}
          <label className={styles.inputRow}>
            <span className={styles.prompt}>guest@swapnil $</span>
            <input
              ref={inputRef}
              className={styles.input}
              aria-label="Terminal command"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              autoFocus
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
