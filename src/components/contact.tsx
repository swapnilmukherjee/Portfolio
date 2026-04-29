"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Loader2, Mail, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Reveal } from "./reveal";
import { SpotlightCard } from "./spotlight-card";
import contentJson from "@/data/content.json";

type Status = "idle" | "sending" | "ok" | "error";

export function Contact() {
  const { profile } = contentJson;
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      subject: String(data.get("subject") || "").trim() || undefined,
      message: String(data.get("message") || "").trim(),
      website: String(data.get("website") || ""), // honeypot
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(json?.detail || "Something went wrong sending your message.");
        return;
      }
      setStatus("ok");
      setMessage(json?.detail || "Thanks — your message is on its way.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error — please try emailing directly.");
    }
  }

  return (
    <section id="contact" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">06 — Contact</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-5xl">
                Let&rsquo;s build the <span className="text-gradient">identity layer</span>.
              </h2>
              <p className="mt-4 text-sm text-muted sm:text-base">
                {profile.availability} I&rsquo;m always up for a chat about CIAM architecture, Auth0 deployments, or identity for AI agents.
              </p>

              <div className="mt-8 space-y-3 text-sm">
                <a
                  href={`mailto:${profile.publicEmail}`}
                  className="group inline-flex items-center gap-3 rounded-2xl border border-border/60 bg-bg-elevated/40 px-4 py-3 text-text transition hover:border-accent/40 hover:bg-accent/10"
                >
                  <Mail className="h-4 w-4 text-accent" />
                  <span className="font-mono text-xs">{profile.publicEmail}</span>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-text" />
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-3">
            <SpotlightCard className="p-7 sm:p-9">
              <form onSubmit={onSubmit} className="space-y-5" noValidate>
                {/* Honeypot — hidden from real users */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  className="absolute left-[-9999px] h-0 w-0 opacity-0"
                  aria-hidden
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name" name="name" type="text" required placeholder="Your name" />
                  <Field label="Email" name="email" type="email" required placeholder="you@company.com" />
                </div>
                <Field label="Subject" name="subject" type="text" placeholder="What&rsquo;s this about?" />

                <div>
                  <label htmlFor="message" className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    minLength={10}
                    rows={5}
                    placeholder="Tell me a bit about what you&rsquo;re working on…"
                    className="w-full rounded-xl border border-border/60 bg-bg/60 px-4 py-3 text-sm text-text placeholder:text-muted/70 transition focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="group inline-flex items-center gap-2 rounded-full bg-text px-6 py-2.5 text-sm font-medium text-bg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === "sending" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                      </>
                    ) : (
                      <>
                        Send message
                        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>

                  <AnimatePresence>
                    {(status === "ok" || status === "error") && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ${
                          status === "ok"
                            ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                            : "border border-red-500/40 bg-red-500/10 text-red-500"
                        }`}
                      >
                        {status === "ok" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                        {message}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </form>
            </SpotlightCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted">
        {label}
        {required && <span className="ml-1 text-accent">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border/60 bg-bg/60 px-4 py-2.5 text-sm text-text placeholder:text-muted/70 transition focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20"
      />
    </div>
  );
}
