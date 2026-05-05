"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearAdminSession,
  isAdminAuthenticated,
  saveEditableContent,
  setAdminSession,
  verifyAdminToken,
} from "@/lib/admin-content";

export async function loginAction(formData: FormData) {
  const token = String(formData.get("token") || "");
  if (!verifyAdminToken(token)) {
    redirect("/admin?error=login");
  }

  setAdminSession();
  redirect("/admin?saved=login");
}

export async function logoutAction() {
  clearAdminSession();
  redirect("/admin");
}

export async function saveContentAction(formData: FormData) {
  if (!isAdminAuthenticated()) {
    redirect("/admin?error=session");
  }

  const raw = String(formData.get("content") || "");
  let saveTarget = "content";

  try {
    const parsed = JSON.parse(raw);
    saveTarget = await saveEditableContent(parsed);
  } catch (error) {
    console.error("[admin] Content save failed:", error);
    redirect("/admin?error=save");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect(`/admin?saved=${saveTarget}`);
}
