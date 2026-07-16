'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

/** Words revealed sequentially; the last one drops onto its own line. */
const LEAD_WORDS = ['Impression.', 'Impact.', 'ROI.'] as const;
const FINAL_WORD = 'Repeat.';

interface PreloaderProps {
  /** Called once the preloader has fully slid out of view. */
  onComplete?: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Block scrolling while the intro plays so the Hero can't be scrubbed early.
      document.body.style.overflow = 'hidden';

      const timeline = gsap.timeline();

      timeline
        // fromTo (not from) so the end state is explicit: the words are hidden
        // in CSS to avoid a pre-hydration flash, and GSAP drives them to visible.
        .fromTo(
          '.preloader-word',
          { xPercent: 120, autoAlpha: 0 },
          {
            xPercent: 0,
            autoAlpha: 1,
            duration: 1.5,
            ease: 'power3.out',
            stagger: 0.5,
          },
        )
        // Hold on the finished phrase for a beat before exiting.
        .to(containerRef.current, {
          yPercent: -100,
          duration: 1,
          ease: 'power4.inOut',
          delay: 0.6,
          onComplete: () => {
            document.body.style.overflow = '';
            onComplete?.();
          },
        });

      // Restore scrolling if the component unmounts mid-animation.
      return () => {
        document.body.style.overflow = '';
      };
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]"
    >
      <div className="flex flex-col items-center gap-y-1 text-center md:gap-y-2">
        <div className="flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5">
          {LEAD_WORDS.map((word) => (
            <span
              key={word}
              className="preloader-word font-tommy-bold text-5xl leading-none opacity-0 md:text-7xl lg:text-8xl"
            >
              {word}
            </span>
          ))}
        </div>
        <span className="preloader-word font-tommy-bold text-5xl leading-none opacity-0 md:text-7xl lg:text-8xl">
          {FINAL_WORD}
        </span>
      </div>
    </div>
  );
}
