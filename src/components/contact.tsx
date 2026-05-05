"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";

import type { Profile } from "@/data/content-types";

type Status = "idle" | "sending" | "ok" | "error";

const reveal = {
  initial: { opacity: 0, y: 28, filter: "blur(8px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
};

export function Contact({ profile }: { profile: Profile }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

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
      website: String(data.get("website") || ""),
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as { detail?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage("Message could not be sent right now. Please email me directly.");
        return;
      }
      setStatus("ok");
      setMessage(json?.detail || "Thanks, your message is on its way.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Message could not be sent right now. Please email me directly.");
    }
  }

  return (
    <section id="contact" className="relative z-[2] py-32 sm:py-44">
      <div className="mx-auto max-w-[1320px] px-6 sm:px-8">
        <motion.div {...reveal} className="mb-6">
          <span className="eyebrow">06 / Contact</span>
        </motion.div>

        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <motion.h2 {...reveal} className="display-section">
              Let&rsquo;s build the
              <br />
              <b className="ir-text">identity layer.</b>
            </motion.h2>
            <motion.p {...reveal} className="mt-7 max-w-[480px] text-[17px] leading-[1.65] text-text/55">
              {profile.availability} I&rsquo;m always up for a chat about Auth0, Okta, CIAM, or identity for AI agents.
            </motion.p>
            <motion.a
              {...reveal}
              href={`mailto:${profile.publicEmail}`}
              className="glass mt-9 inline-flex items-center gap-3 rounded-2xl px-5 py-[18px] font-mono text-[13px] text-text/92 transition hover:bg-white/[0.07]"
            >
              <Mail className="h-4 w-4" style={{ color: "rgb(var(--grad-2))" }} />
              {profile.publicEmail}
              <ArrowRight className="h-3.5 w-3.5" />
            </motion.a>
          </div>

          <motion.form
            {...reveal}
            onSubmit={onSubmit}
            noValidate
            className="glass-strong rounded-[28px] p-9"
          >
            {/* Honeypot */}
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
            <Field label="Subject" name="subject" type="text" placeholder="What's this about?" />

            <div className="mb-[18px]">
              <label htmlFor="message" className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-text/55">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                minLength={10}
                rows={5}
                placeholder="Tell me a bit about what you're working on…"
                className="w-full rounded-xl border border-white/[0.08] bg-bg-2 px-3.5 py-3 text-sm text-text/92 placeholder:text-text/30 focus:border-[rgb(var(--grad-1))] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="submit"
                disabled={status === "sending"}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    Send message <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>

              <AnimatePresence>
                {(status === "ok" || status === "error") && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                      status === "ok"
                        ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-400"
                        : "border-red-400/40 bg-red-500/10 text-red-400"
                    }`}
                  >
                    {status === "ok" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                    {message}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.form>
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
    <div className="mb-[18px]">
      <label htmlFor={name} className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-text/55">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/[0.08] bg-bg-2 px-3.5 py-3 text-sm text-text/92 placeholder:text-text/30 focus:border-[rgb(var(--grad-1))] focus:outline-none"
      />
    </div>
  );
}
