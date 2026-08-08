'use client';

/**
 * SecondSection — one pinned stage carrying two panels.
 *
 *   1. HomeMarquee   — a block in water. The heading sits centred behind a
 *                      frosted shield; the logos surface from below in two
 *                      waves and settle around it, bobbing on a CSS loop.
 *   2. Testimonials  — a second block dropped on the field. The panel comes in
 *                      and stops half way, and on that beat every logo is
 *                      thrown outward along its own vector and off the screen.
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

            const bubbles = q('[data-bubble-layer]') as HTMLElement[];
            const stageEl = bubbles[0]?.parentElement as HTMLElement | undefined;

            /**
             * Where one logo goes when the wiper reaches it.
             *
             * A squeegee dragged leftward across a wet floor does two things at
             * once: most of the water is carried ALONG the blade's direction,
             * and the rest escapes around the ends of it. So every logo is
             * driven LEFT — nothing travels back toward the blade — with a
             * vertical splay proportional to how far it sits from the midline.
             * A logo level with the middle is pushed almost dead ahead; ones
             * near the top and bottom slide off the ends of the blade and leave
             * on a diagonal.
             *
             * This replaces an outward-from-centre blast, which had the
             * right-hand logos flying RIGHT — into the oncoming panel. Water
             * does not move toward the squeegee.
             *
             * Read off computed `left`/`top` rather than a live bounding rect:
             * those resolve the authored percentage to pixels and ignore any
             * transform, so the answer is the same whether the logo is below the
             * fold, at rest, or already moving. A live rect would return
             * something different every time ScrollTrigger re-evaluated this.
             */
            const wipeVector = (el: HTMLElement) => {
                const stageW = stageEl?.clientWidth || window.innerWidth;
                const stageH = stageEl?.clientHeight || window.innerHeight;
                const cs = getComputedStyle(el);
                const restLeft = parseFloat(cs.left) || 0;
                const restTop = parseFloat(cs.top) || 0;

                // -1 at the top edge, +1 at the bottom, ~0 level with the middle.
                const fromMid = (restTop - stageH / 2) / (stageH / 2);

                /* Marks well clear of the midline do not get carried — they slip
                   AROUND the ends of the blade, mostly vertically, the way water
                   escapes past a squeegee instead of piling up in front of it.
                   Everything nearer the middle is pushed ahead of the blade. */
                const around = Math.abs(fromMid) > 0.45;

                const x = around
                    ? -(restLeft * 0.5 + stageW * 0.2)          // drifts left, but mostly leaves vertically
                    : -(restLeft + stageW * 0.45 + 200);        // carried the full way along the wipe

                const y = around
                    ? Math.sign(fromMid) * stageH * 1.15        // straight out the top or bottom
                    : fromMid * stageH * 0.55;

                // The tiniest tumble, and only on the ones actually spilling.
                const rotation = around ? fromMid * 9 : fromMid * 3;

                return { x, y, rotation };
            };

            /* When the panel's leading edge arrives at a given x, in timeline
               units after the panel starts moving.
               The panel crosses on power2.inOut, so the edge is slow, then fast,
               then slow. Staggering the wipe linearly against that had logos
               leaving while the panel was still off screen entirely. Inverting
               the ease ties each logo's shove to the moment the blade actually
               reaches it. */
            const PANEL_AT = 6.9;
            const PANEL_DUR = 1.1;
            const easeInOut2 = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
            const edgeReaches = (pct: number) => {
                const target = 1 - pct / 100;
                let lo = 0, hi = 1;
                for (let i = 0; i < 24; i += 1) {
                    const m = (lo + hi) / 2;
                    if (easeInOut2(m) < target) lo = m; else hi = m;
                }
                return ((lo + hi) / 2) * PANEL_DUR;
            };

            // ── Initial states ─────────────────────────────────────────────
            gsap.set(testiRef.current, { xPercent: 100 });
            gsap.set(q('.hm-text-shield'), { autoAlpha: 0, y: 20 });
            gsap.set(q('[data-tm-head] > *'), { y: 26, autoAlpha: 0 });
            /* xPercent/yPercent do the centring, NOT a Tailwind `-translate-x-1/2`
               class — GSAP writes `translate: none` on anything it animates, which
               would drop that class's effect and leave every logo half its own size
               off its mark. Held inside GSAP's transform, it survives every tween
               of x/y/scale below and stays correct at any scale. */
            gsap.set(bubbles, { xPercent: -50, yPercent: -50 });

            const tl = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'top top',
                    end: () => '+=' + window.innerHeight * 9.5,
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true,
                },
            });

            // ── Phase 1 — the block settles ────────────────────────────────
            tl.to(q('.hm-text-shield'), { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0);

            /* ── Phase 2 — two waves surface ───────────────────────────────
               Each logo rises from below the fold to its resting mark, fading
               and growing on the way up like a bubble breaking the surface.
               Anything whose mark sits past the middle travels up THROUGH the
               heading, where the shield's backdrop-filter softens it and then
               lets it go sharp again — the water passing around the block.

               Two passes rather than one long stagger: the field has to read as
               a finished arrangement after wave one, with wave two filling in
               around it. */
            /**
             * Where a logo starts its climb: just under the stage's bottom edge,
             * measured back from ITS OWN resting mark.
             *
             * A single shared offset does not work here, because the marks are at
             * different heights — one flat `0.6 * viewport` drop leaves a logo
             * resting at `top: 12%` starting at 72% down the screen, already in
             * full view, drifting upward from the middle of the composition
             * instead of rising into it. Only the low-resting ones would have
             * come from below the fold at all.
             *
             * Offsetting by `stageHeight - restingTop` puts every logo the same
             * short distance beneath the bottom edge regardless of where it is
             * headed, so the whole wave breaks the surface together and the ones
             * bound for the top simply travel further to get there.
             */
            const startBelowFold = (t: Element) => {
                const el = t as HTMLElement;
                const stageH = stageEl?.clientHeight || window.innerHeight;
                const restTop = parseFloat(getComputedStyle(el).top) || 0;
                return stageH - restTop + 140;
            };

            /** Mirror of the above: far enough past the top edge to be gone. */
            const exitAboveFold = (t: Element) => {
                const restTop = parseFloat(getComputedStyle(t as HTMLElement).top) || 0;
                return -(restTop + 200);
            };

            /* `fromTo`, not `set` + `to`: the start is declared on the tween, so
               `invalidateOnRefresh` re-measures it against the new stage height on
               every resize. Parked in a plain `set` it is a one-shot value that a
               later refresh can quietly rewind to zero, leaving the wave with
               nowhere to rise from. */
            const rise = (wave: 1 | 2, at: number) =>
                tl.fromTo(q(`[data-wave="${wave}"]`),
                    {
                        y: (_i: number, t: Element) => startBelowFold(t),
                        autoAlpha: 0,
                        scale: 0.6,
                    },
                    {
                        y: 0,
                        autoAlpha: 1,
                        scale: 1,
                        duration: 1,
                        ease: 'power2.out',
                        stagger: { amount: 0.7, from: 'random' },
                    }, at);

            /** Wave one keeps climbing and dissolves off the top edge. */
            const driftOut = (wave: 1 | 2, at: number) =>
                tl.to(q(`[data-wave="${wave}"]`), {
                    y: (_i: number, t: Element) => exitAboveFold(t),
                    autoAlpha: 0,
                    scale: 0.85,
                    duration: 1,
                    ease: 'power1.in',
                    stagger: { amount: 0.5, from: 'random' },
                }, at);

            /* Wave one surfaces, floats on the CSS loop for a beat, then carries
               on up and out — leaving the stage empty for wave two to do the
               same. Only ever one wave on screen, which is why each has to be a
               complete arrangement rather than half of one. */
            rise(1, 0.7);
            driftOut(1, 3.1);
            rise(2, 3.9);

            /* Wave two holds, 6.3 → 6.9 — nothing scripted, the CSS buoyancy
               loop carries it, which is why that loop is kept off the timeline. */

            /* ── The hand-off ─────────────────────────────────────────────
               The testimonials arrive with NO background of their own, so there
               is no opaque sheet wiping across the screen — the content simply
               takes the space. Which means the marquee has to clear it: the
               heading dissolves and the surviving wave is thrown outward, each
               logo along its own heading, while the panel moves in.

               The marquee panel itself never moves. Sliding it away as one rigid
               sheet is the read being replaced; the field is displaced, its
               container is not. */

            /* The clear-out is a BOW WAVE, and it has to lead the panel.
               Those testimonial cards are only 20% opaque over a panel with no
               background of its own, so a logo still sitting where a card lands
               reads straight through it. Displacing them on the panel's own beat
               is not enough — they have to be gone from a patch before the card
               gets there.

               So the blast starts BEFORE the panel moves and sweeps right to
               left, each logo leaving as a function of how far right it sits.
               The sweep is quicker than the panel's crossing, so the front of it
               stays ahead of the leading edge the whole way. Fluid being pushed
               out of the way of something entering it, rather than a detonation
               that happens to coincide. */
            tl.to(q('[data-wave="2"]'), {
                x: (_i: number, t: Element) => wipeVector(t as HTMLElement).x,
                y: (_i: number, t: Element) => wipeVector(t as HTMLElement).y,
                rotation: (_i: number, t: Element) => wipeVector(t as HTMLElement).rotation,
                // Barely any swell — water shoved aside does not inflate.
                scale: 1.12,
                autoAlpha: 0,
                duration: 0.6,
                ease: 'power2.in',
                /* Each logo goes when the blade gets to it: its delay IS the
                   moment the edge arrives at its x, less a short lead so it is
                   already yielding as contact happens rather than after. */
                stagger: (_i: number, t: Element) => {
                    const leftPct = parseFloat((t as HTMLElement).style.left) || 50;
                    return Math.max(0, edgeReaches(leftPct) - 0.14);
                },
            }, PANEL_AT);

            // The block gives up the middle before the heading reaches it.
            tl.to(q('.hm-text-shield'), { autoAlpha: 0, scale: 0.94, duration: 0.45, ease: 'power2.in' }, 6.85);

            tl.to(testiRef.current, { xPercent: 0, duration: PANEL_DUR, ease: 'power2.inOut' }, PANEL_AT);

            // ── The testimonials take over — unchanged behaviour, held until
            //    the debris has cleared so the header is not landing through it.
            tl.to(q('[data-tm-head] > *'), {
                y: 0,
                autoAlpha: 1,
                duration: 0.5,
                stagger: 0.12,
                ease: 'power3.out',
            }, 8.1);

            const rail = q('[data-tm-rail]')[0] as HTMLElement | undefined;
            const tmView = q('[data-tm-viewport]')[0] as HTMLElement | undefined;
            if (rail && tmView) {
                const travel = () => Math.max(0, rail.scrollWidth - tmView.clientWidth);
                tl.fromTo(rail, { x: 0 }, { x: () => -travel(), duration: 2.5 }, 8.6);
            }

            // Hold on the last quote before the pin releases.
            tl.to({}, { duration: 0.4 }, 11.1);
        },
        { scope: rootRef }
    );

    return (
        <div ref={rootRef} className="second-section relative h-screen w-full overflow-hidden">
            {/* Logo field — this panel never moves; the logos inside it do. */}
            <div ref={marqueeRef} className="absolute inset-0 w-full h-full">
                <HomeMarquee />
            </div>
            {/* Testimonials — enters from the right, stops half way for the impact. */}
            <div ref={testiRef} className="absolute inset-0 w-full h-full">
                <FloatingTestimonials embedded />
            </div>
        </div>
    );
}
