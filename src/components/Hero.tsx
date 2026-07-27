'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Header from '@/components/Header';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const FRAME_COUNT = 130;

const getFrameSrc = (index: number): string => {
  const frameNumber = (index + 1).toString().padStart(3, '0');
  return `/assets/images/hero_8/frame_${frameNumber}.jpg`;
};

interface HeroProps {
  isReady: boolean;
}

export default function Hero({ isReady }: HeroProps) {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const divRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLSpanElement>(null);
  const hapRef = useRef<HTMLSpanElement>(null);
  const pensRef = useRef<HTMLSpanElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaButtonsRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const headingWrapRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [hasScrolledPast, setHasScrolledPast] = useState(false);

  // 1. CANVAS PRELOADING & SCROLL SCRUBBING
  useGSAP(
    () => {
      gsap.set(headerRef.current, { yPercent: -270 });
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      if (!canvas || !context) return;

      const drawCover = (image: HTMLImageElement, index: number): void => {
        let height = image.naturalHeight;
        let width = image.naturalWidth;
        if (index < 50) {
          const scale = (height - 100) / height;
          height = height - (height * scale);
          width = width - (width * scale);
        }
        const cw = canvas.width;
        const ch = canvas.height;
        const imageRatio = width / height;
        const canvasRatio = cw / ch;

        let dw: number, dh: number, dx: number, dy: number;
        if (imageRatio > canvasRatio) {
          dh = ch;
          dw = ch * imageRatio;
          dx = (cw - dw) / 2;
          dy = 0;
        } else {
          dw = cw;
          dh = cw / imageRatio;
          dx = 0;
          dy = (ch - dh) / 2;
        }

        context.clearRect(0, 0, cw, ch);
        context.drawImage(image, dx, dy, dw, dh);
      };

      const renderFrame = (index: number): void => {
        const image = imagesRef.current[index];
        if (image && image.complete && image.naturalWidth > 0) {
          drawCover(image, index);
        }
      };

      const resizeCanvas = (): void => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(window.innerWidth * dpr);
        canvas.height = Math.round(window.innerHeight * dpr);
        renderFrame(currentFrameRef.current);
      };

      // Preload image sequence
      const images: HTMLImageElement[] = [];
      for (let i = 0; i < FRAME_COUNT; i += 1) {
        const image = new Image();
        image.src = getFrameSrc(i);
        if (i === 0) {
          image.onload = () => renderFrame(0);
        }
        images.push(image);
      }
      imagesRef.current = images;

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      // CTA (headline + buttons) starts hidden and pushed down; revealed in Phase 3.
      const ctaLines = ctaRef.current
        ? Array.from(ctaRef.current.querySelectorAll('h2, p'))
        : [];
      // gsap.set(ctaLines, { yPercent: 120, autoAlpha: 0 });
      gsap.set(ctaButtonsRef.current, { y: 40, autoAlpha: 0 });
      gsap.set(scrimRef.current, { autoAlpha: 0 });
      // gsap.set('.second-home-section', { yPercent: 0 });
      // gsap.set('.')
      // Header starts tucked above the viewport; it drops in during Phase 4, after the CTA.
      // Driven by a ref (not a '.header' string selector) so a Header re-render can't
      // leave it stuck at this initial value.

      // One scrubbed timeline drives the whole first-section sequence.
      const frameState = { frame: 0 };
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          // Animation spans 300vh of scroll and then finishes; the section is 500vh,
          // so the sticky stays pinned for another 100vh — a "hold" on the finished
          // Hero during which the next section rises up over it.
          end: () => '+=' + window.innerHeight * 3,
          onLeave: () => setHasScrolledPast(true),        // Scrolling DOWN past section
          onEnter: () => setHasScrolledPast(false),
          onEnterBack: () => setHasScrolledPast(false),
          scrub: 0.5,
        },
      });

      // ── PHASE 1 (first stretch of scroll) ──────────────────────────────
      // The blurred woman fades in as soon as scrolling starts...
      tl.to(
        canvasRef.current,
        {
          autoAlpha: 1,
          ease: 'none',
          duration: 0.25,
        },
        0
      );

      // ...then scales up to full size and loses its blur.
      tl.to(
        canvasRef.current,
        {
          scale: 1,
          filter: 'blur(0px)',
          ease: 'none',
          duration: 1,
        },
        0
      );

      // Subheading slides out to the left, in step with the reveal.
      tl.to(
        subRef.current,
        {
          xPercent: -260,
          autoAlpha: 0,
          ease: 'none',
          duration: 1,
        },
        0
      );

      // Main heading splits from the center: HAPP exits left, ENS. exits right.
      tl.to(
        hapRef.current,
        {
          xPercent: -220,
          ease: 'none',
          duration: 1,
        },
        0
      ).to(
        pensRef.current,
        {
          xPercent: 220,
          ease: 'none',
          duration: 1,
        },
        0
      );

      // ── PHASE 2 (remaining scroll) ─────────────────────────────────────
      // Only after the reveal/split is the full 208-frame sequence scrubbed.
      tl.to(
        frameState,
        {
          frame: FRAME_COUNT - 1,
          ease: 'none',
          duration: 2.5,
          onUpdate: () => {
            const frame = Math.round(frameState.frame);
            if (frame !== currentFrameRef.current) {
              currentFrameRef.current = frame;
              renderFrame(frame);
            }
          },
        },
        1
      );

      // ── PHASE 3 (after the canvas animation completes) ─────────────────
      // The bottom scrim fades in first to ground the text against the photo...
      tl.to(
        scrimRef.current,
        {
          autoAlpha: 1,
          ease: 'power1.out',
          duration: 0.8,
        },
        '>'
      );

      // ── PHASE 4 (final) ────────────────────────────────────────────────
      // The header drops in from the top once the CTA is fully revealed.
      // fromTo owns both endpoints so it always seats at yPercent: 100.
      tl.fromTo(
        headerRef.current,
        {
          yPercent: -270
        },
        {
          yPercent: 0,
          ease: 'power3.out',
          duration: 0.6,
        },
        '>-0.1'
      );

      // ...then the CTA lines ride up from behind their masks and reveal.
      tl.to(
        ctaLines,
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: 'power2.out',
          duration: 2,
          stagger: 0.25,
        },
        '<+0.15'
      );



      // ...then the buttons show up.
      tl.to(
        ctaButtonsRef.current,
        {
          y: 0,
          autoAlpha: 1,
          ease: 'power2.out',
          duration: 0.5,
        }
      );



      // ── PHASE 5 — two-stage hand-off ───────────────────────────────────
      // Stage A (300vh → 400vh): the content lifts up on its own, first.
      // gsap.fromTo(
      //   contentRef.current,
      //   { yPercent: 0 },
      //   {
      //     yPercent: -100,
      //     ease: 'none',
      //     scrollTrigger: {
      //       trigger: containerRef.current,
      //       start: () => 'top+=' + window.innerHeight * 3 + ' top',
      //       end: () => 'top+=' + window.innerHeight * 4 + ' top',
      //       scrub: true,
      //     },
      //   }
      // );

      // Stage B (400vh → 500vh): the rest of the section (photo panel + header)
      // slides up, exactly while the bottom section rises to take its place.
      // At a 600vh Hero the next section's -mt-[100vh] overlap enters at 400vh,
      // so this panel move and that rise run 1:1 as one synchronized push.
      // const tl2 = gsap.timeline({
      //   scrollTrigger: {
      //     trigger: containerRef.current,
      //     start: () => 'bottom bottom',
      //     scrub: 1,
      //   }
      // });

      // tl
      //   // 1. Move the current section UP and out (-100%)
      //   .to(containerRef.current, {
      //     yPercent: -100,
      //     ease: 'none',
      //   })
      //   // 2. Move the incoming section UP from bottom (100% -> 0%) at the exact same time
      //   .fromTo(
      //     '.second-home-section',
      //     { yPercent: 0 },
      //     { yPercent: -100, ease: 'none' },

      //     '<' // The '0' position parameter forces this to run concurrently with the first animation
      //   );
      return () => window.removeEventListener('resize', resizeCanvas);
    },
    { scope: containerRef }
  );

  useEffect(() => {
    if (isReady) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });

      // Reveal the cream text section...
      tl.to(divRef.current, {
        opacity: 1,
        duration: 1,
        ease: 'power2.out'
      })
        // ...the logo dissolves in place (no growth): a soft upward drift + blur + fade,
        // so it hands off to the heading rather than zooming away.
        // .to('.hero-logo', {
        //   autoAlpha: 0,
        //   yPercent: -10,
        //   filter: 'blur(8px)',
        //   duration: 0.9
        // }, '<')
        // The heading rises up into the space the logo just vacated — the two blend.
        .from(headingWrapRef.current, {
          yPercent: 12,
          autoAlpha: 0,
          duration: 0.9,
          ease: 'power3.out'
        }, '<0.15')
    }
  }, [isReady])

  return (
    <>
      <div ref={headerRef} className='fixed z-[100] w-full left-0 py-[2%] px-[3%] top-0'>
        <Header scrolledHero={hasScrolledPast} />
      </div>
      <section ref={containerRef} className="relative h-[550vh] w-[100vw] z-70">
        <div className="sticky top-0 h-screen w-full overflow-hidden">

          <div ref={divRef} className='first-section absolute inset-0 bg-[#EEE8D9] dark:bg-[#0A0A0A] transition-colors duration-300 opacity-0 flex flex-col justify-between items-center px-25 py-[72px] overflow-hidden'>
            {/* Canvas frame sequence — sits above the cream bg, behind the text.
              Hidden at first (only text shows); fades in blurred & scaled down as scroll begins. */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full z-0"
              style={{
                opacity: 0,
                visibility: 'hidden',
                transform: 'scale(0.85)',
                filter: 'blur(20px)'
              }}
            />
            {/* Full-screen backdrop blur overlay — covers whole screen & reveals with CTA text */}
            <div
              ref={scrimRef}
              className="absolute inset-0 z-[5] pointer-events-none backdrop-blur-xl bg-black/40 transition-all"
              style={{
                opacity: 0,
              }}
            />
            <div ref={contentRef} className='w-full h-full flex flex-col justify-center items-center relative z-10'>
              <div ref={headingWrapRef} className='flex flex-col justify-center items-center gap-[5px]'>
                <span ref={subRef} className='text-center text-[#1A1917] dark:text-[#F5F5F5] font-tommy-bold text-[66px] capitalize transition-colors duration-300'>We’re where life</span>
                <h1 className='text-white font-tommy-bold text-[344px] leading-[300px] flex flex-nowrap'>
                  <span ref={hapRef} className='inline-block'>HAPP</span>
                  <span ref={pensRef} className='inline-block'>ENS<span className='text-[#FCD119]'>.</span></span>
                </h1>
              </div>

              {/* Absolute overlay pinned near the bottom so it never affects the heading's layout/centering. */}
              <div ref={ctaRef} className='absolute inset-0 flex flex-col gap-[25px] text-center items-center justify-center w-full h-full'>
                <div className='flex flex-col gap-[10px] items-center text-center'>
                  <h2 className='text-white font-tommy-bold text-[65px] leading-[100%] capitalize' style={{
                    clipPath: "inset(0% 100% 0% 0%)",
                  }}>Out-of-home that works like <span className='text-[#FCD119]'>online</span> </h2>
                  <p className='text-white font-tommy-bold text-[65px] leading-[100%] capitalize' style={{
                    clipPath: "inset(0% 100% 0% 0%)",
                  }}> measure your reach, </p>
                </div>

                <div ref={ctaButtonsRef} className='w-full flex gap-[42px] justify-center items-center'>
                  <a className='bg-white text-[24px] leading-[25px] font-tommy-regular text-[#1A1917] rounded-[6px] px-[30px] py-[20px] cursor-pointer'>
                    Start a Campaign
                  </a>
                  <a className='bg-black text-[24px] leading-[25px] font-tommy-regular text-[#FCD119] rounded-[6px] px-[30px] py-[20px] cursor-pointer'>
                    Start a Campaign
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}