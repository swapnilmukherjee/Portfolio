import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";

import { ADMIN_COOKIE_NAME } from "@/lib/admin-content";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function isAuthenticated(): boolean {
  const token = process.env.ADMIN_SYNC_TOKEN;
  if (!token && process.env.NODE_ENV !== "production") return true; // dev shortcut
  if (!token) return false;
  const expected = createHash("sha256").update(token).digest("hex");
  const session = cookies().get(ADMIN_COOKIE_NAME)?.value;
  return session === expected;
}

export async function POST(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const slug = `portfolio/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const blob = await put(slug, file, { access: "public" });

  return NextResponse.json({ url: blob.url });
}
