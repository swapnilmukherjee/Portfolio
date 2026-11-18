"use client";

import {useEffect,useRef,useState} from "react";
import {Check, Fingerprint, Workflow, Bot, Play, RotateCcw, ArrowUpRight} from "lucide-react";

const chapters=[
 {title:"People.",heading:"A good login should feel effortless.",description:"Behind that simple moment: federation, passkeys, MFA, and the policies that keep the wrong people out.",label:"Human identity",tags:["Passkeys","SSO","MFA"],Icon:Fingerprint},
 {title:"Applications.",heading:"Connected doesn’t mean unrestricted.",description:"An application should get the access it needs, in the right context. That’s where scopes, claims, and authorization come in.",label:"Application identity",tags:["OAuth 2.0","OIDC","API authorization"],Icon:Workflow},
 {title:"AI agents.",heading:"Autonomy needs boundaries.",description:"Agents act on behalf of people. Delegated access, clear consent, and carefully scoped permissions keep that relationship deliberate.",label:"Agent identity",tags:["Delegation","Consent","Scoped access"],Icon:Bot},
];

export function IdentityJourney(){
 const root=useRef<HTMLElement>(null);const[active,setActive]=useState(0);const[phase,setPhase]=useState<"idle"|"checking"|"granted">("idle");const timer=useRef<ReturnType<typeof setTimeout>>();
 useEffect(()=>{let disposed=false;let cleanup=()=>{};
  Promise.all([import("gsap"),import("gsap/ScrollTrigger")]).then(([{gsap},{ScrollTrigger}])=>{
   if(disposed)return;gsap.registerPlugin(ScrollTrigger);const mm=gsap.matchMedia();
   mm.add("(min-width: 1000px) and (prefers-reduced-motion: no-preference)",()=>{
    const ctx=gsap.context(()=>{
     gsap.timeline({scrollTrigger:{trigger:root.current,start:"top 82px",end:"+=1050",pin:true,scrub:.6,invalidateOnRefresh:true,onUpdate:self=>setActive(Math.min(2,Math.floor(self.progress*3)))}})
      .to('.journey-geometry',{rotation:180,ease:'none',duration:1})
      .to('.orbit-ring.ring-a',{rotationY:70,rotationX:45,ease:'none',duration:1},0)
      .to('.orbit-ring.ring-b',{rotationY:-55,rotationX:100,ease:'none',duration:1},0);
    },root);return()=>ctx.revert();
   });cleanup=()=>mm.revert();document.fonts.ready.then(()=>{if(!disposed)ScrollTrigger.refresh()});
  });return()=>{disposed=true;cleanup();clearTimeout(timer.current)};
 },[]);
 const chapter=chapters[active];const Icon=chapter.Icon;
 function run(){clearTimeout(timer.current);if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setPhase('granted');return}setPhase('checking');timer.current=setTimeout(()=>setPhase('granted'),950)}
 return <section className="identity-story" ref={root} id="identity"><div className="story-topline"><span>A little trust goes a long way.</span><span>Explore the identity layer</span></div><div className="story-grid"><div className="story-titles"><p>Different identities.<br/>Deliberate boundaries.</p>{chapters.map((c,i)=><button type="button" key={c.title} onClick={()=>setActive(i)} aria-pressed={active===i} className={active===i?'chapter-button selected':'chapter-button'}><span>{c.title}</span><span className="chapter-indicator" aria-hidden="true"><ArrowUpRight size={30}/></span></button>)}<div className="chapter-meter" aria-hidden="true"><span style={{transform:`translateX(${active*100}%)`}}/></div></div><div className={`journey-visual chapter-${active}`}><div className="journey-geometry" aria-hidden="true"><div className="orbit-ring ring-a"/><div className="orbit-ring ring-b"/><div className="orbit-ring ring-c"/><span className="orbit-satellite satellite-a"/><span className="orbit-satellite satellite-b"/></div><div className="journey-core"><Icon size={48} strokeWidth={1.2}/></div><span className="orbit-label">{chapter.label}</span></div><div className="chapter-copy" aria-live="polite"><h2>{chapter.heading}</h2><p>{chapter.description}</p><div className="story-tags">{chapter.tags.map(t=><span key={t}>{t}</span>)}</div></div></div><div className={`access-playground ${phase}`}><div><span className="demo-label">A local interaction demo</span><p>{phase==='granted'?'The right identity. The right permission.':phase==='checking'?'Checking identity and permission…':'What happens behind an access check?'}</p></div><div className="demo-path" aria-hidden="true"><span className="demo-node"><Fingerprint size={19}/></span><span className="demo-connection"><i/></span><span className="demo-node"><Workflow size={19}/></span><span className="demo-connection second"><i/></span><span className="demo-node"><Check size={19}/></span></div><button type="button" onClick={run} disabled={phase==='checking'}>{phase==='granted'?<>Run it again <RotateCcw size={15}/></>:<>Try an access check <Play size={15}/></>}</button><span className="demo-status" role="status">{phase==='granted'?'Access granted. This is a local demonstration.':''}</span></div></section>;
}
