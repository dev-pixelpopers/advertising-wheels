'use client';

/**
 * CtaSection — bold brand-yellow closer for the page.
 *
 * Full-bleed #FCD119 banner with a giant black headline, supporting
 * line and two actions. Content rises in with a ScrollTrigger stagger.
 */

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function CtaSection() {
    const rootRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            gsap.from('[data-cta] > *', {
                y: 50,
                autoAlpha: 0,
                duration: 0.9,
                stagger: 0.12,
                ease: 'power3.out',
                scrollTrigger: { trigger: rootRef.current, start: 'top 72%', once: true },
            });
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
            <div className="relative w-full overflow-hidden rounded-t-[40px] bg-[#FCD119] px-6 py-[100px] md:rounded-t-[90px] md:px-14 md:py-[140px]">
                {/* Concentric rings — echoes the motif behind AdvertisingLeader so the
                    flat yellow slab has some depth. Clipped by the rounded top. */}
                <div className="pointer-events-none absolute -bottom-[45%] left-1/2 -translate-x-1/2" aria-hidden="true">
                    <svg width="900" height="900" viewBox="0 0 895 895" fill="none">
                        <circle cx="447.5" cy="447.5" r="442.5" stroke="#000" strokeOpacity="0.07" strokeWidth="10" />
                        <circle cx="448" cy="448" r="360" stroke="#000" strokeOpacity="0.05" strokeWidth="10" />
                    </svg>
                </div>

                <div data-cta className="relative z-10 mx-auto flex max-w-[1100px] flex-col items-center text-center">
                    <p className="font-tommy-regular text-[13px] uppercase tracking-[4px] text-black/60">
                        Ready To Roll?
                    </p>
                    <h2 className="mt-3 font-tommy-bold text-[46px] leading-[0.98] tracking-[-2px] text-black md:text-[104px] md:tracking-[-5px]">
                        Let&apos;s Put Your Brand
                        <br />
                        On The Road.
                    </h2>
                    <p className="mt-6 max-w-[520px] font-tommy-regular text-[15px] leading-[1.65] text-black/65 md:text-[17px]">
                        From artwork to first highway mile in days — book a route, wrap a
                        fleet, and watch the impressions climb.
                    </p>
                    <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                        <a
                            href="#"
                            className="group flex items-center gap-3 rounded-full bg-black px-8 py-4 font-tommy-medium text-[15px] text-[#FCD119] transition-transform duration-300 hover:scale-[1.04]"
                        >
                            Start Your Campaign
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
                                <path d="M1 8 H14 M9 3 L14 8 L9 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </a>
                        <a
                            href="#"
                            className="rounded-full border-2 border-black px-8 py-4 font-tommy-medium text-[15px] text-black transition-colors duration-300 hover:bg-black hover:text-[#FCD119]"
                        >
                            Talk To Us
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
