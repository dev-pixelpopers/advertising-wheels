'use client';

/**
 * SecondSection — one pinned stage carrying two panels.
 *
 *   1. HomeMarquee   — scattered floating brand showcase. On scroll, all logos translate
 *                      upward in perfect unison so top logos exit and new ones float up from bottom.
 *   2. Testimonials  — rides in from the right OVER the logo field, which holds
 *                      its ground; at contact the field is flung left while the
 *                      panel snaps home, so the hand-off reads as a repulsion
 *                      rather than two panels sliding in convoy.
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

            /* ── Phase 2 — the repulsion ───────────────────────────────────
               A standoff, then a break. Four beats:

                 1. The panel closes in and stops after taking only a SLIVER
                    of the right-hand side — it is second in the DOM and
                    opaque, so it simply covers the logos rather than moving
                    them. It decelerates on the way in, so it reads as
                    meeting resistance.
                 2. A beat of nothing, held at that edge. The pressure.
                 3. The field gives three percent of ground — still holding,
                    but no longer holding easily.
                 4. The break. The logos are flung left and the panel takes
                    the whole remaining width in the SAME span with the SAME
                    ease, so the two are locked: the space one vacates is the
                    space the other fills, at matched speed.

               Nearly all of the panel's travel is deliberately saved for
               beat 4. Spending it on the approach instead is what made this
               feel like a conveyor belt: by the time anything "broke" the
               panel was already most of the way home. */

            // 1. Approach — takes a sliver of the right, then stops dead at 3.9.
            tl.to(testiRef.current, { xPercent: 82, duration: 0.7, ease: 'power2.out' }, 3.2);

            // 2. The standoff: 3.9 → 4.0, nothing moves. Under a scrub that is
            //    scroll with no result on screen, which is exactly the stall
            //    the moment wants — kept short so it reads as tension, not lag.

            // 3. Ground given, grudgingly.
            tl.to(marqueeRef.current, { xPercent: -3, duration: 0.1, ease: 'power1.in' }, 4.0);

            // 4. The break. Matched duration + ease = matched speed. Timed to
            //    start exactly where the recoil ends, so the two tweens never
            //    fight each other for `xPercent` on the same element.
            tl.to(marqueeRef.current, { xPercent: -100, duration: 0.3, ease: 'power2.out' }, 4.1)
                .to(testiRef.current, { xPercent: 0, duration: 0.3, ease: 'power2.out' }, 4.1);

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
