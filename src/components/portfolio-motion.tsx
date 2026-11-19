"use client";
import {useEffect} from "react";
export function PortfolioMotion({revision=""}:{revision?:string}){
 useEffect(()=>{let disposed=false;let cleanup=()=>{};
 Promise.all([import('gsap'),import('gsap/ScrollTrigger')]).then(([{gsap},{ScrollTrigger}])=>{
 if(disposed)return;gsap.registerPlugin(ScrollTrigger);const mm=gsap.matchMedia();
 mm.add('(prefers-reduced-motion: no-preference)',()=>{const ctx=gsap.context(()=>{
 if(!revision || revision==='Selected'){
 gsap.from('.hero-word h1>span',{y:30,opacity:.3,duration:.9,stagger:.12,ease:'power3.out'});
 gsap.from('.hero-photo',{y:25,opacity:.5,duration:1.1,ease:'power3.out'});
 }
 gsap.to('.frame-one',{x:-15,y:12,rotate:-9,ease:'none',scrollTrigger:{trigger:'.connection-section',start:'top 85%',end:'bottom 30%',scrub:1}});
 gsap.to('.frame-two',{y:-16,rotate:3,ease:'none',scrollTrigger:{trigger:'.connection-section',start:'top 85%',end:'bottom 30%',scrub:1}});
 gsap.to('.frame-three',{x:15,y:12,rotate:9,ease:'none',scrollTrigger:{trigger:'.connection-section',start:'top 85%',end:'bottom 30%',scrub:1}});
 gsap.to('.hero-photo',{yPercent:-6,ease:'none',scrollTrigger:{trigger:'.fresh-hero',start:'top top',end:'bottom top',scrub:1}});
 gsap.from('.connection-track path',{strokeDashoffset:160,ease:'none',scrollTrigger:{trigger:'.connection-section',start:'top 75%',end:'bottom 60%',scrub:.7}});
 gsap.utils.toArray<HTMLElement>('.job').forEach((el,i)=>{
 gsap.from(el,{y:35,duration:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 87%',once:true}});
 gsap.from(el.querySelectorAll('.job h3,.job-role'),{clipPath:'inset(0 0 100% 0)',duration:.8,stagger:.1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 82%',once:true}});
 ScrollTrigger.create({trigger:el,start:'top 48%',end:'bottom 48%',onToggle:self=>document.querySelectorAll('.career-index a')[i]?.classList.toggle('is-current',self.isActive)});
 });
 gsap.utils.toArray<HTMLElement>('.credential-record').forEach(el=>gsap.from(el,{x:20,clipPath:'inset(0 0 0 12%)',duration:.7,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 92%',once:true}}));
 gsap.fromTo('.contact-line>span',{xPercent:8},{xPercent:-18,ease:'none',scrollTrigger:{trigger:'.contact-section-new',start:'top bottom',end:'bottom top',scrub:1}});
 gsap.to('.reading-progress',{scaleX:1,ease:'none',scrollTrigger:{trigger:document.documentElement,start:'top top',end:'bottom bottom',scrub:true}});
 },document.querySelector('.fresh-folio')!);return()=>ctx.revert()});
 const refresh=()=>ScrollTrigger.refresh();document.fonts.ready.then(()=>{if(!disposed)refresh()});
 const observer=new ResizeObserver(refresh);document.querySelectorAll('.project-gallery,.experience-list').forEach(el=>observer.observe(el));
 cleanup=()=>{observer.disconnect();mm.revert()};
 }).catch(()=>{});return()=>{disposed=true;cleanup()};},[revision]);return <div className="reading-progress" aria-hidden="true"/>;
}
