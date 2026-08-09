'use client';

/**
 * SecondSection — one pinned stage, four phases, all of it on the timeline.
 *
 *   PHASE 0  Mount. Every one of the 23 marks is parked at translateY(120vh) —
 *            fully below the viewport — and hidden. The stage shows the centred
 *            text block and nothing else. No mark has a CSS position, so this is
 *            the state whether or not anything ever animates.
 *
 *   PHASE 1  On arrival, unscrubbed. Pool 1 (12 marks) rises out of the bottom
 *            of the screen on a 0.08s stagger and settles wall to wall around
 *            the block, five across the top, one per side strip, five across the
 *            bottom. From then on the solver's swell carries them.
 *
 *   PHASE 2  First scroll, pinned and scrubbed. Pool 1 drifts up as the top wall
 *            opens; pool 2 (11 marks) floods in from 120vh below on the same
 *            staggered entrance and fills in beneath it. The lid goes back on at
 *            LID_BACK, and 23 marks sit packed around the block — on measured,
 *            non-overlapping positions, not a grid.
 *
 *   PHASE 3  The block dissolves and the testimonial panel crosses in from
 *            x: 100vw. The RAIL is a live collider, and a ploughing one: every
 *            mark its leading edge reaches is driven left, ahead of it, at full
 *            size. The left wall opens as it comes so the displaced field has
 *            somewhere to go. Nothing ends up behind the card, because nothing
 *            is ever passed by it.
 *
 *   PHASE 4  The frame the panel's leading edge sits on 3/4 of the stage — see
 *            SWEEP_COVER, which has to be solved for rather than read off the
 *            ease. A 0.4s sweep flushes all 23 off the left, and once the last
 *            one is clear the headline lands on open stage.
 *
 * The timeline says where marks are headed. `src/lib/logoFluid` says how they
 * behave getting there — the travelling swell, mutual pressure, the walls, and
 * the colliders for the block and the card. It runs on a ticker and writes to a
 * nested element, so it never contends with GSAP for the same transform.
 */

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import HomeMarquee, { BUBBLES } from './HomeMarquee';
import FloatingTestimonials from './FloatingTestimonials';
import { createLogoFluid } from '@/lib/logoFluid';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ── Timeline beats, in scrub units ─────────────────────────────────────── */

/**
 * The two entrances are IDENTICAL in shape — same duration, same stagger, same
 * ease — and both are scrubbed, so each wave waves in under the scroll rather
 * than autoplaying. Only the targets differ.
 */
const WAVE_DUR = 1.4;
const WAVE_STAGGER = 0.08;
/** How long a whole wave takes to land: its stagger tail plus the tween itself. */
const waveSpan = (count: number) => WAVE_DUR + count * WAVE_STAGGER;

/** Wave 1 waves in. */
const W1_IN = 0.15;

/**
 * Wave 1 drifts up into the top of the pool, opening the lower half.
 *
 * Derived rather than hand-set: it starts a clear beat AFTER the last of wave 1
 * has landed, so the field reads as a finished arrangement before it moves again.
 */
const DRIFT_AT = W1_IN + waveSpan(12) + 0.4;
const DRIFT_DUR = 1.6;

/**
 * Wave 2 waves in — late enough that wave 1 is three quarters of the way through
 * its drift and has vacated the lower half.
 *
 * This gap is the fix for wave 2 disrupting the flow. Overlapping the two put 11
 * marks into space 12 others were still crossing, so the pool churned instead of
 * refilling: two entrances fighting rather than one handover.
 */
const W2_IN = DRIFT_AT + DRIFT_DUR * 0.75;

/**
 * The lid goes back on, a beat before wave 2 has fully landed.
 *
 * The top wall is opened at DRIFT_AT so the field has somewhere to stream to,
 * and it used to be left open for the rest of the section — which meant that
 * from the drift onward nothing was holding the pool down. The solver's outward
 * pressure pushes every mark away from centre, so with no ceiling the upper
 * band simply kept climbing and ran off the top of the viewport, clipped by the
 * header. Sealing it again once the streaming is done is what makes the pool a
 * contained body of water rather than one draining upward.
 */
const LID_BACK = W2_IN + waveSpan(11) - 0.5;
const LID_DUR = 0.9;

