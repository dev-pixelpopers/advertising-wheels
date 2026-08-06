'use client';

/**
 * SecondSection — one pinned stage carrying two panels.
 *
 *   1. HomeMarquee   — scattered floating brand showcase. On scroll, all logos translate
 *                      upward in perfect unison so top logos exit and new ones float up from bottom.
 *   2. Testimonials  — slides in from the right and physically pushes the HomeMarquee stage
 *                      out of view to the left.
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
            gsap.set(q('.hm-heading'), { autoAlpha: 0, y: 20 });
            gsap.set(q('[data-bubble-layer]'), { autoAlpha: 0, scale: 0.85 });
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

            // ── Phase 1 — Heading & Logos Fade/Scale In ──────────
            tl.to(q('.hm-heading'), { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0)
                .to(q('[data-bubble-layer]'), {
                    autoAlpha: 1,
                    scale: 1,
                    duration: 0.8,
                    stagger: { amount: 0.8, from: 'start' },
                    ease: 'power2.out',
                }, 0.1);

            // ── Phase 1b — Scroll-Driven Vertical Float ──────────
            // As the user scrolls, all floating logos move upwards in perfect unison, 
            // allowing the scattered layout to reveal the rest of the 23 logos from the bottom.
            tl.to(q('[data-bubble-layer]'), { y: -1350, duration: 2.8, ease: 'none' }, 0.4);

            // ── Phase 2 — Testimonials Enters from Right & Pushes Marquee Stage Left ──
            // Testimonials slides in from 100% to 0%, physically pushing marqueeRef left.
            tl.to(marqueeRef.current, { xPercent: -100, duration: 1.2, ease: 'power2.inOut' }, 3.2)
                .to(testiRef.current, { xPercent: 0, duration: 1.2, ease: 'power2.inOut' }, 3.2);

            // ── Phase 3 — Testimonials Heading Lands, Rail Scrolls ─────────
            tl.to(q('[data-tm-head] > *'), {
                y: 0,
                autoAlpha: 1,
                duration: 0.5,
                stagger: 0.12,
                ease: 'power3.out',
            }, 4.4);

            const rail = q('[data-tm-rail]')[0] as HTMLElement | undefined;
            const tmView = q('[data-tm-viewport]')[0] as HTMLElement | undefined;
            if (rail && tmView) {
                const travel = () => Math.max(0, rail.scrollWidth - tmView.clientWidth);
                tl.fromTo(rail, { x: 0 }, { x: () => -travel(), duration: 2.8 }, 4.9);
            }

            // Hold on the last quote before the pin releases.
            tl.to({}, { duration: 0.4 }, 7.7);
        },
        { scope: rootRef }
    );

    return (
        <div ref={rootRef} className="second-section relative h-screen w-full overflow-hidden">
            {/* Marquee panel with scattered floating logos */}
            <div ref={marqueeRef} className="absolute inset-0 w-full h-full">
                <HomeMarquee scrollDriven />
            </div>
            {/* Testimonials panel — starts off to the right and pushes marquee left */}
            <div ref={testiRef} className="absolute inset-0 w-full h-full">
                <FloatingTestimonials embedded />
            </div>
        </div>
    );
}
