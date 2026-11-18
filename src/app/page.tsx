import { Portfolio } from "@/components/portfolio";
import { Track } from "@/components/track";
import { getContent, isDraftModeEnabled } from "@/lib/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function HomePage() {
  const [content, isDraft] = await Promise.all([getContent(), isDraftModeEnabled()]);
  return <><Portfolio content={content} isDraft={isDraft}/><Track page="home"/></>;
}