/** Both waves are down and settled before the block gives up the middle. */
const SHIELD_OUT = W2_IN + waveSpan(11) + 0.2;
const PANEL_AT = SHIELD_OUT + 0.6;
const PANEL_DUR = 1.7;
const PANEL_END = PANEL_AT + PANEL_DUR;

/**
 * The frame the panel's leading edge sits on THREE QUARTERS of the stage.
 *
 * The 50% case is free — `power2.inOut` is exactly half done at half its
 * duration, so the midpoint of the tween is the midpoint of the screen. That
 * symmetry holds at one point only, so 3/4 has to be solved for. Past halfway
 * the ease is `1 − 2(1−p)²`; setting that to 0.75 gives p = 1 − √0.125 ≈ 0.646.
 *
 * Sweeping here rather than at the midpoint is what leaves the hull a crossing
 * to make. It also has to happen BEFORE the card fills the stage: once it does,
 * a mark still on the water has no way out that a wall does not close, and it
 * ends up parked on a quote.
 */
const SWEEP_COVER = 0.6464;
const SWEEP_AT = PANEL_AT + PANEL_DUR * SWEEP_COVER;
const SWEEP_DUR = 0.4;

/** The last mark out: the tween itself plus the tail of its stagger. */
const SWEEP_END = SWEEP_AT + SWEEP_DUR + 0.12;


/** 23 marks in a stage sized for 12: the pool has to compress. */
const FLOW_SCALE = 0.65;


/** Where every mark starts, and where pool 2 waits: a full viewport below. */
const OFFSCREEN = 1.2;

