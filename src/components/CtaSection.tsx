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

/** Industry-association items for the certifications grid. */
interface AssocItem {
    tag: string;
    title: string;
    description: string;
    badge?: { src: string; alt: string; w: string };
    badges?: { src: string; alt: string; w: string }[];
    isUsdot?: boolean;
}

const ASSOCIATIONS: AssocItem[] = [
    {
        tag: 'OAAA Member',
        title: 'OAAA Membership',
        description: 'Official OAAA membership.',
        badge: { src: '/assets/images/cta/o-aaa.webp', alt: 'OAAA member', w: 'w-[100px] md:w-[120px]' },
    },
    {
        tag: 'Accreditation',
        title: 'GeoPath & OAAA Accredited',
        description: 'Accredited by GeoPath and the OAAA;',
        badges: [
            { src: '/assets/images/cta/geopath.webp', alt: 'GeoPath accredited', w: 'w-[90px] md:w-[105px]' },
            { src: '/assets/images/cta/o-aaa.webp', alt: 'OAAA accredited', w: 'w-[90px] md:w-[105px]' },
        ],
    },
    {
        tag: 'MBE Certified',
        title: 'Minority Business Enterprise',
        description: 'Certified Minority Business Enterprise (MBE) — NMSDC/WRMSDC certificate #WR05284; NAICS 541850 (Outdoor Advertising).',
        badges: [
            { src: '/assets/images/cta/mbe-certified.webp', alt: 'MBE certified', w: 'w-[44px] md:w-[52px]' },
            { src: '/assets/images/cta/national-minority.webp', alt: 'NMSDC certified', w: 'w-[68px] md:w-[80px]' },
        ],
    },
    {
        tag: 'USDOT Fleet',
        title: 'USDOT-Registered Fleet Partners',
        description: 'USDOT-registered fleet partners with strict safety & branding standards;',
        isUsdot: true,
    },
];

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

            // Industry-associations block — heading first, then the cards cascade.
            gsap.from('[data-assoc-heading]', {
                y: 14,
                autoAlpha: 0,
                duration: 0.6,
                ease: 'power3.out',
                scrollTrigger: { trigger: '[data-assoc-row]', start: 'top 88%', once: true },
            });
            gsap.from('[data-assoc-marquee]', {
                y: 20,
                autoAlpha: 0,
                duration: 0.7,
                ease: 'power3.out',
                scrollTrigger: { trigger: '[data-assoc-row]', start: 'top 85%', once: true },
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
                        From artwork to first highway mile in days — book a route, wrap a
                        fleet, and watch the impressions climb.
                    </p>
                    <div className="mt-6 md:mt-8 lg:mt-10 flex flex-col items-center gap-2 md:gap-4 sm:flex-row sm:gap-6">
                        <a
                            href="/contact"
                            className="group flex items-center gap-2 lg:gap-3 rounded-full bg-black px-4 md:px-6 lg:px-8 py-3 lg:py-4 font-tommy-medium text-[15px] text-[#FCD119] transition-transform duration-300 hover:scale-[1.04]"
                        >
                            Start Your Campaign
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

                {/* ---------------- Industry Associations & Certifications ---------------- */}
                <div
                    data-assoc-row
                    className="relative z-10 mx-auto mt-8 w-full max-w-[880px] md:mt-12"
                >
                    <h3
                        data-assoc-heading
                        className="text-center font-tommy-bold text-[18px] leading-tight tracking-[-0.5px] text-black md:text-[22px]"
                    >
                        Industry Associations &amp; Credentials
                    </h3>

                    <div
                        data-assoc-marquee
                        className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 md:mt-6 md:gap-3.5"
                    >
                        {ASSOCIATIONS.map((assoc, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-3.5 rounded-xl border border-black/15 bg-black/5 p-2 md:p-3.5 backdrop-blur-sm transition-all duration-300 hover:border-black/30 hover:bg-black/10 hover:shadow-sm"
                            >
                                {/* Left Logo / Badge Icon */}
                                <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-lg border border-black/10 bg-black/5 p-1.5 md:h-[76px] md:w-[76px]">
                                    {assoc.badge && (
                                        <img
                                            src={assoc.badge.src}
                                            alt={assoc.badge.alt}
                                            loading="lazy"
                                            className="max-h-12 w-auto object-contain mix-blend-multiply opacity-90"
                                        />
                                    )}
                                    {assoc.badges && (
                                        <div className="flex flex-col items-center justify-center gap-1">
                                            {assoc.badges.map((b, bIdx) => (
                                                <img
                                                    key={bIdx}
                                                    src={b.src}
                                                    alt={b.alt}
                                                    loading="lazy"
                                                    className="max-h-6 w-auto object-contain mix-blend-multiply opacity-90"
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {assoc.isUsdot && (
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <svg className="h-6 w-6 text-black/75" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                            </svg>
                                            <span className="mt-0.5 font-tommy-bold text-[9px] uppercase tracking-wider text-black/80">
                                                USDOT
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Right Text Details */}
                                <div className="min-w-0 flex-1">
                                    <span className="inline-block rounded-full bg-black/10 px-2 py-0.5 font-tommy-medium text-[9.5px] uppercase tracking-wider text-black/75">
                                        {assoc.tag}
                                    </span>
                                    <h4 className="mt-1 font-tommy-bold text-[14px] leading-snug text-black md:text-[15px]">
                                        {assoc.title}
                                    </h4>
                                    <p className="mt-0.5 font-tommy-regular text-[11.5px] leading-snug text-black/75 md:text-[12px]">
                                        {assoc.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

