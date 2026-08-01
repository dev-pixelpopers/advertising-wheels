'use client';

/**
 * SecondSection — one pinned stage carrying two panels.
 *
 *   1. HomeMarquee   — heading + partner logo rows. On desktop the rows are
 *                      scroll-driven (the CSS auto-scroll is switched off), so
 *                      the logos track with the scroll rather than looping on a
 *                      timer. Below `lg` they keep their own CSS loop.
 *   2. Testimonials  — slides in as the marquee slides out; the heading lands
 *                      and the quote rail then tracks sideways.
 *
 * The case studies used to live here too; they now have their own pinned stage
 * (CaseStudySection) later in the page.
 */

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import HomeMarquee from './HomeMarquee';
import FloatingTestimonials from './FloatingTestimonials';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function SecondSection() {
    const rootRef = useRef<HTMLDivElement>(null);
    const marqueeRef = useRef<HTMLDivElement>(null);
    const testiRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const q = gsap.utils.selector(rootRef.current);

            // ── Initial states ─────────────────────────────────────────────
            gsap.set(testiRef.current, { xPercent: 100 });
            gsap.set(q('.hm-heading, .hm-row1, .hm-row2'), { clipPath: 'inset(0% 0% 0% 100%)', opacity: 0 });
            gsap.set(q('[data-tm-head] > *'), { y: 26, autoAlpha: 0 });

            const tl = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'top top',
                    end: () => '+=' + window.innerHeight * 6.5,
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true,
                },
            });

            /* Positions are ABSOLUTE (not '+=') so the handoff points are exact:
               the marquee owns 0 → 1.9, and the testimonials take over the moment
               it finishes. Chaining with '+=' made the scroll-driven rows push the
               testimonials far down the timeline. */

            // ── Phase 1 — the marquee content wipes in from the right ───────
            tl.to(q('.hm-heading'), { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 0.9, ease: 'power2.out' }, 0)
                .to(q('.hm-row1'), { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.3)
                .to(q('.hm-row2'), { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.4);

            // ── Phase 1b — desktop: the logo rows track with the scroll ─────
            // Each track holds three copies of the set, so travelling exactly one
            // third lands on a seamless boundary. Runs for the marquee's whole
            // turn on stage and no longer.
            if (window.matchMedia('(min-width: 1024px)').matches) {
                const row1 = q('[data-hm-row="1"]')[0] as HTMLElement | undefined;
                const row2 = q('[data-hm-row="2"]')[0] as HTMLElement | undefined;
                if (row1) {
                    tl.fromTo(row1, { x: () => -row1.scrollWidth / 3 }, { x: 0, duration: 1.9 }, 0);
                }
                if (row2) {
                    tl.fromTo(row2, { x: 0 }, { x: () => -row2.scrollWidth / 3, duration: 1.9 }, 0);
                }
            }

            // ── Phase 2 — the moment the marquee ends, the testimonials arrive ──
            tl.to(marqueeRef.current, { xPercent: -100, duration: 1, ease: 'power2.inOut' }, 1.9)
                .to(testiRef.current, { xPercent: 0, duration: 1, ease: 'power2.inOut' }, 1.9);

            // ── Phase 3 — heading lands, then the quote rail tracks sideways ─
            tl.to(q('[data-tm-head] > *'), {
                y: 0,
                autoAlpha: 1,
                duration: 0.5,
                stagger: 0.12,
                ease: 'power3.out',
            }, 2.8);

            const rail = q('[data-tm-rail]')[0] as HTMLElement | undefined;
            const tmView = q('[data-tm-viewport]')[0] as HTMLElement | undefined;
            if (rail && tmView) {
                // Recomputed on refresh so a resize can't leave the rail short.
                const travel = () => Math.max(0, rail.scrollWidth - tmView.clientWidth);
                tl.fromTo(rail, { x: 0 }, { x: () => -travel(), duration: 3.2 }, 3.3);
            }

            // Hold on the last quote before the pin releases.
            tl.to({}, { duration: 0.4 }, 6.5);
        },
        { scope: rootRef }
    );

    return (
        <div ref={rootRef} className="second-section relative h-screen w-full overflow-hidden">
            {/* Marquee panel */}
            <div ref={marqueeRef} className="absolute inset-0 flex items-center justify-center">
                <HomeMarquee scrollDriven />
            </div>
            {/* Testimonials panel — starts off to the right */}
            <div ref={testiRef} className="absolute inset-0">
                <FloatingTestimonials embedded />
            </div>
        </div>
    );
}
