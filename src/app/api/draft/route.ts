import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";

import { ADMIN_COOKIE_NAME } from "@/lib/admin-content";

function isAdminSession(): boolean {
  const token = process.env.ADMIN_SYNC_TOKEN;
  if (!token && process.env.NODE_ENV !== "production") return true;
  if (!token) return false;
  const expected = createHash("sha256").update(token).digest("hex");
  const session = cookies().get(ADMIN_COOKIE_NAME)?.value;
  return session === expected;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (!isAdminSession()) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (action === "enable") {
    draftMode().enable();
    const redirect = searchParams.get("redirect") || "/";
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  if (action === "disable") {
    draftMode().disable();
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
