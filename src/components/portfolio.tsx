"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Download, Plus, Minus, Menu, X, Sun, Moon, Check, Send } from "lucide-react";
import { useTheme } from "next-themes";
import { IdentityJourney } from "@/components/identity-journey";
import { PortfolioMotion } from "@/components/portfolio-motion";
import type { Content, Project } from "@/data/content-types";

const links = [["Work", "experience"], ["Projects", "projects"], ["About", "about"], ["Contact", "contact"]];

function Mark({ small = false }: { small?: boolean }) {
  return <svg className={small ? "personal-mark small" : "personal-mark"} viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 3v34M3 20h34M8 8l24 24M8 32L32 8" stroke="currentColor" strokeWidth="3.2"/><circle cx="20" cy="20" r="7" fill="currentColor"/></svg>;
}

function Aperture() {
  const ref = useRef<HTMLDivElement>(null);
  return <div className="aperture-scene" ref={ref} onPointerMove={e => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--tilt-x", `${((e.clientY-r.top)/r.height-.5)*-9}deg`);
    e.currentTarget.style.setProperty("--tilt-y", `${((e.clientX-r.left)/r.width-.5)*9}deg`);
  }} onPointerLeave={() => { ref.current?.style.setProperty("--tilt-x", "0deg"); ref.current?.style.setProperty("--tilt-y", "0deg"); }}>
    <div className="aperture-object">
      <svg viewBox="0 0 620 650" role="img" aria-labelledby="aperture-title">
        <title id="aperture-title">Sculptural concentric silver access boundaries with a blue center</title>
        <defs>
          <linearGradient id="metal" x1="0" y1="0" x2=".9" y2="1"><stop stopColor="#fff"/><stop offset=".18" stopColor="#bcc1cb"/><stop offset=".37" stopColor="#f8f9fa"/><stop offset=".48" stopColor="#7e8694"/><stop offset=".56" stopColor="#d8dce3"/><stop offset=".8" stopColor="#a1a8b4"/><stop offset="1" stopColor="#f6f7fa"/></linearGradient>
          <linearGradient id="bevel" x1="0" x2="1" y2="1"><stop stopColor="#ffffff"/><stop offset=".45" stopColor="#d6dae2"/><stop offset="1" stopColor="#747e90"/></linearGradient>
          <radialGradient id="blue"><stop stopColor="#5674ff"/><stop offset=".65" stopColor="#2546de"/><stop offset="1" stopColor="#122b96"/></radialGradient>
          <filter id="object-shadow" x="-40%" y="-40%" width="180%" height="200%"><feDropShadow dx="16" dy="28" stdDeviation="17" floodColor="#3e485f" floodOpacity=".22"/></filter>
          <filter id="ground-blur"><feGaussianBlur stdDeviation="16"/></filter>
        </defs>
        <ellipse cx="322" cy="578" rx="160" ry="23" fill="#57617a" opacity=".15" filter="url(#ground-blur)"/>
        <g transform="translate(310 302) rotate(-28)" filter="url(#object-shadow)">
          <ellipse rx="222" ry="257" fill="url(#metal)"/>
          <ellipse rx="216" ry="251" fill="none" stroke="#fff" strokeOpacity=".85"/>
          <ellipse cx="-3" cy="-5" rx="188" ry="218" fill="#87909e" stroke="#727d8e" strokeWidth="3"/>
          <ellipse cx="-8" cy="-10" rx="183" ry="214" fill="url(#bevel)" stroke="#fff" strokeWidth="2"/>
          <ellipse cx="-8" cy="-10" rx="158" ry="186" fill="url(#metal)" stroke="#929baa" strokeWidth="3"/>
          <ellipse cx="-14" cy="-17" rx="150" ry="177" fill="none" stroke="#fff" strokeOpacity=".8"/>
          <ellipse cx="-12" cy="-14" rx="131" ry="155" fill="#737f92"/>
          <ellipse cx="-17" cy="-20" rx="127" ry="151" fill="url(#bevel)" stroke="#eff1f6" strokeWidth="2"/>
          <ellipse cx="-18" cy="-21" rx="105" ry="127" fill="url(#metal)" stroke="#7a8698" strokeWidth="2"/>
          <ellipse cx="-23" cy="-28" rx="98" ry="119" fill="none" stroke="#fff"/>
          <ellipse cx="-20" cy="-24" rx="80" ry="99" fill="#273f83"/>
          <ellipse cx="-24" cy="-29" rx="74" ry="93" fill="url(#blue)" stroke="#e2e8ff" strokeWidth="2"/>
          <g transform="translate(-24 -29) rotate(28)" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><path d="M-17 4c0-31 34-31 34 0v14M-27 6c0-45 54-45 54 0v18M-7 6c0-16 14-16 14 0v25M-17 14v13M-27 17v5M-7 18v18M17 28v5M27 34v5"/></g>
          <path d="M-141-199c84-38 174-14 222 52" stroke="white" strokeWidth="2" fill="none" opacity=".9"/>
        </g>
      </svg>
    </div>
    <div className="object-caption"><span>Human. Machine. Agent.</span><span>One foundation: trust.</span></div>
  </div>;
}

