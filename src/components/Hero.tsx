'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);


const FRAME_COUNT = 155;

/* How much of the photo the CTA scrim is allowed to take away. The client asked
   for the woman to stay legible underneath the headline rather than being wiped
   out by it, so the wash is light and the blur is barely there — the CTA text
   earns its contrast from its own shadow instead (see `cta-legible` below). */
const SCRIM_TINT = 'rgba(0,0,0,0.22)';

/* Applied to the canvas for the whole sequence. The frames themselves render
   darker and harder on screen than the source art, so this lifts the midtones
   and pulls the contrast back down a touch. Kept in one place because GSAP
   tweens the `filter` property wholesale — the blur tween has to carry these
   same functions or they get wiped the moment it runs. */
const CANVAS_GRADE = 'brightness(1.12) contrast(0.9) saturate(1.04)';

const getFrameSrc = (index: number): string => {
  const frameNumber = (FRAME_COUNT - index).toString().padStart(1, '0');
  /* WebP, not PNG. The source frames were 1280x720 RGBA PNGs averaging 1.1 MB
     — 177 MB for the sequence — and all 161 were fully opaque, so a quarter of
     every file was an alpha channel storing nothing. The loop below requests
     the whole sequence up front, which meant the hero alone put 177 MB on the
     wire before anything could paint. At WebP q74 the same frames average
     35 KB, for 5.5 MB total. The .png originals are still on disk and in git. */
  return `/assets/images/hero_12/Frame_${frameNumber}.webp`;
};

interface HeroProps {
  isReady: boolean;
}

