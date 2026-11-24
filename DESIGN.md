# Design: v5 "Signed token"

Research inputs: anthropics/skills frontend-design, pbakaus/impeccable, Leonxlnx/taste-skill,
emilkowalski/skills, greensock/gsap-skills, nextlevelbuilder/ui-ux-pro-max-skill.

## Easter eggs
1. Click the teal signature in the hero token: it is verified in the browser with SubtleCrypto (HS256).
2. Backtick, typing `whoami`, or tapping the mobile monogram five times opens the access terminal.
3. Konami code (or the swipe version on touch) grants admin scope for 12 seconds.
4. Hold the theme toggle for Seattle rain.
5. Open dev tools and call `swapnil.decode()`.
6. Stay until the footer session timer expires.
The hero token is a real JWT built from CMS content in `src/lib/token.ts`.

## Contributor rules

Concept: "Signed token". Swapnil is an identity engineer (Okta / Auth0, CIAM, IAM for AI agents).
The page is a JWT being decoded. Hero shows a real HS256 token; scroll decodes it into his claims.
Sections borrow identity vocabulary, lightly: "Session history" (experience), "Granted scopes" (projects),
"Toolkit" (skills), "Verified credentials" (certs + education), "Contact me".

## Hard rules
- Everything is code: CSS, inline SVG, canvas. No generated images, no stock assets, no icon fonts, no emoji.
  The only raster image on the site is the real headshot (profile.headshotUrl or /headshot.jpg).
- Content comes from props (CMS). Never invent facts, numbers, dates, links or testimonials.
- Next.js 14 App Router, React 18, TypeScript strict. Client components start with "use client".
- Styling: one CSS Module per component (`name.module.css`) next to it. Use the CSS variables from
  `src/app/globals.css` only — never hard-code theme colors:
  `--bg --raised --raised-2 --line --line-strong --text --text-2 --muted --c1 --c2 --c3 --on-accent`
  `--font-display --font-body --font-code --ease-out --ease-inout --ease-drawer --ease-arrive --gutter --max --radius --radius-sm`
  Global helpers: `.wrap` (centered max-width container with gutters), `.t-section` (section heading), `.t-meta`, `.t-code`, `.sr-only`.
  Display type: `font-family: var(--font-display)` is Archivo variable with `font-stretch` 62%–125% and weight 100–900.
- Theme is a class on <html> (`dark` / `light`); the variables already switch. Both themes must look right.
- Mobile breakpoint: `@media (max-width: 799px)` in CSS, `"(max-width: 799px)"` in gsap.matchMedia.
  Mobile is a DIFFERENT UI, not a squished desktop: horizontal swipe rails with scroll-snap, bottom sheets,
  big tap targets (≥44px), 16px+ body text. A fixed bottom tab bar ~80px tall exists on mobile:
  leave `padding-bottom` room for it in anything fixed/sticky at the bottom.
- Motion: GSAP 3 + ScrollTrigger via `import { gsap, ScrollTrigger, useGSAP } from "@/components/v5/gsap"`
  (already registered). Use `useGSAP(() => { const mm = gsap.matchMedia(); mm.add({...}) }, { scope: ref })`.
  Only animate transform / opacity / clip-path (and font-stretch on display type sparingly).
  Easing: ease-out `cubic-bezier(0.23,1,0.32,1)` (GSAP: "power3.out" / "expo.out"), never ease-in for UI, no bounce.
  UI transitions 150–300ms, overlays 300–500ms. Scrub with a number (`scrub: 0.6`).
  `prefers-reduced-motion: reduce` → no spatial movement, content fully visible. Content must be visible with JS off
  (set initial hidden states inside GSAP, not in CSS).
  Do NOT add fade-up-on-scroll to every block. Each section gets ONE authored, purposeful motion idea.
- Framer Motion v11 is available for gesture/drawer UI (bottom sheets) if useful.
- Accessibility: real <button>/<a>, aria-labels on icon buttons, visible focus (global :focus-visible exists),
  Escape closes overlays, focus returns to the trigger.
- Copy: no eyebrow/kicker labels above headings, no "01/02/03" numbering, no em dashes, no exclamation marks,
  no "seamless/robust/unlock/elevate", no tracked ALL-CAPS labels, no gradient text, no glassmorphism,
  no identical icon+heading+text card grids, no hover-lift on every card.
- Easter eggs: `import { unlockSecret } from "@/lib/secrets"` and call `unlockSecret("id")` when found.
- Don't edit files you weren't assigned. Don't run `npm run dev`/`next build`/`next start`.
  Check types with `npx tsc --noEmit -p .` (errors from other contributors' in-progress files are OK; fix yours).

## Palette (for reference; use the variables)
Dark: bg #090B0D, raised #111417, line #22272C, text #E8ECEF, muted #8E979F, c1 #FF7A4D (orange), c2 #4FB8FF (blue), c3 #2BD4B4 (teal)
Light "Fog": bg #E9EEF1, raised #F7F9FA, line #C9D2D8, text #0C1116, muted #4D5963, c1 #C2410C, c2 #0B66B8, c3 #0A7F6C

## Types
`import type { Content, Experience, Project, SkillGroup, Certification, Education } from "@/data/content-types"`.
Sample data: `src/data/content.json`.
