/**
 * Schema mirror for content.json. Keep this in lockstep with the JSON file
 * and the Postgres `portfolio_content.data` JSONB shape.
 */

export type Profile = {
  name: string;
  firstName: string;
  title: string;
  tagline: string;
  headline: string;
  shortBio: string;
  about: string;
  location: string;
  email: string;
  publicEmail: string;
  phone: string;
  availability: string;
  socials: {
    github: string;
    linkedin: string;
    email: string;
  };
  resume: string;
  headshotUrl?: string;
};

export type Highlight = {
  label: string;
  value: string;
  detail: string;
};

export type SkillGroup = {
  category: string;
  icon: string;
  items: string[];
};

export type Experience = {
  id: string;
  role: string;
  company: string;
  contractInfo: string | null;
  logo: string;
  period: string;
  location: string;
  type: string;
  color: string;
  accent: string;
  summary: string;
  highlights: string[];
  tags: string[];
};

export type Education = {
  id: string;
  school: string;
  degree: string;
  period: string;
  location: string;
  accent: string;
};

export type Certification = {
  name: string;
  issuer: string;
  status?: "earned" | "in-progress";
  expected?: string;
  issued?: string;
};

export type Project = {
  id: string;
  title: string;
  date: string;
  category: string;
  icon: string;
  color: string;
  summary: string;
  description: string;
  tags: string[];
  imageUrl?: string;
  github?: string;
  website?: string;
};

export type AboutStat = {
  key: string;
  value: string;
  sub: string;
};

export type SiteCopy = {
  heroStatus: string;
  aboutHeading: string;
  aboutHeadingBold: string;
  aboutSubheading: string;
  aboutStats: AboutStat[];
  experienceHeading: string;
  experienceHeadingBold: string;
  experienceSubheading: string;
  projectsHeading: string;
  projectsHeadingBold: string;
  projectsSubheading: string;
  skillsHeading: string;
  skillsHeadingBold: string;
  skillsSubheading: string;
};

export type Content = {
  profile: Profile;
  highlights: Highlight[];
  skills: SkillGroup[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  projects: Project[];
  siteCopy: SiteCopy;
};
