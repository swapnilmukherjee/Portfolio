"use client";
import {useEffect} from "react";

export function PortfolioMotion(){
 useEffect(()=>{
  let disposed=false;let cleanup=()=>{};
  Promise.all([import('gsap'),import('gsap/ScrollTrigger')]).then(([{gsap},{ScrollTrigger}])=>{
   if(disposed)return;
   gsap.registerPlugin(ScrollTrigger);
   const mm=gsap.matchMedia();
   mm.add({allowMotion:'(prefers-reduced-motion: no-preference)',desktop:'(min-width: 761px)',compact:'(max-width: 760px)'},context=>{
    if(!context.conditions?.allowMotion)return;
    const desktop=!!context.conditions.desktop;
    const ctx=gsap.context(()=>{
     gsap.from('.hero-word h1>span',{y:desktop?30:12,opacity:.65,duration:desktop?.9:.45,stagger:.08,ease:'power3.out'});
     if(desktop){
      gsap.from('.hero-photo',{y:20,opacity:.8,duration:.8,ease:'power3.out'});
      gsap.to('.hero-photo',{yPercent:-3,ease:'none',scrollTrigger:{trigger:'.fresh-hero',start:'top top',end:'bottom top',scrub:1}});
     }
     const scene={trigger:'.connection-section',start:'top 85%',end:'bottom 30%',scrub:desktop?1:.4};
     gsap.to('.frame-one',{x:desktop?-15:-3,y:desktop?12:4,rotate:desktop?-9:-3,ease:'none',scrollTrigger:scene});
     gsap.to('.frame-two',{y:desktop?-16:-5,rotate:desktop?3:0,ease:'none',scrollTrigger:scene});
     gsap.to('.frame-three',{x:desktop?15:3,y:desktop?12:4,rotate:desktop?9:3,ease:'none',scrollTrigger:scene});
     gsap.from('.connection-track path',{strokeDashoffset:160,ease:'none',scrollTrigger:{trigger:'.connection-section',start:'top 85%',end:'bottom 65%',scrub:.5}});
     gsap.utils.toArray<HTMLElement>('.job').forEach((el,i)=>{
      gsap.from(el,{y:desktop?30:12,duration:desktop?.7:.4,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 94%',once:true}});
      if(desktop){
       gsap.from(el.querySelectorAll('h3,.job-role'),{clipPath:'inset(0 0 100% 0)',duration:.7,stagger:.1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}});
       ScrollTrigger.create({trigger:el,start:'top 48%',end:'bottom 48%',onToggle:self=>document.querySelectorAll('.career-index a')[i]?.classList.toggle('is-current',self.isActive)});
      }
     });
     gsap.utils.toArray<HTMLElement>('.credential-record').forEach(el=>gsap.from(el,{...(desktop?{x:15,clipPath:'inset(0 0 0 10%)'}:{y:10}),duration:desktop?.6:.35,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 95%',once:true}}));
     if(desktop)gsap.fromTo('.contact-line>span',{xPercent:8},{xPercent:-18,ease:'none',scrollTrigger:{trigger:'.contact-section-new',start:'top bottom',end:'bottom top',scrub:1}});
     gsap.to('.reading-progress',{scaleX:1,ease:'none',scrollTrigger:{trigger:document.documentElement,start:'top top',end:'bottom bottom',scrub:true}});
    },document.querySelector('.fresh-folio')!);
    return()=>ctx.revert();
   });
   const refresh=()=>ScrollTrigger.refresh();
   document.fonts.ready.then(()=>{if(!disposed)refresh()});
   const observer=new ResizeObserver(refresh);
   document.querySelectorAll('.project-gallery,.experience-list').forEach(el=>observer.observe(el));
   const img=document.querySelector<HTMLImageElement>('.hero-photo img');
   img?.addEventListener('load',refresh);
   cleanup=()=>{observer.disconnect();img?.removeEventListener('load',refresh);mm.revert()};
  }).catch(()=>{});
  return()=>{disposed=true;cleanup()};
 },[]);
 return <div className="reading-progress" aria-hidden="true"/>;
}
