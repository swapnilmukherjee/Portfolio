# Motion direction

The first revision was too static and treated the portrait like a formal identification photo. This revision makes identity a scrollable story and restores the original portrait's color and shoulder framing.

## References

- Dennis Snellenberg https://dennissnellenberg.com — spatial transitions, oversized moving type, rhythm between work and personal sections.
- Bruno Simon https://bruno-simon.com — give visitors a reason to interact; translate the principle into a small access simulation, rather than copying the car game.
- Rauno Freiberg https://rauno.me — interaction quality and responsiveness.

## Skills reviewed on November 18 2026

| Repository | GitHub stars observed | Scope |
| --- | ---: | --- |
| anthropics/skills | 197155 | Whole skills collection, including frontend-design; not an individual skill count |
| nextlevelbuilder/ui-ux-pro-max-skill | 151304 | Dedicated UI/UX design skill |
| Leonxlnx/taste-skill | 118358 | Design skill candidate researched |
| pbakaus/impeccable | 112843 | Design skill candidate researched |

Applied Anthropic frontend-design and UI/UX Pro Max. Its design-system query matched scroll-triggered storytelling and complex scrub motion. Its pink brutalist palette did not fit the identity engineering subject; retain cobalt and silver and introduce a dark cinematic chapter instead.

## Design before implementation

`design/motion-storyboard.svg` is an editable vector board with desktop and phone frames and motion annotations. It can be imported into Figma. It was authored without a Figma account; it is not a hosted Figma file.

Palette: porcelain #f3f4f6, cobalt #2445dc, ink #12151d, silver #c7cbd4, ice #cad7ff. Manrope for the kinetic name and chapter titles; Instrument Serif reserved for the personal sign-off.

Opening: oversize personal name, a silver aperture that deconstructs as visitors scroll, and a short introduction. No loading screen.

Narrative chapter: a native vertical scroll moves through People, Applications, and AI agents. The active chapter changes the central access sculpture and its associated message. Keep the full DOM readable without JavaScript. One desktop pin only; mobile chapters flow vertically.

Interactive moment: a clearly labeled local demonstration of an access check. A button transitions a request through checking to permission granted. No network requests, token collection, or actual authentication.

Projects: perspective-flattening featured interface, staggered archive entrances, restrained interactive row movement. Keep filters, disclosures, and existing project links.

Personal section: the original photo in full color, with full shoulder framing, a tilted contact-sheet composition, and a handwritten-style introduction. No synthetic face edits, grayscale treatment, or tight head crop.

Finale: large moving contact typography and a straightforward functional form. Motion pauses offscreen and while the tab is hidden; reduced-motion users get readable static states and an immediate simulation result. Keyboard and touch controls remain available.
