"use client";

import type { Content } from "@/data/content-types";

import { ConsoleEgg } from "./console-egg";
import { CopyEgg } from "./copy-egg";
import { KonamiEgg } from "./konami";
import { RainEgg } from "./rain";
import { SecretsVault } from "./secrets-vault";
import { Terminal } from "./terminal";
import type { TokenInfo } from "./types";
import { UnlockCard } from "./unlock-card";

export function EasterEggs({ content, token }: { content: Content; token: TokenInfo }) {
  return (
    <>
      <Terminal content={content} token={token} />
      <KonamiEgg />
      <RainEgg />
      <ConsoleEgg token={token} />
      <CopyEgg />
      <UnlockCard />
      <SecretsVault />
    </>
  );
}
