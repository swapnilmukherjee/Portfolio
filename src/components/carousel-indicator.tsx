"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useSnapCarousel(itemCount: number, resetKey: string) {
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const [state, setState] = useState({ activeIndex: 0, progress: 0 });

  const updateIndex = useCallback(() => {
    const scroller = ref.current;
    if (!scroller) return;

    const items = Array.from(scroller.querySelectorAll<HTMLElement>("[data-carousel-item='true']"));
    if (!items.length) return;

    const maxScroll = Math.max(scroller.scrollWidth - scroller.clientWidth, 0);
    const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scroller.scrollLeft / maxScroll)) : 0;
    const viewportCenter = scroller.scrollLeft + scroller.clientWidth / 2;
    let nextIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    items.forEach((item, index) => {
      const itemCenter = item.offsetLeft + item.offsetWidth / 2;
      const distance = Math.abs(itemCenter - viewportCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nextIndex = index;
      }
    });

    setState((current) => {
      if (current.activeIndex === nextIndex && Math.abs(current.progress - progress) < 0.002) return current;
      return { activeIndex: nextIndex, progress };
    });
  }, []);

  const onScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = 0;
      updateIndex();
    });
  }, [updateIndex]);

  const scrollToIndex = useCallback((index: number) => {
    const item = ref.current?.querySelectorAll<HTMLElement>("[data-carousel-item='true']")[index];
    item?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    setState({
      activeIndex: index,
      progress: itemCount > 1 ? index / (itemCount - 1) : 0,
    });
  }, [itemCount]);

  useEffect(() => {
    setState({ activeIndex: 0, progress: 0 });
    ref.current?.scrollTo({ left: 0 });
    const frame = window.requestAnimationFrame(updateIndex);
    return () => window.cancelAnimationFrame(frame);
  }, [resetKey, updateIndex]);

  useEffect(() => {
    const scroller = ref.current;
    updateIndex();
    scroller?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const observer = scroller ? new ResizeObserver(onScroll) : null;
    if (scroller && observer) {
      observer.observe(scroller);
      Array.from(scroller.children).forEach((child) => observer.observe(child));
    }

    return () => {
      scroller?.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer?.disconnect();
    };
  }, [onScroll, updateIndex]);

  useEffect(() => {
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    activeIndex: Math.min(state.activeIndex, Math.max(itemCount - 1, 0)),
    onScroll,
    progress: state.progress,
    ref,
    scrollToIndex,
  };
}

export function CarouselIndicator({
  count,
  activeIndex,
  progress,
  onSelect,
}: {
  count: number;
  activeIndex: number;
  progress: number;
  onSelect: (index: number) => void;
}) {
  if (count <= 1) return null;

  return (
    <div className="mt-2 flex flex-col items-center gap-2 lg:hidden" aria-label="Carousel position" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] text-text/35">{String(activeIndex + 1).padStart(2, "0")}</span>
        <div className="relative h-1.5 w-36 overflow-hidden rounded-full bg-text/10" aria-hidden="true">
          <span
            className="absolute inset-y-0 rounded-full bg-text/50 transition-[left] duration-100 ease-out"
            style={{
              left: `${progress * (100 - 100 / count)}%`,
              width: `${100 / count}%`,
            }}
          />
        </div>
        <span className="font-mono text-[10px] text-text/25">{String(count).padStart(2, "0")}</span>
      </div>
      <div className="flex justify-center gap-1.5">
        {Array.from({ length: count }, (_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeIndex === index ? "w-5 bg-text/35" : "w-2 bg-text/12 hover:bg-text/25"
            }`}
            aria-label={`Go to card ${index + 1}`}
            aria-current={activeIndex === index ? "true" : undefined}
          />
        ))}
      </div>
    </div>
  );
}
