# Connection fieldbook / supplied palettes

A personal engineering portfolio. Full name in the header, no arbitrary logo. Archivo display and Manrope body. A borderless transparent portrait cutout sits directly in the colored, textured hero. There is no arch, card, border or sticker around the person. The three access cards sit in a separate identity scene below the introduction, so no UI covers the face or torso. Career descriptions remain visible beside a sticky employer index. Project diagrams explain actual mechanisms. Credentials are readable records rather than stamps.

## Color
Light: Sky Blue #0593C6 is the dominant page surface; White #FCFFFF is reserved for display type and glass highlights; Hot Pink #D83995 is the accent. No large white page fields.
Dark: Midnight Black #02070A, Electric Blue #0297DE, Cantaloupe Orange #FC734D.
Source: user-uploaded palette screenshots, IMG_1333.jpeg and IMG_1334.jpeg. No uploaded screenshot or person from those references is embedded in the site.

White and midnight are shared neutral text colors; midnight carries small body text on the sky-blue light surface. Reference sky blue / white is 3.48:1, suitable for large type rather than small text. Pink / midnight is 4.76:1; orange / midnight is 7.42:1. Accent fills use midnight text. Border, secondary-text and surface shades derive from the palette.

## Glass
Only the theme/menu controls and three floating hero access cards get translucent material, inset highlights, a soft shadow and restrained press feedback. The selected access card stays solid for contrast. Other access cards use small SVG backdrop displacement where supported, plus blur/saturation as a Safari/Firefox fallback. The text remains sharp. No glass on job descriptions, project tables, credentials or contact fields. Reduced transparency and increased contrast restore solid surfaces. The glass tint changes with the selected palette.

Guidance: https://github.com/Ghoscro/liquid-glass-design-skill and Apple's HIG Materials. Downloaded in design-tools/liquid-glass and linked from the local agent skills directory. CSS-first, no new runtime dependency.

## Motion and function
Hero separation; connection-path drawing; current-job tracking; short project-specific mechanism animations; credential wipe reveals; scroll-linked contact type. Native scroll, no cursor replacement or endless logo loops. Reduced motion keeps content visible and skips GSAP choreography. CMS content, project details, resume route, contact endpoint and draft mode remain intact.

Figma Starter MCP allowance was exhausted in the prior redesign. The older Figma boards are not current; implementation and this document are authoritative.

## Texture and color balance
The reference websites use color as illuminated fields, rather than isolated accents. Light mode is blue-led with a pink light falloff. Dark mode uses a midnight ground, electric-blue light and a smaller orange falloff. A static fine-grain SVG and vertical optical ridges give the hero tactile depth. Text stays on the calmer left side; the stronger texture sits behind the portrait. Project and contact surfaces carry a much quieter version of the grain. Increased contrast removes texture and transparency. No animated noise, grain on text glyphs, or heavy full-page blur.

## Portrait asset
public/portrait-cutout.webp is a transparent extraction from the original public/headshot.jpg. Background removed using the built-in image tool with instructions to preserve identity, pose, clothes and photographic appearance; no new portrait was requested. Converted to WebP for delivery. The original remains unchanged. Generation prompt: remove only the gray studio background, preserve the exact person, face, hair, expression, proportions, jacket, shirt, lighting and crop; no retouching, added text, border, shadow or halo.