function ProjectPreview({ kind }: { kind: string }) {
  if (kind === "tenantguard") return <div className="tenant-preview" aria-hidden="true">
    <div className="preview-sidebar"><Mark small/><span>Overview</span><span className="chosen">Access control</span><span>Members</span><span>Audit log</span><span className="sidebar-bottom">TenantGuard</span></div>
    <div className="preview-main"><div className="preview-top">Workspace / Permissions <span>Production</span></div><h4>Every role.<br/>A clear boundary.</h4><div className="permission-table"><div><span>Resource</span><span>Admin</span><span>Viewer</span></div>{["Manage members","Read analytics","Change billing"].map((s,i)=><div key={s}><span>{s}</span><Check size={13}/>{i===1?<Check size={13}/>:<Minus size={13}/>}</div>)}</div><div className="preview-foot">Auth0 authenticated <span>Access evaluated</span></div></div>
  </div>;
  return <div className="research-preview" aria-hidden="true"><div className="wave-lines">{Array.from({length:14},(_,i)=><span key={i} style={{height:`${25+Math.sin(i*.8)*22+ i*3}%`}}/>)}</div><span>Inspect. Test. Understand.</span></div>;
}

function ProjectItem({ project }: { project: Project }) {
  return <details className="archive-item"><summary><div><span className="project-category">{project.category}</span><h3>{project.title}</h3><p>{project.summary}</p></div><Plus className="disclosure-icon" size={20}/></summary><div className="project-expanded"><p>{project.description || project.summary}</p><div className="tag-list">{project.tags.map(t=><span key={t}>{t}</span>)}</div><div className="project-links">{project.github && <a href={project.github} target="_blank" rel="noreferrer">Source code</a>}{project.website && <a href={project.website} target="_blank" rel="noreferrer">Visit project</a>}<span>{project.date}</span></div></div></details>;
}

function ContactForm() {
  const [status,setStatus]=useState<"idle"|"sending"|"ok"|"error">("idle");
  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form=e.currentTarget; const data=new FormData(form); setStatus("sending");
    try {
      const res=await fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(data.entries()))});
      if (!res.ok) throw new Error("send failed"); setStatus("ok"); form.reset();
    } catch {setStatus("error");}
  }
  return <form className="editorial-form" onSubmit={submit}>
    <input name="website" tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true"/>
    <div className="form-pair"><label>Your name<input name="name" autoComplete="name" required placeholder="Name" maxLength={120}/></label><label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@company.com" maxLength={254}/></label></div>
    <label>What do you have in mind?<input name="subject" placeholder="A project, an idea, a conversation" maxLength={160}/></label>
    <label>Message<textarea name="message" rows={3} required minLength={10} maxLength={5000} placeholder="Tell me a little about it."/></label>
    <button className="action-button" disabled={status==="sending"} type="submit">{status==="sending"?"Sending…":"Send message"}<Send size={16}/></button>
    <p className={`form-status ${status}`} role="status" aria-live="polite">{status==="ok"?"Message sent. Thank you for reaching out.":status==="error"?"Couldn't send your message. Please use the email link instead.":""}</p>
  </form>;
}