export default function SecondSection() {
    const rootRef = useRef<HTMLDivElement>(null);
    const marqueeRef = useRef<HTMLDivElement>(null);
    const testiRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const stage = rootRef.current;
            if (!stage) return;
            const q = gsap.utils.selector(stage);

            const layers = q('[data-bubble-layer]') as HTMLElement[];
            if (!layers.length) return;
            const pool1 = layers.filter((el) => el.dataset.wave === '1');
            const pool2 = layers.filter((el) => el.dataset.wave === '2');
            const small = () => window.matchMedia('(max-width: 767px)').matches;
            const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            /* Targets are fractions of the stage, resolved here. Read through the
               element's index rather than off the DOM, because there is no CSS
               position to read — the table IS the source of truth. */
            const data = (t: Element) => BUBBLES[Number((t as HTMLElement).dataset.idx)];
            const aim = (t: Element, phase: 'a' | 'b') => {
                const d = data(t);
                const desktop = phase === 'a' ? d.a : d.b;
                const mobile = phase === 'a' ? d.aSm : d.bSm;
                return (small() ? mobile : desktop) ?? desktop ?? d.b;
            };
            const aimX = (phase: 'a' | 'b') => (_i: number, t: Element) =>
                aim(t, phase).x * stage.clientWidth;
            const aimY = (phase: 'a' | 'b') => (_i: number, t: Element) =>
                aim(t, phase).y * stage.clientHeight;
            const aimS = (phase: 'a' | 'b', mul = 1) => (_i: number, t: Element) =>
                (aim(t, phase).s ?? 1) * mul;

            // ── PHASE 0 — an empty stage ───────────────────────────────────
            gsap.set(testiRef.current, { xPercent: 100 });
            gsap.set(q('.hm-text-shield'), { autoAlpha: 0, y: 24, scale: 0.96 });
            gsap.set(q('[data-tm-head] > *'), { y: 26, autoAlpha: 0 });
            /* The CARDS are deliberately NOT hidden. They cross the screen fully
               set — mark, quote and byline all legible — because a blank rounded
               box sliding in reads as a loading state, and because the logos are
               supposed to be wrapping around a card, which means there has to be
               a card there to wrap. Only the section header is held back. */
            /**
             * Park all 23 below the bottom of the viewport, hidden.
             *
             * Centred on their own x/y by xPercent/yPercent — held inside GSAP's
             * transform, so it survives every tween of x/y/scale below and stays
             * correct at any scale. A Tailwind `-translate-x-1/2` would not: GSAP
             * writes `translate: none` on anything it animates.
             */
            const park = () =>
                gsap.set(layers, {
                    xPercent: -50,
                    yPercent: -50,
                    x: (_i: number, t: Element) => aim(t, 'a').x * stage.clientWidth,
                    y: () => stage.clientHeight * OFFSCREEN,
                    scale: 0.7,
                    autoAlpha: 0,
                });
            park();

            // ── The water ──────────────────────────────────────────────────
            const fluid = createLogoFluid({
                stage,
                marks: layers.map((outer) => ({
                    outer,
                    body: outer.firstElementChild as HTMLElement,
                    wave: (outer.dataset.wave === '2' ? 2 : 1) as 1 | 2,
                    phase: Number(outer.dataset.phase) || 0,
                })),
                obstacles: [
                    {
                        /* The text block. `x` because these marks arrive from
                           below: turning them aside is what splits the field
                           around it, where damming them underneath would just
                           stack them. Negative pad because the shield's radial
                           mask dissolves well inside its box — the collider has
                           to match the visible mass. Desktop only: on a phone the
                           heading spans nearly the full width, so there is no way
                           around it and the blur has to carry the read instead. */
                        el: q('.hm-text-shield')[0] as HTMLElement | undefined,
                        prefer: 'x',
                        bias: 0.45,
                        pad: -20,
                        media: '(min-width: 768px)',
                    },
                    {
                        /* The testimonial cards — the hull.

                           The RAIL, not the block around it. This used to point
                           at [data-tm-obstacle], described there as the card's
                           painted extent, which it is not: that box also carries
                           7vh of padding top and bottom and the section
                           headline, and the headline is held at autoAlpha 0
                           until the very end but still takes its 105px of
                           layout. Measured, the barrier came out 612px of a
                           720px stage — 86px of clearance above, of which the
                           top wall owns 64, and 22px below.

                           That is why marks ended up behind the cards rather
                           than around them. There was no around. Every route out
                           was closed, so the resolution fell back to the
                           shortest one and left them where they started, and
                           `prefer: 'x'` only turned the failure sideways: the
                           short way out of a full-width barrier is a long slide
                           across its face, which is the drift.

                           Dividing over and under it does not work either, and
                           the reason is arithmetic. The rail leaves 199px above
                           and 60px below. A mark at flow scale is up to 150px
                           tall. Making them all fit means shrinking them to
                           roughly a third — which is exactly the "they get
                           relatively small" complaint. Full size and divide
                           around a near-full-height barrier are incompatible;
                           the room does not exist at any bias.

                           So the card ploughs instead — see `push`. Everything
                           the leading edge reaches is driven LEFT, ahead of it,
                           at full size. Nothing is ever behind the card, because
                           nothing is ever passed by it. The left wall opens as
                           it comes so the water it displaces has somewhere to
                           go, and the sweep clears whatever is still afloat. */
                        el: q('[data-tm-viewport]')[0] as HTMLElement | undefined,
                        prefer: 'x',
                        bias: 0.4,
                        push: 'left',
                        pad: 14,
                    },
                ],
                /* Three walls flush with the viewport so the pool can fill it
                   edge to edge. `top` is the exception: the site header is fixed
                   over the stage and would slice anything pressed against it. */
                walls: { top: 64, right: 0, bottom: 0, left: 0 },
                enabled: !reduced,
            });

            /* The text block is the one thing on the stage before any scroll, so
               its reveal is the only unscrubbed motion here. Everything the logos
               do is on the scrubbed timeline below. */
            ScrollTrigger.create({
                trigger: stage,
                start: 'top 78%',
                once: true,
                onEnter: () =>
                    gsap.to(q('.hm-text-shield'), {
                        autoAlpha: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.9,
                        ease: 'power3.out',
                    }),
            });

            // ── PHASES 1–4 — pinned and scrubbed ───────────────────────────
            const tl = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: stage,
                    start: 'top top',
                    /* The timeline runs about 12.5 units; this maps them onto 9.5
                       viewports of scroll, so a unit is roughly three quarters of
                       a screen. Scrub maps progress to progress, so the two
                       numbers are independent — this one is purely how much
                       scrolling the four phases are worth. */
                    end: () => '+=' + window.innerHeight * 9.5,
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true,
                    onRefresh: () => fluid.measure(),
                },
            });

            /**
             * One entrance, used twice.
             *
             * `sine.out` on a 0.08 stagger is the wavy part. Each mark leaves the
             * bottom of the screen a beat after the one before it, so a wave
             * crosses as a travelling wavefront rather than a block, and each mark
             * decelerates on a sine as it arrives. The solver's swell rides on top
             * at full amplitude and settles to the idle 15px as they land.
             *
             * `fromTo`, and the start is the parked state — off the bottom of the
             * screen at the target's own x, so the climb is vertical. That matters
             * for more than determinism under `invalidateOnRefresh`: re-initialising
             * a `fromTo` stamps its start values onto the targets there and then,
             * so the start had better be somewhere harmless. Off-screen is.
             */
            const waveIn = (
                pool: HTMLElement[],
                phase: 'a' | 'b',
                scaleMul: number,
                at: number,
                swellKey: 'wave1' | 'wave2'
            ) => {
                tl.fromTo(
                    pool,
                    {
                        x: aimX(phase),
                        y: () => stage.clientHeight * OFFSCREEN,
                        scale: 0.7,
                        autoAlpha: 0,
                        immediateRender: false,
                    },
                    {
                        x: aimX(phase),
                        y: aimY(phase),
                        scale: aimS(phase, scaleMul),
                        autoAlpha: 1,
                        duration: WAVE_DUR,
                        stagger: WAVE_STAGGER,
                        ease: 'sine.out',
                    },
                    at
                );
                /* Outlasts the tween on purpose — the pool keeps working itself
                   out into the corners under the solver's pressure for a beat
                   after the marks are nominally home. */
                tl.fromTo(
                    fluid.swell,
                    { [swellKey]: 1, immediateRender: false },
                    { [swellKey]: 0, duration: WAVE_DUR + 0.8, ease: 'power2.out' },
                    at + 0.3
                );
            };

            // ── PHASE 1 — wave 1 waves in, with the scroll ─────────────────
            waveIn(pool1, 'a', 1, W1_IN, 'wave1');

            /* ── PHASE 2 — wave 1 drifts up, then wave 2 waves in ───────────
               The container has to be unsealed before anything can stream out of
               it: a field pressed to the brim against four rigid walls has
               nowhere to go, so the top wall opens as the drift begins. Only the
               top — the sides and floor stay rigid, which is what keeps the pool
               pinned edge to edge throughout. */
            tl.to(fluid.walls, { top: -700, duration: DRIFT_DUR * 0.5, ease: 'power2.in' }, DRIFT_AT);
            /* …and closed again once wave 2 is nearly home. `power2.out` so the
               ceiling arrives quickly and then eases the last of the way down,
               which reads as the pool settling under it rather than as a lid
               being slammed on a field that was mid-climb. */
            tl.to(fluid.walls, { top: 64, duration: LID_DUR, ease: 'power2.out' }, LID_BACK);

            /* A plain `to`: its start is wherever wave 1's entrance left it, which
               on this one scrubbed timeline is deterministic — the entrance is
               finished by DRIFT_AT. Deliberately not a `fromTo`, because that would
               stamp wave 1's phase-1 positions onto the marks on every refresh, and
               before the entrance has run that means a populated stage when the
               brief calls for an empty one. */
            tl.to(
                pool1,
                {
                    x: aimX('b'),
                    y: aimY('b'),
                    scale: aimS('b', FLOW_SCALE),
                    duration: DRIFT_DUR,
                    ease: 'power1.inOut',
                    stagger: 0.04,
                },
                DRIFT_AT
            );

            // Wave 2, the same entrance, into the half wave 1 has just vacated.
            waveIn(pool2, 'b', FLOW_SCALE, W2_IN, 'wave2');

            /* ── PHASE 3 — the block goes, the panel crosses in ─────────────
               Below 0.08 opacity the solver stops treating the shield as a
               collider, so the pool relaxes back toward centre as it dissolves. */
            tl.to(q('.hm-text-shield'), { autoAlpha: 0, scale: 0.9, y: -34, duration: 0.55, ease: 'power2.in' }, SHIELD_OUT);

            /* The left wall opens as the hull arrives, and only the left.
               A ploughing barrier drives every mark it reaches the same way, so
               without an opening on that side the field is pressed into a rigid
               wall and compacts until marks are sitting on top of one another —
               the container has to vent in the direction the water is going.
               Same trick as the top wall at DRIFT_AT, same reason.

               The opening has to be big, and -1200 was not: 23 marks at flow
               scale need roughly 1500px of stage to sit in without touching, and
               once the hull is three quarters across it has left them about 500.
               A wall at -1200 caps the overflow at one screen, so the surplus had
               nowhere to be except on top of itself — measured at the crossing,
               31 overlapping pairs, the worst of them 92% of a mark. The number
               below is not a position anything reaches; it is the guarantee that
               the field is never asked to fit somewhere it does not. */
            tl.to(fluid.walls, { left: -2600, duration: 0.7, ease: 'power2.in' }, PANEL_AT - 0.25);

            /* The testimonials arrive with NO background of their own, so there is
               no opaque sheet wiping across the screen; the content simply takes
               the space. The card box inside is a live `y` collider, so as its
               leading edge advances the pool divides around it — marks above go
               over the top, marks below go under. That is the solver reading the
               card's moving box every frame, not a scripted curve. */
            tl.to(testiRef.current, { xPercent: 0, duration: PANEL_DUR, ease: 'power2.inOut' }, PANEL_AT);

            /* ── PHASE 4 — the sweep, on the halfway frame ──────────────────
               `xPercent: -200` is a mark-and-a-half of its own width to the left,
               which is the shove; it is not on its own enough to clear a stage
               1920px wide from a mark sitting at 92% of it, so `x` carries the
               rest. Together they put every mark's centre a full stage width past
               the left edge inside 0.4s.

               The stagger is a tenth of the tween's own length and runs right to
               left, so it reads as one shove propagating across the pool rather
               than 23 separate exits. */
            /* One shove, all of it left.
               There is no astern group any more, and that is a consequence of
               the plough rather than a change of mind: if every mark the hull
               reaches has been driven forward, nothing is ever beside or behind
               it, so nothing has an aft route to take. Sending marks right from
               here would drag them back across the face of the card they just
               spent the whole crossing staying ahead of.
               Furthest forward leaves first, so it reads as the leading edge of
               the bank spilling off the screen and the rest following. */
            tl.to(
                layers,
                {
                    xPercent: -200,
                    x: () => -stage.clientWidth * 0.35,
                    duration: SWEEP_DUR,
                    ease: 'power2.in',
                    stagger: (_i, t) => aim(t, 'b').x * 0.12,
                },
                SWEEP_AT
            );
            /* The solver lets go, but over half a unit rather than a fifth of
               one. Left running it would keep shoving marks back around the card
               while they are supposed to be leaving; cut too fast and every
               mark's displacement collapses to nothing in a few frames, which
               snaps the whole field back onto its targets just as it starts to
               move. Fading it lets the water still be water on the way out. */
            tl.to(fluid.gain, { value: 0, duration: 0.5, ease: 'power2.in' }, SWEEP_AT + 0.1);

            /* The section header lands once the sweep has cleared the stage — it
               sits over open background, so it would be landing through logos if
               it arrived any earlier. The cards themselves need no reveal: they
               crossed the screen already set. */
            tl.to(q('[data-tm-head] > *'), {
                y: 0,
                autoAlpha: 1,
                duration: 0.5,
                stagger: 0.12,
                ease: 'power3.out',
            }, Math.max(PANEL_END, SWEEP_END) + 0.1);

            const rail = q('[data-tm-rail]')[0] as HTMLElement | undefined;
            const tmView = q('[data-tm-viewport]')[0] as HTMLElement | undefined;
            if (rail && tmView) {
                const travel = () => Math.max(0, rail.scrollWidth - tmView.clientWidth);
                tl.fromTo(rail, { x: 0, immediateRender: false }, { x: () => -travel(), duration: 2.2 }, PANEL_END + 0.9);
            }

            // Hold on the last quote before the pin releases.
            tl.to({}, { duration: 0.4 }, PANEL_END + 3.2);

            return () => fluid.destroy();
        },
        { scope: rootRef }
    );

    return (
        <div ref={rootRef} className="second-section relative h-screen w-full overflow-hidden">
            {/* Logo field — this panel never moves; the marks inside it do. */}
            <div ref={marqueeRef} className="absolute inset-0 w-full h-full">
                <HomeMarquee />
            </div>
            {/* Testimonials — crosses in from the right, and is a live collider to
                the logo pool the whole way across. */}
            {/* z-30 is not decoration. Both panels were `absolute` with an auto
                z, so their order came from the DOM alone — which put the
                testimonials on top, but only barely, and left the marquee's own
                z-20 text block painting OVER them. Stating it removes the
                ambiguity: the panel is above the water, always. */}
            <div ref={testiRef} className="absolute inset-0 z-30 w-full h-full">
                <FloatingTestimonials embedded />
            </div>
        </div>
    );
}
