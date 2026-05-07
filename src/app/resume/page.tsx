export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getContent } from "@/lib/content";

export default async function ResumePage() {
  const { profile } = await getContent();
  redirect(profile.resume || "/Swapnil_Mukherjee_Resume.pdf");
}
