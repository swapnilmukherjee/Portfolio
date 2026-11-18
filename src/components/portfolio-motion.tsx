"use client";
import {useEffect} from "react";

export function PortfolioMotion(){
 useEffect(()=>{
  let disposed=false;let cleanup=()=>{};
  Promise.all([import("gsap"),import("gsap/ScrollTrigger")]).then(([{gsap},{ScrollTrigger}])=>{
   if(disposed)return;gsap.registerPlugin(ScrollTrigger);const mm=gsap.matchMedia();
   mm.add('(prefers-reduced-motion: no-preference)',()=>{
    const ctx=gsap.context(()=>{
     const entrance=gsap.timeline({defaults:{ease:'power3.out'}});
     entrance.from('.hero-copy h1 .title-line span',{yPercent:110,rotation:3,stagger:.13,duration:1.1})
      .from('.hero-copy>p,.hero-links',{y:18,opacity:0,duration:.7,stagger:.1},'-.6')
      .from('.aperture-scene',{scale:.8,rotation:12,opacity:0,duration:1.5},0);
     gsap.fromTo('.aperture-scene',{yPercent:0,rotation:0,scale:1},{yPercent:22,rotation:-22,scale:1.12,immediateRender:false,ease:'none',scrollTrigger:{trigger:'.hero-section',start:'top top',end:'bottom top',scrub:1}});
     gsap.to('.aperture-object g>ellipse',{x:i=>(i-7)*6,y:i=>(i-7)*-4,ease:'none',scrollTrigger:{trigger:'.hero-section',start:'20% top',end:'bottom top',scrub:.8}});
     gsap.to('.hero-name-track',{xPercent:-18,ease:'none',scrollTrigger:{trigger:'.hero-section',start:'top top',end:'bottom top',scrub:1}});
     gsap.fromTo('.tenant-preview',{rotateX:18,rotateY:-15,rotateZ:-7,scale:.87},{rotateX:0,rotateY:0,rotateZ:2,scale:1,ease:'none',scrollTrigger:{trigger:'.featured-art',start:'top bottom',end:'bottom center',scrub:.7}});
     gsap.utils.toArray<HTMLElement>('.section-heading h2,.about-copy h2').forEach(el=>gsap.from(el,{clipPath:'inset(0 0 100% 0)',y:25,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 90%',once:true}}));
     ScrollTrigger.batch('.archive-item',{start:'top 94%',once:true,onEnter:batch=>gsap.from(batch,{y:32,opacity:.2,stagger:.09,duration:.7,ease:'power2.out'})});
     gsap.fromTo('.portrait-wrap',{rotate:-7,y:45},{rotate:3,y:-20,ease:'none',scrollTrigger:{trigger:'.about-section',start:'top bottom',end:'bottom top',scrub:1}});
     gsap.to('.contact-marquee-inner',{xPercent:-28,ease:'none',scrollTrigger:{trigger:'.contact-section',start:'top bottom',end:'bottom top',scrub:1}});
     gsap.to('.reading-progress',{scaleX:1,ease:'none',scrollTrigger:{trigger:document.documentElement,start:'top top',end:'bottom bottom',scrub:true}});
    },document.querySelector('.portfolio-shell')!);
    const handlers:Array<()=>void>=[];
    if(window.matchMedia('(hover:hover) and (pointer:fine)').matches){
     document.querySelectorAll<HTMLElement>('.action-button,.resume-button').forEach(el=>{
      const x=gsap.quickTo(el,'x',{duration:.35,ease:'power2.out'}),y=gsap.quickTo(el,'y',{duration:.35,ease:'power2.out'});
      const move=(e:PointerEvent)=>{const r=el.getBoundingClientRect();x((e.clientX-r.left-r.width/2)*.16);y((e.clientY-r.top-r.height/2)*.2)};
      const leave=()=>{x(0);y(0)};el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave);handlers.push(()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',leave)});
     });
    }
    const visibility=()=>{ScrollTrigger.getAll().forEach(t=>{if(document.hidden)t.getTween()?.pause();else t.getTween()?.resume()})};document.addEventListener('visibilitychange',visibility);
    return()=>{handlers.forEach(fn=>fn());document.removeEventListener('visibilitychange',visibility);ctx.revert()};
   });cleanup=()=>mm.revert();
   document.fonts.ready.then(()=>{if(!disposed)ScrollTrigger.refresh()});
   const loaded=()=>ScrollTrigger.refresh();window.addEventListener('load',loaded,{once:true});
   const oldCleanup=cleanup;cleanup=()=>{window.removeEventListener('load',loaded);oldCleanup()};
  }).catch(()=>{});
  return()=>{disposed=true;cleanup()};
 },[]);return <div className="reading-progress" aria-hidden="true"/>;
}
