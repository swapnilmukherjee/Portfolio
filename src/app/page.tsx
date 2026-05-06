import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { Education } from "@/components/education";
import { Experience } from "@/components/experience";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Nav } from "@/components/nav";
import { Projects } from "@/components/projects";
import { Skills } from "@/components/skills";
import { SpatialStage } from "@/components/spatial-stage";
import { Track } from "@/components/track";

import { getContent, isDraftModeEnabled } from "@/lib/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function HomePage() {
  const [content, isDraft] = await Promise.all([getContent(), isDraftModeEnabled()]);
  const { profile, experience, projects, skills, education, certifications, siteCopy } = content;

  return (
    <>
      {/* Draft mode banner */}
      {isDraft && (
        <div className="fixed inset-x-0 top-0 z-[100] flex items-center justify-between gap-3 bg-amber-400 px-4 py-2 text-sm font-medium text-black">
          <span>⚠️ You are previewing a draft — this is not the live site.</span>
          <a href="/api/draft?action=disable" className="underline hover:no-underline">Exit preview</a>
        </div>
      )}

      {/* Ambient identity graph behind every section */}
      <SpatialStage />

      <Nav resumeHref={profile.resume} />

      <main className="relative">
        <Hero profile={profile} siteCopy={siteCopy} />
        <About profile={profile} siteCopy={siteCopy} />
        <Experience experience={experience} siteCopy={siteCopy} />
        <Projects projects={projects} siteCopy={siteCopy} />
        <Skills skills={skills} siteCopy={siteCopy} />
        <Education education={education} certifications={certifications} />
        <Contact profile={profile} />
      </main>

      <Footer profile={profile} />
      <Track page="home" />
    </>
  );
}