export function Portfolio({content,isDraft}:{content:Content;isDraft:boolean}) {
  const {profile,experience,projects,skills,education,certifications}=content;
  const [menu,setMenu]=useState(false), [active,setActive]=useState(""), [filter,setFilter]=useState("All"), [all,setAll]=useState(false), [mounted,setMounted]=useState(false);
  const {resolvedTheme,setTheme}=useTheme();
  const categories=["All",...Array.from(new Set(projects.map(p=>p.category)))];
  const filtered=projects.filter(p=>filter==="All"||p.category===filter);
  const featured=projects.find(p=>p.id==="tenantguard") || projects[0];
  useEffect(()=>{
    setMounted(true);
    const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)setActive(e.target.id)}),{rootMargin:"-15% 0px -55% 0px"});
    document.querySelectorAll("main section[id]").forEach(el=>observer.observe(el));
    const close=(e:KeyboardEvent)=>{if(e.key==="Escape")setMenu(false)};window.addEventListener("keydown",close);
    return()=>{observer.disconnect();window.removeEventListener("keydown",close)};
  },[]);
  return <div className="portfolio-shell motion-edition"><PortfolioMotion/>
    <a href="#main" className="skip-link">Skip to content</a>
    {isDraft&&<div className="draft-notice">Draft preview <a href="/api/draft?action=disable">Exit preview</a></div>}
    <header className="site-header"><a className="wordmark" href="#home" aria-label="Swapnil Mukherjee home"><Mark/><span>Swapnil<br/>Mukherjee</span></a><nav className={menu?"main-nav open":"main-nav"} aria-label="Main navigation">{links.map(([label,id])=><a key={id} href={`#${id}`} aria-current={active===id?"location":undefined} onClick={()=>setMenu(false)}>{label}</a>)}<a className="mobile-resume" href="/resume" target="_blank" rel="noreferrer">Resume</a></nav><div className="header-actions"><button className="theme-button" type="button" aria-label={mounted&&resolvedTheme==="dark"?"Switch to light theme":"Switch to dark theme"} onClick={()=>setTheme(resolvedTheme==="dark"?"light":"dark")}>{mounted&&resolvedTheme==="dark"?<Sun size={18}/>:<Moon size={18}/>}</button><a className="resume-button" href="/resume" target="_blank" rel="noreferrer">Resume <Download size={14}/></a><button className="menu-button" aria-label={menu?"Close navigation":"Open navigation"} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X size={23}/>:<Menu size={23}/>}</button></div></header>
    <main id="main">
      <section className="hero-section" id="home"><div className="hero-intro"><span>Identity engineer & technical consultant</span><span>{profile.location}</span></div><div className="hero-composition"><div className="hero-copy"><h1><span className="title-line"><span>Access to</span></span><span className="title-line"><span>what’s next.</span></span></h1><p>I’m Swapnil. I build the identity systems connecting people, applications, and AI agents.</p><div className="hero-links"><a className="action-button" href="#experience">Explore my work <Plus size={16}/></a><a className="quiet-link" href={profile.socials.linkedin} target="_blank" rel="noreferrer">Find me on LinkedIn</a></div></div><Aperture/></div><div className="hero-name" aria-hidden="true"><div className="hero-name-track">Swapnil Mukherjee</div></div><div className="hero-bottom"><div className="current-role"><span className="role-symbol"><Mark/></span><div><span>Currently at</span><strong>Okta / Auth0</strong></div></div><p>Scroll to open the story.</p><a href="#about">Meet the engineer <span aria-hidden="true">↓</span></a></div></section>
      <IdentityJourney/><section className="practice-section" id="experience"><div className="section-heading"><p className="section-kicker">The work</p><h2>Complex systems.<br/>Clear thinking.</h2><p>From healthcare identity to commercial banking and the Auth0 platform itself. Built where access matters.</p></div><div className="career-list">{experience.map((e,i)=><details className="career-item" key={e.id} open={i===0}><summary><div className="career-period">{e.period}</div><div className="career-title"><h3>{e.company}</h3><p>{e.role}</p></div><Plus className="disclosure-icon" size={23}/></summary><div className="career-expanded"><div className="career-meta">{e.location}{e.contractInfo&&<span>{e.contractInfo}</span>}</div><div><p className="career-summary">{e.summary}</p><ul>{e.highlights.map(h=><li key={h}>{h}</li>)}</ul><div className="tag-list">{e.tags.map(t=><span key={t}>{t}</span>)}</div></div></div></details>)}</div></section>
      <section className="projects-section" id="projects"><div className="section-heading"><p className="section-kicker">Outside the day job</p><h2>Always building.</h2><p>Experiments in identity, security, and the systems underneath. A few things I’ve made along the way.</p></div>{featured&&<div className="featured-project"><div className="featured-art"><div className="feature-annotation">Interface study / Personal project</div><ProjectPreview kind="tenantguard"/></div><div className="featured-copy"><span className="project-category">Featured project / {featured.date}</span><h3>{featured.title}</h3><p>{featured.summary}</p><div className="tag-list">{featured.tags.map(t=><span key={t}>{t}</span>)}</div><details><summary className="project-read">Explore the project <Plus size={18}/></summary><div className="featured-description"><p>{featured.description}</p><div className="project-links">{featured.github&&<a href={featured.github} target="_blank" rel="noreferrer">Source code</a>}{featured.website&&<a href={featured.website} target="_blank" rel="noreferrer">Visit project</a>}</div></div></details></div></div>}
        <div className="archive-header"><h3>The project archive <span>({projects.length})</span></h3><div className="filter-list" aria-label="Filter projects">{categories.map(c=><button type="button" aria-pressed={filter===c} key={c} onClick={()=>{setFilter(c);setAll(true)}}>{c}</button>)}</div></div><div className="project-archive">{(all?filtered:filtered.slice(0,4)).map(p=><ProjectItem project={p} key={p.id}/>)}</div>{!all&&filtered.length>4&&<button className="archive-toggle" type="button" onClick={()=>setAll(true)}>View all {projects.length} projects <Plus size={17}/></button>}{all&&filter==="All"&&<button className="archive-toggle" type="button" onClick={()=>setAll(false)}>Show fewer projects <Minus size={17}/></button>}
      </section>
      <section className="about-section" id="about"><div className="about-portrait"><span className="portrait-note">Good to meet you.</span><div className="portrait-wrap"><img src={profile.headshotUrl||"/headshot.jpg"} alt="Swapnil Mukherjee" loading="lazy"/></div><div className="portrait-caption"><span>Engineer by profession.<br/>Human behind the permissions.</span><Mark small/></div></div><div className="about-copy"><p className="section-kicker">Behind the work</p><h2>Hi, I’m<br/>Swapnil.</h2><p>{profile.about}</p><p>My focus is practical: understand the problem, design the right boundaries, and make the system work for the people using it.</p><a className="text-link" href="/resume" target="_blank" rel="noreferrer">Read my resume <Download size={16}/></a></div></section>
      <section className="expertise-section" id="skills"><div className="section-heading compact"><p className="section-kicker">What I work with</p><h2>Deep in identity.<br/>Fluent in the details.</h2></div><div className="expertise-grid">{skills.map(g=><div key={g.category}><h3>{g.category}</h3><p>{g.items.join(", ")}</p></div>)}</div></section>
      <section className="credentials-section" id="credentials"><div className="section-heading compact"><p className="section-kicker">Learning, ongoing</p><h2>A strong foundation.</h2></div><div className="credentials-columns"><div><h3>Education</h3>{education.map(e=><div className="credential" key={e.id}><h4>{e.school}</h4><p>{e.degree}</p><span>{e.period}</span></div>)}</div><div><h3>Credentials & coursework</h3>{certifications.filter(c=>c.status!=="in-progress").map(c=><div className="certification" key={c.name}><Check size={15}/><div><h4>{c.name}</h4><p>{c.issuer}{c.issued&&` / ${c.issued}`}</p></div></div>)}{certifications.some(c=>c.status==="in-progress")&&<details className="learning-details"><summary>Currently studying <Plus size={15}/></summary>{certifications.filter(c=>c.status==="in-progress").map(c=><p key={c.name}>{c.name}<span>In progress</span></p>)}</details>}</div></div></section>
      <section className="contact-section" id="contact"><div className="contact-marquee" aria-hidden="true"><div className="contact-marquee-inner">Let’s talk. Let’s build. Let’s talk. Let’s build.</div></div><div className="contact-copy"><p className="section-kicker">Good conversations start here</p><h2>Let’s make<br/>the connection.</h2><p>Working through an identity challenge? Have an interesting idea? I’d like to hear about it.</p><a className="contact-email" href={`mailto:${profile.publicEmail}`}>{profile.publicEmail}</a><div className="contact-socials"><a href={profile.socials.linkedin} target="_blank" rel="noreferrer">LinkedIn</a><a href={profile.socials.github} target="_blank" rel="noreferrer">GitHub</a></div></div><ContactForm/></section>
    </main><footer className="site-footer"><a className="footer-name" href="#home"><Mark/>Swapnil Mukherjee</a><span>{profile.location}</span><span>© {new Date().getFullYear()}</span><a href="#home">Back to top ↑</a></footer>
  </div>;
}

