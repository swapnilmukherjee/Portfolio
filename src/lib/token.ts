import "server-only";

import { createHmac } from "node:crypto";

import type { Content } from "@/data/content-types";

/**
 * Builds a real, verifiable HS256 JWT from CMS content. The hero shows the
 * encoded string and decodes it on scroll. Paste it into any JWT debugger:
 * the claims are genuine and the signature verifies with TOKEN_SECRET.
 */
export const TOKEN_SECRET = "curiosity";

function b64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function claimKey(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export type TokenParts = {
  header: string;
  payload: string;
  signature: string;
  headerJson: Record<string, unknown>;
  claims: Record<string, unknown>;
};

export function buildToken(content: Content): TokenParts {
  const { profile, highlights, experience } = content;
  const [roleFromTitle, orgFromTitle] = profile.title.split("@").map((s) => s.trim());
  const current = experience[0];

  const headerJson = { alg: "HS256", typ: "JWT", kid: "swapnil-v5" };

  const claims: Record<string, unknown> = {
    sub: profile.name.toLowerCase().replace(/\s+/g, "-"),
    name: profile.name,
    role: current?.role || roleFromTitle,
    org: current?.company || orgFromTitle,
    locale: profile.location,
  };
  for (const h of highlights) {
    if (/platform/i.test(h.label)) continue;
    claims[claimKey(h.label)] = h.value;
  }
  claims.scope = "ciam workforce-iam ai-agents oauth oidc saml";
  claims.picture = "verified";
  claims.iss = "swapnilmukherjee.vercel.app";

  const header = b64url(JSON.stringify(headerJson));
  const payload = b64url(JSON.stringify(claims));
  const signature = b64url(createHmac("sha256", TOKEN_SECRET).update(`${header}.${payload}`).digest());

  return { header, payload, signature, headerJson, claims };
}
