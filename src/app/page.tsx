import { Site } from "@/components/v5/site";
import { Track } from "@/components/track";
import { getContent, isDraftModeEnabled } from "@/lib/content";
import { buildToken } from "@/lib/token";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function HomePage() {
  const [content, isDraft] = await Promise.all([getContent(), isDraftModeEnabled()]);
  // Only earned credentials are shown; in-progress ones stay in the CMS but off the page.
  const certifications = content.certifications.filter((c) => c.status !== "in-progress");
  const token = buildToken(content);
  return (
    <>
      <Site content={{ ...content, certifications }} token={token} isDraft={isDraft} />
      <Track page="home" />
    </>
  );
}
