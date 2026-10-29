"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppearance } from "@/components/AppearanceProvider";
import { stepIndex, type BannerSlide } from "@/lib/banners";

const INTERVAL_MS = 5000;

/**
 * Banner images that scroll by themselves (every 5 s), with arrows and dots.
 * The scrolling pauses while the pointer or the keyboard focus is on the
 * banner, and does not run at all for visitors who ask for reduced motion.
 */
export function BannerCarousel({ slides, className = "", label }: { slides: BannerSlide[]; className?: string; label: string }) {
  const { tr } = useAppearance();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const count = slides.length;

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(motion.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    motion.addEventListener("change", onChange);
    return () => motion.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (count < 2 || paused || reducedMotion) return;
    const timer = window.setInterval(() => setIndex((current) => stepIndex(current, count, 1)), INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [count, paused, reducedMotion, index]);

  if (count === 0) return null;
  const current = Math.min(index, count - 1);

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className={`group relative overflow-hidden rounded-sm bg-surface shadow-card ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <ul className="flex transition-transform duration-500 ease-out motion-reduce:transition-none" style={{ transform: `translateX(-${current * 100}%)` }}>
        {slides.map((slide, position) => {
          // eslint-disable-next-line @next/next/no-img-element
          const image = <img src={slide.image_url} alt={slide.title ?? ""} className="h-full w-full object-cover" draggable={false} />;
          const external = slide.link_url !== null && /^https?:\/\//i.test(slide.link_url);

          return (
            <li
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${position + 1} / ${count}`}
              aria-hidden={position !== current}
              className="aspect-[3/1] min-w-full"
            >
              {slide.link_url ? (
                external ? (
                  <a href={slide.link_url} target="_blank" rel="noopener noreferrer" tabIndex={position === current ? 0 : -1} className="block h-full">
                    {image}
                  </a>
                ) : (
                  <Link href={slide.link_url} tabIndex={position === current ? 0 : -1} className="block h-full">
                    {image}
                  </Link>
                )
              ) : (
                image
              )}
            </li>
          );
        })}
      </ul>

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => setIndex(stepIndex(current, count, -1))}
            aria-label={tr("Image précédente")}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/60 focus-visible:opacity-100 group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setIndex(stepIndex(current, count, 1))}
            aria-label={tr("Image suivante")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/60 focus-visible:opacity-100 group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>

          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
            {slides.map((slide, position) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setIndex(position)}
                aria-label={`${tr("Aller à l'image")} ${position + 1}`}
                aria-current={position === current}
                className={`h-2 rounded-full transition-all ${position === current ? "w-5 bg-white" : "w-2 bg-white/60 hover:bg-white/80"}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
