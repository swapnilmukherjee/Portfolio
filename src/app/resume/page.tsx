import { redirect } from "next/navigation";

import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  const { profile } = await getContent();
  redirect(profile.resume || "/Swapnil_Mukherjee_Resume.pdf");
}
