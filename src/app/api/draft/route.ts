import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-content";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (!isAdminAuthenticated()) {
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
