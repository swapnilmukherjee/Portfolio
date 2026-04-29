import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { Education } from "@/components/education";
import { Experience } from "@/components/experience";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Nav } from "@/components/nav";
import { Projects } from "@/components/projects";
import { Skills } from "@/components/skills";
import { Track } from "@/components/track";
import contentJson from "@/data/content.json";

export default function HomePage() {
  return (
    <>
      <Nav resumeHref={contentJson.profile.resume} />

      <main className="relative">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Contact />
      </main>

      <Footer />
      <Track page="home" />
    </>
  );
}
