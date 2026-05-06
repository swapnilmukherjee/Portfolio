"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearAdminSession,
  isAdminAuthenticated,
  publishDraft,
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
  if (!isAdminAuthenticated()) redirect("/admin?error=session");

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

export async function saveDraftAction(formData: FormData) {
  if (!isAdminAuthenticated()) redirect("/admin?error=session");

  const raw = String(formData.get("content") || "");

  try {
    const parsed = JSON.parse(raw);
    await saveEditableContent(parsed, true);
  } catch (error) {
    console.error("[admin] Draft save failed:", error);
    redirect("/admin?error=save");
  }

  revalidatePath("/admin");
  redirect("/admin?saved=draft");
}

export async function publishDraftAction() {
  if (!isAdminAuthenticated()) redirect("/admin?error=session");

  try {
    await publishDraft();
  } catch (error) {
    console.error("[admin] Publish draft failed:", error);
    redirect("/admin?error=save");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?saved=published");
}
