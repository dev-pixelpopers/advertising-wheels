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

/** Accreditations shown under the closer. Widths are tuned per mark so the
 *  wordmark-shaped ones and the round seals read at the same visual weight. */
const BADGES = [
    { src: '/assets/images/cta/geopath.webp', alt: 'Geopath member', w: 'w-[112px] md:w-[132px]' },
    { src: '/assets/images/cta/o-aaa.webp', alt: 'OAAA member', w: 'w-[112px] md:w-[132px]' },
    { src: '/assets/images/cta/mbe-certified.webp', alt: 'MBE certified', w: 'w-[54px] md:w-[64px]' },
    { src: '/assets/images/cta/national-minority.webp', alt: 'National Minority Supplier Development Council certified', w: 'w-[76px] md:w-[90px]' },
    { src: '/assets/images/cta/inc-5000.webp', alt: 'Inc. 5000 honoree', w: 'w-[54px] md:w-[64px]' },
    { src: '/assets/images/cta/the-spirt.webp', alt: 'The Spirit of Nashville award', w: 'w-[54px] md:w-[64px]' },
    { src: '/assets/images/cta/bbb-rating.webp', alt: 'BBB accredited business', w: 'w-[86px] md:w-[102px]' },
];

/** Industry-association marks for the marquee. USDOT has no logo asset, so it
 *  rides along as a small text tile. */
type AssocItem =
    | { kind: 'img'; src: string; alt: string; w: string }
    | { kind: 'text'; label: string };

const ASSOCIATIONS: AssocItem[] = [
    { kind: 'img', src: '/assets/images/cta/o-aaa.webp', alt: 'OAAA member', w: 'w-[110px] md:w-[130px]' },
    { kind: 'img', src: '/assets/images/cta/geopath.webp', alt: 'GeoPath accredited', w: 'w-[110px] md:w-[130px]' },
    { kind: 'img', src: '/assets/images/cta/mbe-certified.webp', alt: 'MBE certified', w: 'w-[54px] md:w-[64px]' },
    { kind: 'img', src: '/assets/images/cta/national-minority.webp', alt: 'NMSDC certified', w: 'w-[76px] md:w-[90px]' },
    { kind: 'text', label: 'USDOT Registered' },
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

            /* ── Badges ──────────────────────────────────────────────────
               Each mark is wiped open from the bottom with a clip-path while
               it lifts and un-blurs, so the row assembles left-to-right like
               a seal being stamped rather than a plain fade. */
            gsap.fromTo(
                '[data-badge]',
                { clipPath: 'inset(100% 0% 0% 0%)', y: 26, filter: 'blur(6px)' },
                {
                    clipPath: 'inset(0% 0% 0% 0%)',
                    y: 0,
                    filter: 'blur(0px)',
                    duration: 0.75,
                    stagger: 0.09,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: '[data-badge-row]', start: 'top 88%', once: true },
                }
            );

            // The hairline above the row draws out from the centre first.
            gsap.from('[data-badge-rule]', {
                scaleX: 0,
                duration: 0.9,
                ease: 'power2.inOut',
                scrollTrigger: { trigger: '[data-badge-row]', start: 'top 92%', once: true },
            });

            // The label fades up just ahead of the marks.
            gsap.from('[data-badge-label]', {
                y: 14,
                autoAlpha: 0,
                duration: 0.6,
                ease: 'power3.out',
                scrollTrigger: { trigger: '[data-badge-row]', start: 'top 90%', once: true },
            });

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
            <style>{`
                @keyframes cta-assoc-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                .cta-assoc-track { animation: cta-assoc-marquee 26s linear infinite; }
                @media (prefers-reduced-motion: reduce) { .cta-assoc-track { animation: none; } }
            `}</style>
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

                {/* ---------------- Accreditations ---------------- */}
                <div
                    data-badge-row
                    className="relative z-10 mx-auto mt-12 w-full max-w-[1100px] md:mt-16 lg:mt-20"
                >
                    <span
                        data-badge-rule
                        aria-hidden="true"
                        className="mx-auto block h-px w-full max-w-[720px] bg-black/15"
                    />

                    <p
                        data-badge-label
                        className="mt-6 text-center font-tommy-regular text-[10.5px] uppercase tracking-[3px] text-black/50 md:text-[11.5px]"
                    >
                        Accredited &amp; independently verified
                    </p>

                    <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-6 md:mt-9 md:gap-x-11">
                        {BADGES.map((b) => (
                            <li key={b.src} className="flex items-center">
                                <img
                                    data-badge
                                    src={b.src}
                                    alt={b.alt}
                                    loading="lazy"
                                    /* mix-blend-multiply drops each mark's white box
                                       onto the yellow ground without needing cut-outs. */
                                    className={`${b.w} h-auto object-contain opacity-80 mix-blend-multiply transition-all duration-300 hover:scale-[1.06] hover:opacity-100`}
                                />
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ---------------- Industry Associations ---------------- */}
                {/* <div
                    data-assoc-row
                    className="relative z-10 mx-auto mt-14 w-full max-w-[1100px] md:mt-20"
                >
                    <h3
                        data-assoc-heading
                        className="text-center font-tommy-bold text-[22px] leading-tight tracking-[-1px] text-black md:text-[30px]"
                    >
                        Industry Associations &amp; Accreditations
                    </h3>

                <div
                    data-assoc-marquee
                    className="mt-8 w-full overflow-hidden md:mt-10"
                    style={{ maskImage: 'linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)' }}
                >
                    <div className="cta-assoc-track flex w-max items-center gap-x-12 md:gap-x-20">
                        {[...ASSOCIATIONS, ...ASSOCIATIONS].map((a, i) =>
                            a.kind === 'img' ? (
                                <img
                                    key={i}
                                    src={a.src}
                                    alt={a.alt}
                                    loading="lazy"
                                    className={`${a.w} h-auto shrink-0 object-contain opacity-80 mix-blend-multiply`}
                                />
                            ) : (
                                <span
                                    key={i}
                                    className="shrink-0 whitespace-nowrap rounded-full border border-black/25 px-4 py-1.5 font-tommy-medium text-[12px] uppercase tracking-[2px] text-black/70 md:text-[13px]"
                                >
                                    {a.label}
                                </span>
                            )
                        )}
                    </div>
                </div>
            </div> */}
            </div>
        </div >
    );
}