export default function Hero({ isReady }: HeroProps) {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const divRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLSpanElement>(null);
  const hapRef = useRef<HTMLSpanElement>(null);
  const pensRef = useRef<HTMLSpanElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaButtonsRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const headingWrapRef = useRef<HTMLDivElement>(null);
  // const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      ScrollTrigger.normalizeScroll(true);
    }

  }, []);

  // 1. CANVAS PRELOADING & SCROLL SCRUBBING
  useGSAP(
    () => {
      // if (!containerRef.current || !canvasRef.current || !imagesRef.current || !currentFrameRef.current || !divRef.current || !subRef.current || !hapRef.current || !pensRef.current || !ctaRef.current
      //   || !ctaButtonsRef.current || !scrimRef.current || !headingWrapRef.current || !headerRef.current || !contentRef.current || !scrollArrowRef.current
      // )
      //   return;
      // gsap.set(headerRef.current, { yPercent: -270 });
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

      const mm = gsap.matchMedia();

      mm.add({
        isMobile: "(max-width: 767px)",
        isDesktop: "(min-width: 768px)"
      }, (context) => {
        const { isMobile } = context.conditions as { isMobile: boolean; isDesktop: boolean };

        const ctaParts = ctaRef.current
          ? (Array.from(ctaRef.current.querySelectorAll('[data-cta-part]')) as HTMLElement[])
          : [];
        const caretOf = (n: string) =>
          ctaRef.current?.querySelector<HTMLElement>(`[data-caret="${n}"]`) ?? null;
        const carets = ['1', '2', '3'].map(caretOf);

        let splits: SplitText[] = [];

        if (isMobile) {
          gsap.set(ctaParts, { clipPath: 'inset(0% 100% 0% 0%)' });
          gsap.set(carets, { display: 'none' });
        } else {
          splits = ctaParts.map((el) => new SplitText(el, { type: 'chars' }));
          const tier = (n: string) =>
            ctaParts.flatMap((el, i) => (el.getAttribute('data-cta-line') === n ? splits[i].chars : []));
          const [t1, t2, t3] = ['1', '2', '3'].map(tier);
          const ctaChars = [...t1, ...t2, ...t3];

          gsap.set(ctaChars, { autoAlpha: 0 });
          gsap.set(carets, { autoAlpha: 0, display: 'inline-block' });
        }

        ctaRef.current?.querySelector('[data-cta-stack]')?.classList.remove('cta-pre');

        gsap.set(ctaButtonsRef.current, { y: 40, autoAlpha: 0 });
        gsap.set(scrimRef.current, { autoAlpha: 0 });

        const frameState = { frame: 0 };
        let restProgress = -1;
        const REST_ZONE_BEFORE = 0.015;
        const REST_ZONE_AFTER = 0.07;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            snap: {
              snapTo: (value: number) => {
                if (restProgress < 0) return value;
                const delta = value - restProgress;
                if (delta >= -REST_ZONE_BEFORE && delta <= REST_ZONE_AFTER) return restProgress;
                return value;
              },
              duration: { min: 0.15, max: 0.5 },
              delay: 0.05,
              ease: 'power2.inOut',
            },
            end: () => '+=' + window.innerHeight * 4,
            scrub: 1,
          },
        });

        // ── PHASE 1 (first stretch of scroll) ──────────────────────────────
        // tl.to(scrollArrowRef.current, { autoAlpha: 0, ease: 'power1.out', duration: 0.15 }, 0);
        tl.to(canvasRef.current, { autoAlpha: 1, ease: 'none', duration: 0.25 }, 0);
        tl.to(canvasRef.current, { scale: 1, filter: `blur(0px) ${CANVAS_GRADE}`, ease: 'none', duration: 1 }, 0);
        tl.to(subRef.current, { xPercent: -260, autoAlpha: 0, ease: 'none', duration: 1 }, 0);
        tl.to(hapRef.current, { xPercent: -220, ease: 'none', duration: 1 }, 0)
          .to(pensRef.current, { xPercent: 220, ease: 'none', duration: 1 }, 0);

        // ── PHASE 2 (remaining scroll) ─────────────────────────────────────
        tl.to(frameState, {
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
        }, 1);

        // ── PHASE 3 (after the canvas animation completes) ─────────────────
        tl.to(scrimRef.current, {
          autoAlpha: 1,
          ease: 'power1.out',
          duration: 0.8,
          onStart: () => {
            if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('heroHeaderShow', { detail: true }));
          },
          onReverseComplete: () => {
            if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('heroHeaderShow', { detail: false }));
          },
        }, '>');

        // ── PHASE 4 (CTA text animation) ──────────────────────────────────────
        if (isMobile) {
          // Text reveal animation for mobile (clipPath left to right)
          const t1 = ctaParts.filter(el => el.getAttribute('data-cta-line') === '1');
          const t2 = ctaParts.filter(el => el.getAttribute('data-cta-line') === '2');
          const t3 = ctaParts.filter(el => el.getAttribute('data-cta-line') === '3');

          tl.to(t1, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.15, ease: 'none' })
            .to(t2, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.15, ease: 'none' })
            .to(t3, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.15, ease: 'none' });
        } else {
          // Typing animation for desktop
          const CHAR = 0.02;
          const tier = (n: string) => ctaParts.flatMap((el, i) => (el.getAttribute('data-cta-line') === n ? splits[i].chars : []));
          const [t1, t2, t3] = ['1', '2', '3'].map(tier);

          tl.set(carets[0], { autoAlpha: 1 })
            .to(t1, { autoAlpha: 1, duration: 0.1, ease: 'none', stagger: CHAR })
            .set(carets[0], { autoAlpha: 0 })
            .set(carets[1], { autoAlpha: 1 })
            .to(t2, { autoAlpha: 1, duration: 0.1, ease: 'none', stagger: CHAR })
            .set(carets[1], { autoAlpha: 0 })
            .set(carets[2], { autoAlpha: 1 })
            .to(t3, { autoAlpha: 1, duration: 0.1, ease: 'none', stagger: CHAR })
            .set(carets[2], { autoAlpha: 0 });
        }

        // tl.fromTo(headerRef.current, { yPercent: -270 }, { yPercent: 0, ease: 'power3.out', duration: 0.6 });
        tl.to(ctaButtonsRef.current, { y: 0, autoAlpha: 1, ease: 'power2.out', duration: 0.5 });

        // ── THE HOLD ──────────────────────────────────────────────────────
        tl.addLabel('ctaRest');
        const HOLD = 1;

        // ── PHASE 5 (Scale up Tier 3) ──────────────────────────────────────
        const tier1El = ctaRef.current?.querySelector('[data-tier="1"]');
        const tier2El = ctaRef.current?.querySelector('[data-tier="2"]');
        const tier3El = ctaRef.current?.querySelector('[data-tier="3"]');

        if (tier3El) {
          tl.addLabel('scaleUp', '+=' + HOLD);
          tl.to([tier1El, tier2El, ctaButtonsRef.current], { autoAlpha: 0, duration: 0.5, ease: 'power1.inOut' }, 'scaleUp');
          tl.to(tier3El, { scale: 80, duration: 2.5, ease: 'power2.in', transformOrigin: '50% 50%' }, 'scaleUp');
        }

        const totalDuration = tl.duration();
        restProgress = totalDuration > 0 ? tl.labels.ctaRest / totalDuration : -1;

        return () => {
          splits.forEach((s) => s.revert());
        };
      });

      return () => {
        window.removeEventListener('resize', resizeCanvas);
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

        /* The scrim used to be a heavy black wash that guaranteed contrast by
           erasing the photo. It is now light enough to see her through, so the
           headline carries its own legibility instead — a soft dark halo that
           reads as depth rather than as a shadow. */
        .cta-legible {
          text-shadow:
            0 1px 2px rgba(0, 0, 0, 0.45),
            0 2px 14px rgba(0, 0, 0, 0.38),
            0 4px 44px rgba(0, 0, 0, 0.30);
        }

        /* …but that halo is sized for DISPLAY type, and tier 3 is not display
           type. It sets at ~23px in the lightest weight, uppercase, on 0.14em
           of tracking — a cap height of roughly 16px and strokes about two
           pixels wide. Against that, the 14px blur is a full cap height and the
           44px blur is nearly three times one: the haze fills the counters and
           the gaps between the letters and eats the strokes from the outside,
           which is what reads as a soft, smudged line rather than a shadow.

           Fine print needs a shadow scaled to itself — tight enough to lift it
           off the video, small enough that it never touches the glyphs. The
           tiers above are untouched; at 72px the wide halo is doing its job. */
        .cta-fine {
          text-shadow:
            0 1px 2px rgba(0, 0, 0, 0.55),
            0 1px 6px rgba(0, 0, 0, 0.42);
        }

        /* Scroll arrow: drifts down and fades out, then re-enters from above.
           The loop resets while the arrow is fully transparent, so the jump
           back to the top is never seen — the fade is doing the cutting, which
           is why the opacity hits 0 a little before the travel ends. */
        @keyframes hero-scroll-arrow {
          0%   { transform: translateY(-9px); opacity: 0; }
          20%  { opacity: 1; }
          65%  { opacity: 1; }
          90%  { opacity: 0; }
          100% { transform: translateY(15px); opacity: 0; }
        }
        .hero-scroll-arrow {
          animation: hero-scroll-arrow 1.9s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          will-change: transform, opacity;
        }

        /* Mobile swipe hint: the hand rises past the static trail marks and
           fades, resetting while invisible — same trick as the arrow above, so
           the loop never shows a jump back to the start. Slightly slower than
           the arrow because a hand travelling is a longer read than a glyph. */
        @keyframes hero-swipe-hand {
          0%   { transform: translateY(9px);   opacity: 0; }
          18%  { opacity: 1; }
          60%  { opacity: 1; }
          88%  { opacity: 0; }
          100% { transform: translateY(-11px); opacity: 0; }
        }
        .hero-swipe-hand {
          animation: hero-swipe-hand 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          will-change: transform, opacity;
        }

        /* GSAP fades the WRAPPER out on scroll; these only ever touch their own
           opacity, so the two never contend for the same property. */
        @media (prefers-reduced-motion: reduce) {
          .hero-scroll-arrow,
          .hero-swipe-hand { animation: none; }
        }
      `}</style>

      <section ref={containerRef} className="relative h-[550vh] w-[100vw] z-70">
        <div className="sticky top-0 h-dvh w-full overflow-hidden">

          <div ref={divRef} className='first-section absolute inset-0 bg-[#EEE8D9]  opacity-0 flex flex-col justify-between items-center px-4 md:px-8 lg:px-12 2xl:px-20 3xl:px-25 py-[72px] overflow-hidden w-full h-full'>
            {/* Canvas frame sequence — sits above the cream bg, behind the text.
              Hidden at first (only text shows); fades in blurred & scaled down as scroll begins. */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full z-0"
              style={{
                opacity: 0,
                visibility: 'hidden',
                transform: 'scale(0.85)',
                filter: `blur(20px) ${CANVAS_GRADE}`
              }}
            />
            {/* Full-screen backdrop blur overlay — covers whole screen & reveals with CTA text */}
            <div
              ref={scrimRef}
              className="absolute inset-0 z-[5] pointer-events-none transition-all"
              style={{
                opacity: 0,
                backgroundColor: SCRIM_TINT,
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
              }}
            />
            <div ref={contentRef} className='w-full h-full flex flex-col justify-center items-center relative z-10'>
              <div ref={headingWrapRef} className='flex flex-col justify-center items-center gap-[3px] md:gap-[5px]'>
                <span ref={subRef} className='text-center text-[#1A1917] font-tommy-bold text-[25px] md:text-[clamp(2.5rem,5vw,4.125rem)] capitalize '>We’re where life</span>
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
                <div data-cta-stack className='cta-pre cta-legible flex flex-col items-center text-center text-white'>
                  {/* TIER 1 — the subject */}
                  <h2
                    data-tier='1'
                    data-cta-part
                    data-cta-line='1'
                    className='font-tommy-bold uppercase leading-[100%] tracking-[-0.01em] text-[37px] md:text-[clamp(2rem,5vw,5.5rem)]'
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
                  {/* `cta-fine` overrides the stack's display-type halo — see the
                      note in the style block. The weight goes up a step and the
                      white goes to full for the same reason: at this size, over
                      moving video, REGULAR at 85% left about two pixels of
                      low-contrast stroke to carry the line. MEDIUM at full white
                      is what tier 2 already uses. */}
                  <p data-tier='3' data-cta-part data-cta-line='3' className='cta-fine mt-[0.75em] font-tommy-medium uppercase leading-[1.15] tracking-[0.14em] text-white text-[14px] md:text-[clamp(0.7rem,1.8vw,1.45rem)]'>
                    GPS-enabled billboard trucks that capture real impressions data -<br /> so you can retarget every viewer online
                    <span
                      data-caret='3'
                      aria-hidden='true'
                      className='ml-[0.35em] inline-block h-[1em] w-[0.09em] translate-y-[0.16em] bg-[#FCD119] align-middle'
                    />
                  </p>
                </div>

                <div ref={ctaButtonsRef} className='w-full flex flex-col md:flex-row gap-[10px] md:gap-[32px] lg:gap-[42px] justify-center items-center'>
                  <a className='bg-white text-[16px] md:text-[20px] lg:text-[24px] leading-[102%] font-tommy-regular text-[#1A1917] rounded-[6px] px-[12px] md:px-[16px] lg:px-[30px] py-[10px] md:py-[16px] lg:py-[20px] cursor-pointer' href='/contact#form'>
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
                    className='bg-black text-[16px] md:text-[20px] lg:text-[24px] leading-[102%] font-tommy-regular text-[#FCD119] rounded-[6px] px-[12px] md:px-[16px] lg:px-[30px] py-[10px] md:py-[16px] lg:py-[20px] cursor-pointer'
                  >
                    See the Data in Action
                  </a>
                </div>
              </div>
            </div>

            {/* Scroll Indicator.
                Two variants, swapped at `md`, because the gesture differs: a
                pointer scrolls, a thumb swipes. Both live inside the same
                wrapper so GSAP still fades exactly one thing out on scroll.

                Desktop: the label is fixed and only the arrow travels.
                `animate-bounce` used to sit on this wrapper, which moved the
                word along with the arrow and made the pair look like it was
                hopping. The animation lives on the arrow alone. */}
            {/* <div ref={scrollArrowRef} className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 md:gap-3 opacity-90">
             
              <span
                aria-hidden="true"
                className="hero-swipe-hand md:hidden block h-[48px] w-[48px] bg-current text-[#1A1917]"
                style={{
                  WebkitMaskImage: 'url(/assets/images/swipe-hand.png)',
                  maskImage: 'url(/assets/images/swipe-hand.png)',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                }}
              />

            <span className="hidden md:block text-[#1A1917] font-tommy-medium text-[11px] md:text-[14px] uppercase tracking-[3px]">Scroll</span>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="hero-scroll-arrow hidden md:block text-[#1A1917] md:w-[44px] md:h-[44px]">
              <path d="M12 4V20M12 20L6 14M12 20L18 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div> */}
          </div>
        </div>
      </section >
    </>
  );
}