"use client";

import { Reveal } from "./reveal";
import contentJson from "@/data/content.json";

const marqueeItems = [
  "Auth0", "Okta", "PingFederate", "OAuth 2.0", "OIDC", "SAML",
  "SCIM", "Zero Trust", "Auth0 for AI Agents", "Universal Login",
  "Terraform", "JavaScript", "RBAC", "MFA", "Step-up Auth",
];

export function About() {
  const { profile } = contentJson;

  return (
    <section id="about" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="mb-14 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">01 — About</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-text sm:text-5xl">
                The identity layer behind <span className="text-gradient">modern apps</span>.
              </h2>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-8 md:grid-cols-5">
          <Reveal delay={0.05} className="md:col-span-3">
            <div className="rounded-3xl border border-border/60 bg-bg-elevated/40 p-8 backdrop-blur">
              <p className="text-base leading-relaxed text-text/80 sm:text-lg">
                {profile.about}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[
                  { k: "Now", v: "Okta · Technical Consultant" },
                  { k: "Specialty", v: "CIAM & Auth0 for AI Agents" },
                  { k: "Based", v: profile.location },
                ].map((row) => (
                  <div key={row.k} className="rounded-2xl border border-border/50 bg-bg/50 p-4">
                    <div className="text-[10px] uppercase tracking-wider text-muted">{row.k}</div>
                    <div className="mt-1 text-sm font-medium text-text">{row.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="md:col-span-2">
            <div className="relative h-full overflow-hidden rounded-3xl border border-border/60 bg-bg-elevated/40 p-8 backdrop-blur">
              <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-accent/30 blur-3xl" />
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">What I work on</p>
              <ul className="mt-6 space-y-3 text-sm text-text/85">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  Customer identity (CIAM) — Auth0 tenants, Universal Login, Organizations.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  Identity for AI agents — secure patterns for agentic workflows.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  OAuth 2.0 / OIDC / SAML architecture across web, mobile, SPA, API.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  Migrations, MFA, Attack Protection, RBAC, and federation.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  Terraform-driven CI/CD for IAM configuration.
                </li>
              </ul>
            </div>
          </Reveal>
        </div>

        {/* Marquee */}
        <Reveal delay={0.15}>
          <div className="relative mt-14 overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bg to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bg to-transparent" />
            <div className="flex w-max animate-marquee gap-3 py-2">
              {[...marqueeItems, ...marqueeItems].map((item, i) => (
                <span
                  key={`${item}-${i}`}
                  className="whitespace-nowrap rounded-full border border-border/60 bg-bg-elevated/40 px-4 py-1.5 text-xs font-medium text-muted"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
