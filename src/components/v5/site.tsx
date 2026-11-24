"use client";

import { useEffect } from "react";

import type { Content } from "@/data/content-types";
import type { TokenParts } from "@/lib/token";

import { Contact } from "./contact";
import { Credentials } from "./credentials";
import { EasterEggs } from "./eggs";
import { Footer } from "./footer";
import { ScrollTrigger } from "./gsap";
import { Hero } from "./hero";
import { Nav } from "./nav";
import { Scopes } from "./scopes";
import { Sessions } from "./sessions";
import { Statement } from "./statement";
import { Toolkit } from "./toolkit";

type Props = { content: Content; token: TokenParts; isDraft: boolean };

export function Site({ content, token, isDraft }: Props) {
  // Fonts and the portrait change layout height after first paint; re-measure triggers once they settle.
  useEffect(() => {
    let cancelled = false;
    document.fonts?.ready.then(() => !cancelled && ScrollTrigger.refresh());
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      cancelled = true;
      window.removeEventListener("load", onLoad);
    };
  }, []);

  const { profile } = content;

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      {isDraft && <div role="status" style={{ position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 90, padding: "6px 14px", borderRadius: 999, background: "var(--c1)", color: "var(--on-accent)", fontFamily: "var(--font-code)", fontSize: 12 }}>Draft preview</div>}
      <Nav name={profile.name} />
      <main id="main">
        <Hero profile={profile} token={token} />
        <Statement text={profile.about} metrics={content.highlights} />
        <Sessions experience={content.experience} />
        <Scopes projects={content.projects} />
        <Toolkit skills={content.skills} />
        <Credentials certifications={content.certifications} education={content.education} />
        <Contact profile={profile} />
      </main>
      <Footer name={profile.name} />
      <EasterEggs content={content} token={token} />
    </>
  );
}
