'use client';

/**
 * CtaSection — bold brand-yellow closer for the page.
 *
 * Full-bleed #FCD119 banner with a giant black headline, supporting line, two
 * actions, and a row of accreditation badges. Content rises in with a
 * ScrollTrigger stagger; the badges get their own clip-and-lift reveal.
 */

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);


export default function CtaSection() {
    const rootRef = useRef<HTMLDivElement>(null);
    const ringsRef = useRef<SVGGElement>(null);

    useGSAP(
        () => {
            const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            gsap.from('[data-cta] > *', {
                y: 50,
                autoAlpha: 0,
                duration: 0.9,
                stagger: 0.12,
                ease: 'power3.out',
                scrollTrigger: { trigger: rootRef.current, start: 'top 72%', once: true },
            });

            if (reduced) return; // resting states are already the finished look

            /* ── Background rings: a slow, continuous breathe ──────────────
               `svgOrigin` pins the scale to the rings' own centre (GSAP would
               otherwise infer a pivot from the bounding box). yoyo means it
               eases back out instead of snapping when the loop restarts, and
               the two rings run at slightly different speeds so they drift
               against each other rather than moving as one flat layer. */
            gsap.to(ringsRef.current, {
                scale: 1.14,
                duration: 9,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
                svgOrigin: '447.5 447.5',
            });
            gsap.to('.cta-ring:last-child', {
                scale: 1.1,
                duration: 6.5,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
                svgOrigin: '447.5 447.5',
            });

            // A touch of scroll-driven zoom on top, so the ground also responds
            // to the reader rather than only running on its own clock.
            gsap.fromTo(
                ringsRef.current,
                { yPercent: 4 },
                {
                    yPercent: -4,
                    ease: 'none',
                    scrollTrigger: { trigger: rootRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
                }
            );

        },
        { scope: rootRef }
    );

    return (
        /* Outer band carries the colour of the sections either side of it, so the
           curved corners reveal a seamless continuation rather than a mismatched
           edge. Must stay in step with WhyChooseUs above and Footer below. */
        <div ref={rootRef} className="w-full bg-[#EEE8D9] transition-colors duration-300 dark:bg-[#0A0A0A]">
            {/* Elliptical top corners — the curve runs far wider than it drops, so it
                reads as one long sweep into the flat middle rather than a rounded box. */}
            <div className="relative w-full overflow-hidden rounded-t-[30px] lg:rounded-t-[40px] bg-[#FCD119] px-3 md:px-5 lg:px-6 py-[50px] md:py-[80px] lg:py-[100px] md:rounded-t-[90px] md:px-14 xl:py-[140px]">
                {/* Concentric rings — echoes the motif behind AdvertisingLeader so the
                    flat yellow slab has some depth. Clipped by the rounded top.
                    The two rings breathe continuously (slow scale in/out, see the GSAP
                    loop above) so the ground is never completely still. It eases both
                    ways rather than looping one direction, which would snap on reset. */}
                <div className="pointer-events-none absolute -bottom-[45%] left-1/2 -translate-x-1/2" aria-hidden="true">
                    <svg width="900" height="900" viewBox="0 0 895 895" fill="none" style={{ overflow: 'visible' }}>
                        <g ref={ringsRef}>
                            <circle className="cta-ring" cx="447.5" cy="447.5" r="442.5" stroke="#000" strokeOpacity="0.07" strokeWidth="10" />
                            <circle className="cta-ring" cx="448" cy="448" r="360" stroke="#000" strokeOpacity="0.05" strokeWidth="10" />
                        </g>
                    </svg>
                </div>

                <div data-cta className="relative z-10 mx-auto flex max-w-[1100px] flex-col items-center text-center">
                    <p className="font-tommy-regular text-[13px] uppercase tracking-[4px] text-black/60">
                        Ready To Roll?
                    </p>
                    <h2 className="mt-3 font-tommy-bold text-[30px] leading-[0.98] tracking-[-2px] text-black md:text-[clamp(3.5rem,5.4vw,6.5rem)] md:tracking-[-5px]">
                        Let&apos;s Put Your Brand
                        <br />
                        On The Road.
                    </h2>
                    <p className="mt-2 md:mt-4 lg:mt-6 lg:max-w-[520px] font-tommy-regular text-[13px] md:text-[15px] lg:text-[17px] leading-[1.65] text-black/65 ">
                        From artwork to on the road in days — wrap a fleet, roll through where life happens, and watch the impressions climb.
                    </p>
                    <div className="mt-6 md:mt-8 lg:mt-10 flex flex-col items-center gap-2 md:gap-4 sm:flex-row sm:gap-6">
                        <a
                            href="/contact"
                            className="group flex items-center gap-2 lg:gap-3 rounded-full bg-black px-4 md:px-6 lg:px-8 py-3 lg:py-4 font-tommy-medium text-[15px] text-[#FCD119] transition-transform duration-300 hover:scale-[1.04]"
                        >
                            Start a Campaign
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
                                <path d="M1 8 H14 M9 3 L14 8 L9 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </a>
                        <a
                            href="tel:+1-877-423-9433"
                            className="rounded-full border-2 border-black px-4 md:px-6 lg:px-8 py-3 lg:py-4 font-tommy-medium text-[15px] text-black transition-colors duration-300 hover:bg-black hover:text-[#FCD119]"
                        >
                            Talk To Us
                        </a>
                    </div>
                </div>


            </div>
        </div>
    );
}

