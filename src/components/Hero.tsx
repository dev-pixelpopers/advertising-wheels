'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import Header from '@/components/Header';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const FRAME_COUNT = 160;

const getFrameSrc = (index: number): string => {
  const frameNumber = (FRAME_COUNT - index).toString().padStart(3, '0');
  return `/assets/images/hero_11/Frame_${frameNumber}.png`;
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
  const scrollArrowRef = useRef<HTMLDivElement>(null);

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

      /* ── CTA headline: typed out, one character at a time ──────────────
         The lines are split into characters and hidden. They then type in at
         a fixed 50ms per character — deliberately REAL TIME rather than tied
         to the scrubbed master timeline, so the cadence reads as typing
         instead of speeding up or reversing with the scroll wheel. The
         trigger below starts it at the point in the scroll where the CTA
         phase begins. */
      /* The headline is three tiers; each is tagged with the tier it belongs to
         so the typing can pause between them. Tier 2 is two elements because
         the accent word carries its own styling. */
      const ctaParts = ctaRef.current
        ? (Array.from(ctaRef.current.querySelectorAll('[data-cta-part]')) as HTMLElement[])
        : [];
      const caretOf = (n: string) =>
        ctaRef.current?.querySelector<HTMLElement>(`[data-caret="${n}"]`) ?? null;

      const splits = ctaParts.map((el) => new SplitText(el, { type: 'chars' }));
      const tier = (n: string) =>
        ctaParts.flatMap((el, i) => (el.getAttribute('data-cta-line') === n ? splits[i].chars : []));
      const [t1, t2, t3] = ['1', '2', '3'].map(tier);
      const ctaChars = [...t1, ...t2, ...t3];
      const carets = ['1', '2', '3'].map(caretOf);

      /* Hide the characters themselves, then un-arm the wrapper. The wrapper
         carries `cta-pre` so nothing is painted before hydration; hiding the
         PARENTS instead would mean revealing a child character does nothing,
         because the parent's own opacity still wins. */
      gsap.set(ctaChars, { autoAlpha: 0 });
      gsap.set(carets, { autoAlpha: 0 });
      ctaRef.current?.querySelector('[data-cta-stack]')?.classList.remove('cta-pre');

      /* Typing effect has been moved to Phase 4 on the scrubbed timeline below */

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
          // Animation spans 400vh of scroll and then finishes; the section is 500vh,
          // so the sticky stays pinned for another 100vh — a "hold" on the finished
          // Hero during which the next section rises up over it.
          end: () => '+=' + window.innerHeight * 4,
          onLeave: () => setHasScrolledPast(true),        // Scrolling DOWN past section
          onEnter: () => setHasScrolledPast(false),
          onEnterBack: () => setHasScrolledPast(false),
          scrub: 0.5,
        },
      });

      // ── PHASE 1 (first stretch of scroll) ──────────────────────────────
      // The scroll arrow fades out immediately when scrolling starts.
      tl.to(
        scrollArrowRef.current,
        {
          autoAlpha: 0,
          ease: 'power1.out',
          duration: 0.15,
        },
        0
      );

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
          onStart: () => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('heroHeaderShow', { detail: true }));
            }
          },
          onReverseComplete: () => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('heroHeaderShow', { detail: false }));
            }
          },
        },
        '>'
      );

      // ── PHASE 4 (CTA text typing) ──────────────────────────────────────
      // The text types in, scrubbed by the scroll position.
      const CHAR = 0.02; // Stagger per character (scrubbed)
      
      tl.set(carets[0], { autoAlpha: 1 })
        .to(t1, { autoAlpha: 1, duration: 0.1, ease: 'none', stagger: CHAR })
        .set(carets[0], { autoAlpha: 0 })
        
        .set(carets[1], { autoAlpha: 1 })
        .to(t2, { autoAlpha: 1, duration: 0.1, ease: 'none', stagger: CHAR })
        .set(carets[1], { autoAlpha: 0 })
        
        .set(carets[2], { autoAlpha: 1 })
        .to(t3, { autoAlpha: 1, duration: 0.1, ease: 'none', stagger: CHAR })
        .set(carets[2], { autoAlpha: 0 });

      // The header drops in from the top once the CTA is fully revealed.
      tl.fromTo(
        headerRef.current,
        {
          yPercent: -270
        },
        {
          yPercent: 0,
          ease: 'power3.out',
          duration: 0.6,
        }
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

      // ── PHASE 5 (Scale up Tier 3) ──────────────────────────────────────
      const tier1El = ctaRef.current?.querySelector('[data-tier="1"]');
      const tier2El = ctaRef.current?.querySelector('[data-tier="2"]');
      const tier3El = ctaRef.current?.querySelector('[data-tier="3"]');
      
      if (tier3El) {
        tl.addLabel('scaleUp', '+=0.5'); // wait a bit before scaling
        
        // Fade out other elements
        tl.to([tier1El, tier2El, ctaButtonsRef.current], {
          autoAlpha: 0,
          duration: 0.5,
          ease: 'power1.inOut'
        }, 'scaleUp');
        
        // Scale up Tier 3 massively without fading it out
        tl.to(tier3El, {
          scale: 80,
          duration: 2.5,
          ease: 'power2.in',
          transformOrigin: '50% 50%'
        }, 'scaleUp');
      }



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
      return () => {
        window.removeEventListener('resize', resizeCanvas);
        // Put the original markup back on unmount / HMR, or the split spans
        // accumulate every time this effect re-runs.
        splits.forEach((s) => s.revert());
      };
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
      {/* The typed headline must not paint before GSAP has hidden its characters,
          or the whole block flashes at full size on load. `cta-pre` keeps it
          hidden in the server HTML; GSAP removes the class the moment the
          characters are safely hidden. visibility (not display) so the layout
          is already measured and nothing shifts when it is un-armed. */}
      <style>{`
        .cta-pre [data-cta-part],
        .cta-pre [data-caret] { visibility: hidden; }
      `}</style>

      {/* The bar spans the full viewport at z-100, so it must not capture clicks in
          its empty middle — the controls inside re-enable pointer events themselves. */}
      {/* <div ref={headerRef} className='fixed z-[100] w-full left-0 py-[2%] px-[3%] top-0 pointer-events-none'>
        <Header scrolledHero={hasScrolledPast} />
      </div> */}
      <section ref={containerRef} className="relative h-[550vh] w-[100vw] z-70">
        <div className="sticky top-0 h-screen w-full overflow-hidden">

          <div ref={divRef} className='first-section absolute inset-0 bg-[#EEE8D9] dark:bg-[#0A0A0A] transition-colors duration-300 opacity-0 flex flex-col justify-between items-center px-4 md:px-8 lg:px-12 2xl:px-20 3xl:px-25 py-[72px] overflow-hidden'>
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
              <div ref={headingWrapRef} className='flex flex-col justify-center items-center gap-[3px] md:gap-[5px]'>
                <span ref={subRef} className='text-center text-[#1A1917] dark:text-[#F5F5F5] font-tommy-bold text-[25px] md:text-[clamp(2.5rem,5vw,4.125rem)] capitalize transition-colors duration-300'>We’re where life</span>
                <h1 className='text-white font-tommy-bold text-[60px] md:text-[clamp(80px,16.9vw,21.5rem)] leading-[87.21%] flex flex-nowrap'>
                  <span ref={hapRef} className='inline-block'>HAPP</span>
                  <span ref={pensRef} className='inline-block'>ENS<span className='text-[#FCD119]'>.</span></span>
                </h1>
              </div>

              {/* Absolute overlay pinned near the bottom so it never affects the heading's layout/centering. */}
              <div ref={ctaRef} className='absolute inset-0 flex flex-col gap-[20px] lg:gap-[25px] text-center items-center justify-center w-full h-full'>
                {/* Three tiers, each a step down in scale — the subject lands first
                    and biggest, the claim answers it, and the method sits underneath
                    as fine print. Sizes step roughly 1 : 0.66 : 0.21 so the block
                    reads as one shape rather than three separate lines. Each tier
                    types in at 50ms per character with a beat between them, and the
                    caret walks down the tiers as they fill. */}
                <div data-cta-stack className='cta-pre flex flex-col items-center text-center text-white'>
                  {/* TIER 1 — the subject */}
                  <h2
                    data-tier='1'
                    data-cta-part
                    data-cta-line='1'
                    className='font-tommy-bold uppercase leading-[100%] tracking-[-0.01em] text-[35px] md:text-[clamp(2rem,5vw,5.5rem)]'
                  >
                    Unskippable on the <span className="text-[#FCD119]">street.</span>
                    <span
                      data-caret='1'
                      aria-hidden='true'
                      className='ml-[0.06em] inline-block h-[0.72em] w-[0.045em] translate-y-[0.02em] bg-[#FCD119] align-middle'
                    />
                  </h2>

                  {/* TIER 2 — the claim */}
                  <p data-tier='2' className='mt-[0.18em] font-tommy-medium capitalize leading-[1.15] text-[clamp(1.35rem,4.6vw,3.6rem)]'>
                    <span data-cta-part data-cta-line='2'>Measurable like a screen </span>
                    {/* <span data-cta-part data-cta-line='2' className='font-tommy-bold italic text-[#FCD119]'>
                    </span>
                    <span
                      data-caret='2'
                      aria-hidden='true'
                      className='ml-[0.06em] inline-block h-[0.74em] w-[0.05em] translate-y-[0.04em] bg-[#FCD119] align-middle'
                    /> */}
                  </p>

                  {/* TIER 3 — the method */}
                  <p data-tier='3' className='mt-[0.75em] font-tommy-regular uppercase leading-[1.15] tracking-[0.14em] text-white/85 text-[12px] md:text-[clamp(0.7rem,2.08vw,1.45rem)]'>
                    <span data-cta-part data-cta-line='3'>GPS-enabled billboard trucks that capture real impressions data -<br /> so you can retarget every viewer online</span>
                    <span
                      data-caret='3'
                      aria-hidden='true'
                      className='ml-[0.35em] inline-block h-[1em] w-[0.09em] translate-y-[0.16em] bg-[#FCD119] align-middle'
                    />
                  </p>
                </div>

                <div ref={ctaButtonsRef} className='w-full flex flex-col md:flex-row gap-[10px] md:gap-[32px] lg:gap-[42px] justify-center items-center'>
                  <a className='bg-white text-[16px] md:text-[20px] lg:text-[24px] leading-[102%] font-tommy-regular text-[#1A1917] rounded-[6px] px-[12px] md:px-[16px] lg:px-[30px] py-[10px] md:py-[16px] lg:py-[20px] cursor-pointer'>
                    Start a Campaign
                  </a>
                  {/* Jumps to the Markets & Coverage roll call further down the page.
                      The handler takes over from the plain hash so the scroll is
                      smooth; the href stays as the fallback and keeps the link
                      real for keyboard and middle-click. */}
                  <a
                    href='#markets-coverage'
                    onClick={(e) => {
                      const target = document.getElementById('markets-coverage');
                      if (!target) return;
                      e.preventDefault();
                      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className='bg-black text-[16px] md:text-[20px] leading-[102%] font-tommy-regular text-[#FCD119] rounded-[6px] px-[12px] md:px-[16px] lg:px-[30px] py-[10px] md:py-[16px] lg:py-[20px] cursor-pointer'
                  >
                    See the Data in Action
                  </a>
                </div>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div ref={scrollArrowRef} className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 z-20 animate-bounce flex flex-col items-center gap-2 md:gap-3 opacity-90">
              <span className="text-[#1A1917] dark:text-[#FCD119] font-tommy-medium text-[11px] md:text-[14px] uppercase tracking-[3px]">Scroll</span>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#1A1917] dark:text-[#FCD119] w-[32px] h-[32px] md:w-[44px] md:h-[44px]">
                <path d="M12 4V20M12 20L6 14M12 20L18 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}