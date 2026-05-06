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

import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function HomePage() {
  const content = await getContent();
  const { profile, experience, projects, skills, education, certifications } = content;

  return (
    <>
      {/* Ambient identity graph behind every section */}
      <SpatialStage />

      <Nav resumeHref={profile.resume} />

      <main className="relative">
        <Hero profile={profile} />
        <About profile={profile} />
        <Experience experience={experience} />
        <Projects projects={projects} />
        <Skills skills={skills} />
        <Education education={education} certifications={certifications} />
        <Contact profile={profile} />
      </main>

      <Footer profile={profile} />
      <Track page="home" />
    </>
  );
}
