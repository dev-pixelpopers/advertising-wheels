'use client';

/**
 * OrbitDiagram — cards → hub-and-spoke, driven by scroll.
 *
 * Phase 1: four cards sit in a loose 2×2 grid, one of them the accent card.
 * Phase 2: as you scroll, the accent card moves to the centre and morphs into a
 * circle — the hub — while the others settle onto an orbit around it, reveal
 * their full body copy, and short connector lines draw from the hub's edge out
 * to each card's edge.
 *
 * Geometry is measured at runtime (hub radius + card size + gap) rather than
 * guessed, and expressed as function-based values so it recomputes on refresh /
 * resize. The connectors are trimmed at both ends — they start on the circle's
 * circumference and stop on the card's rectangle edge (exact ray/rect
 * intersection), which is what gives the clean spoke look.
 *
 * The section is a tall track with a pinned full-height screen, so the pin
 * reserves real layout space and the next section can never ride over it.
 * Scrubbed, so it reverses on the way up; skipped under reduced motion, where
 * the finished orbit renders directly.
 */

import { ReactNode, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Logo from '@/components/Logo';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export interface OrbitNode {
    title: string;
    role?: string;
    /** Full copy — revealed once the card reaches its orbit position. */
    body?: string;
    mono?: string;
    /** SVG path `d` for the card's icon. */
    icon?: string;
}

export interface OrbitDiagramProps {
    hub: OrbitNode;
    nodes: OrbitNode[];
    eyebrow?: ReactNode;
    heading?: ReactNode;
    intro?: ReactNode;
    /**
     * Render the plain stacked list instead of the orbit. Set by the caller
     * from a viewport query — the orbit needs a stage no narrow screen has.
     */
    stacked: boolean;
}

/** Loose 2×2 starting grid — fractions of the stage's half-width / half-height. */
const HUB_START = { x: 0.22, y: -0.28 };
const SAT_START = [
    { x: -0.22, y: -0.30 },
    { x: -0.22, y: 0.28 },
    { x: 0.24, y: 0.30 },
    { x: 0.52, y: -0.02 },
];

/**
 * Every card starts at the SAME visual size (this many px on its longest side),
 * so the opening grid reads as four matching tiles regardless of the different
 * natural sizes they grow into. The per-element scale is derived at runtime.
 */
const START_BOX = 148;

/**
 * Self-centring, applied to every element GSAP drives on the stage.
 *
 * The markup centres the hub and the cards with `left-1/2 top-1/2` plus
 * `-translate-x-1/2 -translate-y-1/2`, which Tailwind v4 emits as the CSS
 * `translate` PROPERTY. GSAP writes `translate: none` on anything it transforms
 * — it has to, or its own `transform` would compose on top of a value it does
 * not control — and that silently throws the centring away. The elements then
 * hang off the stage centre by their own top-left corner, so every card sat
 * half its own width right and half its height low of the orbit position the
 * geometry had computed. Invisible in a small layout, glaring in a wide one:
 * the offset is half the CARD, so it grew with the breakpoint.
 *
 * Doing the shift as xPercent/yPercent keeps it inside GSAP's transform, where
 * it survives every later tween of x/y/scale and stays correct at any scale.
 */
const CENTRE = { xPercent: -50, yPercent: -50 } as const;

export default function OrbitDiagram({ hub, nodes, eyebrow, heading, intro, stacked }: OrbitDiagramProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const screenRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const hubRef = useRef<HTMLDivElement>(null);
    const satRefs = useRef<(HTMLDivElement | null)[]>([]);
    const lineRefs = useRef<(SVGLineElement | null)[]>([]);

    useGSAP(
        () => {
            if (stacked) return;
            const stage = stageRef.current;
            const hubEl = hubRef.current;
            if (!stage || !hubEl) return;

            const n = nodes.length;

            const half = () => ({ w: stage.clientWidth / 2, h: stage.clientHeight / 2 });

            /** Angles: top-left, right-middle, bottom-left — as in the sketch. */
            const angleFor = (i: number) => ((-150 + (i * 300) / Math.max(1, n - 1)) * Math.PI) / 180;
            const angles = Array.from({ length: n }, (_, i) => angleFor(i));

            /**
             * Orbit radii — an ELLIPSE, not a circle, because the two axes are
             * solving different problems. Horizontally a card only has to clear
             * the hub; vertically the cards stacked on the same side have to
             * clear EACH OTHER, which at these angles needs roughly a full card
             * height of separation. One shared radius has to satisfy whichever
             * demand is larger, so on a stage that is wider than it is tall the
             * cards either collide or get pushed off the edge — measured
             * independently, each axis uses the room it actually has.
             */
            const radii = () => {
                const { w: halfW, h: halfH } = half();
                const hubR = hubEl.offsetWidth / 2;
                const satW = Math.max(...nodes.map((_, i) => satRefs.current[i]?.offsetWidth || 0), 0);
                const satH = Math.max(...nodes.map((_, i) => satRefs.current[i]?.offsetHeight || 0), 0);

                const cosMax = Math.max(...angles.map((a) => Math.abs(Math.cos(a))), 0.001);
                const sinMax = Math.max(...angles.map((a) => Math.abs(Math.sin(a))), 0.001);

                // Ceilings: the outermost card on each axis must stay on stage.
                const rxCap = Math.max(0, halfW - satW / 2 - 6) / cosMax;
                const ryCap = Math.max(0, halfH - satH / 2 - 6) / sinMax;

                let rx = Math.min(hubR + satW / 2 + 56, rxCap);

                // Vertical: every pair of cards that shares horizontal space
                // needs a real gap between them. That separation — not the
                // distance out to the hub — is what ry is for.
                let ry = Math.min(hubR + satH / 2 + 40, ryCap);
                for (let i = 0; i < n; i += 1) {
                    for (let j = i + 1; j < n; j += 1) {
                        const apart = Math.abs(Math.cos(angles[i]) - Math.cos(angles[j])) * rx;
                        if (apart >= satW + 16) continue; // side by side — no vertical demand
                        const dSin = Math.abs(Math.sin(angles[i]) - Math.sin(angles[j]));
                        if (dSin < 0.001) continue;
                        ry = Math.min(Math.max(ry, (satH + 28) / dSin), ryCap);
                    }
                }

                // A card still sitting level with the hub has to clear it sideways.
                angles.forEach((a) => {
                    const c = Math.abs(Math.cos(a));
                    if (c < 0.001) return;
                    if (Math.abs(Math.sin(a)) * ry >= hubR + satH / 2) return;
                    rx = Math.min(Math.max(rx, (hubR + satW / 2 + 20) / c), rxCap);
                });

                return { rx: Math.max(rx, hubR + 40), ry: Math.max(ry, hubR + 40) };
            };

            /** Card centre for spoke `i`, on the measured ellipse. */
            const posFor = (i: number) => {
                const { rx, ry } = radii();
                return { x: Math.cos(angles[i]) * rx, y: Math.sin(angles[i]) * ry };
            };

            /**
             * Draw each spoke from the circle's edge to the card's edge.
             * The card end uses an exact ray/rectangle intersection so the line
             * stops flush against whichever side it meets.
             */
            const syncLines = () => {
                /**
                 * Everything here is MEASURED, not inferred from the tween values.
                 *
                 * The cards carry Tailwind's `-translate-x-1/2 -translate-y-1/2`
                 * (the CSS `translate` property) as well as GSAP's `transform`,
                 * and CSS applies `translate` BEFORE `transform`. So a card's real
                 * centre is `x + (scale - 1) * width / 2`, not `x`. Reading the
                 * tween's x/y directly was therefore right only at scale 1 — every
                 * mid-flight frame drew the spoke toward a point up to half a
                 * card's width away from where the card actually was, and the
                 * error grew with the card, so the widest layouts hurt most.
                 *
                 * getBoundingClientRect already has every transform folded in, so
                 * it cannot drift from what is on screen.
                 */
                const sRect = stage.getBoundingClientRect();
                const hRect = hubEl.getBoundingClientRect();
                const hubCx = hRect.left + hRect.width / 2 - sRect.left;
                const hubCy = hRect.top + hRect.height / 2 - sRect.top;
                // The hub is square and ends as a circle; min() keeps the start
                // point on the disc no matter how far the morph has run.
                const hubR = Math.min(hRect.width, hRect.height) / 2;

                nodes.forEach((_, i) => {
                    const el = satRefs.current[i];
                    const line = lineRefs.current[i];
                    if (!el || !line) return;

                    const cRect = el.getBoundingClientRect();
                    const cx = cRect.left + cRect.width / 2 - sRect.left;
                    const cy = cRect.top + cRect.height / 2 - sRect.top;

                    const dx = cx - hubCx;
                    const dy = cy - hubCy;
                    const dist = Math.hypot(dx, dy) || 1;
                    const ux = dx / dist;
                    const uy = dy / dist;

                    // Where the ray leaves the card's rectangle, at its live size.
                    const hw = cRect.width / 2;
                    const hh = cRect.height / 2;
                    const tx = Math.abs(ux) > 1e-3 ? hw / Math.abs(ux) : Infinity;
                    const ty = Math.abs(uy) > 1e-3 ? hh / Math.abs(uy) : Infinity;
                    let tCard = Math.min(tx, ty);

                    // Stop on the rounded corner's arc rather than in the empty
                    // square outside it. Radius scales with the card.
                    const scale = el.offsetWidth ? cRect.width / el.offsetWidth : 1;
                    const r = 22 * scale;
                    if (Math.abs(ux) * tCard > hw - r && Math.abs(uy) * tCard > hh - r) {
                        const B = Math.abs(ux) * (hw - r) + Math.abs(uy) * (hh - r);
                        const C = Math.pow(hw - r, 2) + Math.pow(hh - r, 2) - Math.pow(r, 2);
                        const disc = B * B - C;
                        if (disc > 0) tCard = B + Math.sqrt(disc);
                    }

                    const x1 = hubCx + ux * (hubR + 4);
                    const y1 = hubCy + uy * (hubR + 4);
                    const x2 = cx - ux * tCard;
                    const y2 = cy - uy * tCard;

                    // Hide the spoke while the card still overlaps the hub.
                    const visible = dist > hubR + tCard + 2;
                    line.setAttribute('x1', String(x1));
                    line.setAttribute('y1', String(y1));
                    line.setAttribute('x2', String(visible ? x2 : x1));
                    line.setAttribute('y2', String(visible ? y2 : y1));
                });
            };

            const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            /* Reduced motion → render the finished orbit. */
            if (reduced) {
                gsap.set(hubEl, { ...CENTRE, x: 0, y: 0, scale: 1, borderRadius: '50%' });
                nodes.forEach((_, i) => {
                    const el = satRefs.current[i];
                    if (!el) return;
                    const p = posFor(i);
                    gsap.set(el, { ...CENTRE, x: p.x, y: p.y, scale: 1 });
                });
                gsap.set('[data-sat-icon]', { autoAlpha: 0 });
                gsap.set('[data-sat-copy]', { autoAlpha: 1 });
                gsap.set('[data-hub-logo]', { autoAlpha: 0 });
                gsap.set('[data-hub-copy]', { autoAlpha: 1 });
                gsap.set(lineRefs.current.filter(Boolean), { autoAlpha: 1, strokeDashoffset: 0 });
                syncLines();
                return;
            }

            /* ---- Start: a small, loose 2×2 grid of equally-sized tiles ---- */
            // Scale each card so its longest side lands on START_BOX — that is
            // what makes the four opening tiles match.
            const startScale = (el: HTMLElement) =>
                START_BOX / Math.max(el.offsetWidth, el.offsetHeight, 1);

            gsap.set(hubEl, {
                ...CENTRE,
                x: () => HUB_START.x * half().w,
                y: () => HUB_START.y * half().h,
                scale: () => startScale(hubEl),
                borderRadius: '30px',
            });
            nodes.forEach((_, i) => {
                const el = satRefs.current[i];
                if (!el) return;
                const p = SAT_START[i] ?? SAT_START[0];
                gsap.set(el, {
                    ...CENTRE,
                    x: () => p.x * half().w,
                    y: () => p.y * half().h,
                    scale: () => startScale(el),
                });
            });
            // Every card starts as just its icon / the mark. autoAlpha keeps the
            // copy's layout space, so the cards never resize when it appears.
            gsap.set('[data-sat-icon]', { autoAlpha: 1 });
            gsap.set('[data-sat-copy]', { autoAlpha: 0 });
            gsap.set('[data-hub-logo]', { autoAlpha: 1 });
            gsap.set('[data-hub-copy]', { autoAlpha: 0 });
            lineRefs.current.forEach((l) => l && gsap.set(l, { autoAlpha: 0, strokeDashoffset: 1 }));
            syncLines();

            const tl = gsap.timeline({
                defaults: { ease: 'power2.inOut' },
                /**
                 * Redraw the spokes on every frame the PLAYHEAD moves — not on
                 * every frame the SCROLL moves.
                 *
                 * `scrub` keeps easing this timeline for a beat after the last
                 * scroll event, and the trigger's own `onUpdate` does not fire
                 * during that catch-up. Driving the spokes from there left them
                 * frozen wherever scrolling stopped while the cards glided on to
                 * their final positions — visibly detached, worst on whichever
                 * card settles last (the third, whose tween starts latest).
                 */
                onUpdate: syncLines,
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'top top',
                    end: 'bottom bottom',
                    pin: screenRef.current,
                    anticipatePin: 1,
                    scrub: 0.8,
                    invalidateOnRefresh: true,
                    // Resize / re-measure still has to redraw them.
                    onRefresh: syncLines,
                },
            });

            // Accent card → centre, growing and rounding into the circle.
            tl.to(hubEl, { x: 0, y: 0, scale: 1, borderRadius: '50%', duration: 1 }, 0);

            // The others settle onto the orbit and expand to full size.
            nodes.forEach((_, i) => {
                const el = satRefs.current[i];
                if (!el) return;
                tl.to(
                    el,
                    { x: () => posFor(i).x, y: () => posFor(i).y, scale: 1, duration: 1 },
                    0.08 + i * 0.05
                );
            });

            // Spokes draw out from the circle once everything is in place.
            lineRefs.current.forEach((line, i) => {
                if (!line) return;
                tl.to(line, { autoAlpha: 1, strokeDashoffset: 0, duration: 0.4, ease: 'power2.out' }, 0.85 + i * 0.07);
            });

            // Each icon dissolves once its card has landed, handing off to the
            // full detail — the hub's mark does exactly the same thing.
            tl.to('[data-hub-logo]', { autoAlpha: 0, scale: 0.9, duration: 0.3 }, 0.72);
            tl.to('[data-sat-icon]', { autoAlpha: 0, scale: 0.9, duration: 0.3, stagger: 0.06 }, 0.76);

            tl.fromTo('[data-hub-copy]', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.35 }, 0.9);
            tl.fromTo('[data-sat-copy]', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.07 }, 0.94);

            // Hold on the finished diagram before releasing the pin.
            tl.to({}, { duration: 0.35 });
        },
        { scope: rootRef, dependencies: [stacked] }
    );

    if (stacked) {
        /* Narrow — a plain stacked list. No pin, no absolute orbit geometry;
           the hub reads as an accent card up top and the satellites follow
           in a simple grid, all copy shown up front. */
        return (
            <section
                ref={rootRef}
                className="relative w-full bg-[#EEE8D9] px-5 md:px-8 lg:px-12 py-12 md:py-16 lg:py-24 transition-colors duration-300 dark:bg-[#0A0A0A]"
            >
                {/* Widens with the viewport — at tablet and small-laptop sizes a
                    560px column would leave most of the row empty. */}
                <div className="mx-auto w-full max-w-[560px] md:max-w-[880px] lg:max-w-[1120px]">
                    {(eyebrow || heading || intro) && (
                        <div>
                            {eyebrow}
                            {heading}
                            {intro}
                        </div>
                    )}

                    <div
                        className="mt-8 rounded-[22px] bg-[#FCD119] p-6 md:p-8 text-center"
                        style={{ boxShadow: '0 24px 60px -30px rgba(0,0,0,.4)' }}
                    >
                        <div className="mx-auto flex w-fit items-center justify-center [&_path]:!fill-[#1A1917]">
                            <Logo width={116} height={48} />
                        </div>
                        {hub.mono && (
                            <span className="mt-4 block font-tommy-regular text-[10px] uppercase tracking-[2.5px] text-black/55">
                                {hub.mono}
                            </span>
                        )}
                        <p className="mt-1.5 font-tommy-bold text-[19px] leading-[1.1] tracking-tight text-black">
                            {hub.title}
                        </p>
                        {hub.role && (
                            <p className="mt-1 font-tommy-regular text-[10px] uppercase tracking-[1.5px] text-black/60">
                                {hub.role}
                            </p>
                        )}
                        {hub.body && (
                            <p className="mx-auto mt-2.5 max-w-[92%] font-tommy-regular text-[12.5px] leading-[1.5] text-black/70">
                                {hub.body}
                            </p>
                        )}
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-6 md:gap-6 lg:grid-cols-3">
                        {nodes.map((nd) => (
                            <div
                                key={nd.title}
                                className="h-full rounded-[20px] border border-black/10 bg-white/90 p-5 md:p-6 text-left shadow-[0_18px_40px_-28px_rgba(0,0,0,.4)] dark:border-white/10 dark:bg-white/[0.06]"
                            >
                                <div className="flex items-center gap-2.5">
                                    {nd.icon && (
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FCD119] text-black">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                <path d={nd.icon} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                    )}
                                    {nd.mono && (
                                        <span className="font-tommy-bold text-[10.5px] uppercase tracking-[2px] text-[#C8992B] dark:text-[#FCD119]">
                                            {nd.mono}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-3 font-tommy-bold text-[16px] leading-[1.15] tracking-tight text-[#1A1917] dark:text-white">
                                    {nd.title}
                                </p>
                                {nd.role && (
                                    <p className="mt-1.5 font-tommy-regular text-[10.5px] uppercase tracking-[1.5px] text-[#8A857C] dark:text-[#9A968E]">
                                        {nd.role}
                                    </p>
                                )}
                                {nd.body && (
                                    <p className="mt-3 font-tommy-regular text-[13px] leading-[1.55] text-[#5A554C] dark:text-[#A8A399]">
                                        {nd.body}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        /* Tall track — its height IS the scroll distance the pin consumes. */
        <section
            ref={rootRef}
            className="relative w-full bg-[#EEE8D9] transition-colors duration-300 dark:bg-[#0A0A0A]"
            style={{ height: '300vh' }}
        >
            <div ref={screenRef} className="flex h-screen w-full flex-col justify-center overflow-hidden py-10">
                {/* The stage takes the larger share of the row — the orbit needs
                    real width before the cards can sit clear of the hub.
                    minmax(0,…) on both tracks, or the heading's min-content width
                    quietly claims space back from the stage and the orbit tightens. */}
                <div className="mx-auto grid w-full max-w-[1560px] grid-cols-1 items-center gap-8 px-6 md:px-8 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,1.38fr)] lg:gap-10 lg:px-10">
                    {/* Left column — the copy */}
                    {(eyebrow || heading || intro) && (
                        <div className="max-w-[560px]">
                            {eyebrow}
                            {heading}
                            {intro}
                        </div>
                    )}

                    {/* Right column — the stage */}
                    <div
                        ref={stageRef}
                        /* Two cards stack on the left of the orbit, so the stage
                           needs roughly two card heights of room. It takes what
                           the pinned screen has left after its own padding. */
                        className="relative h-[clamp(480px,calc(100vh-120px),820px)] w-full"
                    >
                        {/* Spokes (behind the cards) */}
                        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                            {nodes.map((nd, i) => (
                                <line
                                    key={nd.title}
                                    ref={(el) => { lineRefs.current[i] = el; }}
                                    className="text-[#C8992B] dark:text-[#FCD119]"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeDasharray="1"
                                    pathLength="1"
                                    opacity="0"
                                />
                            ))}
                        </svg>

                        {/* Hub — the accent card that becomes the circle */}
                        <div
                            ref={hubRef}
                            className="absolute left-1/2 top-1/2 z-20 flex h-[clamp(150px,13.5vw,186px)] w-[clamp(150px,13.5vw,186px)] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center bg-[#FCD119] p-4 text-center will-change-transform"
                            style={{ boxShadow: '0 30px 70px -35px rgba(0,0,0,.45)' }}
                        >
                            {/* The mark shows while the card is still a card, then
                                dissolves as the hub forms and hands off to the copy. */}
                            <div
                                data-hub-logo
                                className="absolute inset-0 flex items-center justify-center [&_path]:!fill-[#1A1917]"
                            >
                                <Logo width={132} height={56} />
                            </div>

                            <div data-hub-copy className="flex flex-col items-center">
                                {hub.mono && (
                                    <span className="font-tommy-regular text-[9.5px] uppercase tracking-[2.5px] text-black/55">{hub.mono}</span>
                                )}
                                <div className="mt-1.5 font-tommy-bold text-[clamp(15px,1.7vw,20px)] leading-[1.1] tracking-tight text-black">
                                    <img src="/assets/images/logo.svg" className="w-[90px]" />
                                </div>
                                {hub.role && (
                                    <p className="mt-1 font-tommy-regular text-[9.5px] uppercase tracking-[1.5px] text-black/60">{hub.role}</p>
                                )}
                                {hub.body && (
                                    <p data-hub-body className="mt-2 max-w-[90%] font-tommy-regular text-[11px] leading-[1.4] text-black/70">
                                        {hub.body}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Satellite cards — sized to hold their full copy */}
                        {nodes.map((nd, i) => (
                            <div
                                key={nd.title}
                                ref={(el) => { satRefs.current[i] = el; }}
                                className="absolute left-1/2 top-1/2 z-10 flex w-[clamp(262px,19.5vw,304px)] -translate-x-1/2 -translate-y-1/2 flex-col justify-center rounded-[22px] border border-black/10 bg-white/90 p-6 text-left shadow-[0_22px_50px_-32px_rgba(0,0,0,.45)] backdrop-blur-sm will-change-transform dark:border-white/10 dark:bg-white/[0.06]"
                            >
                                {/* Icon-only state — all the card shows until it lands. */}
                                {nd.icon && (
                                    <div data-sat-icon className="absolute inset-0 flex items-center justify-center">
                                        <span className="flex h-[104px] w-[104px] items-center justify-center rounded-full bg-[#FCD119] text-black">
                                            <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
                                                <path d={nd.icon} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                    </div>
                                )}

                                {/* Full detail — revealed once the card reaches its orbit. */}
                                <div data-sat-copy>
                                    <div className="flex items-center gap-2.5">
                                        {nd.icon && (
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FCD119] text-black">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                    <path d={nd.icon} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </span>
                                        )}
                                        {nd.mono && (
                                            <span className="font-tommy-bold text-[10.5px] uppercase tracking-[2px] text-[#C8992B] dark:text-[#FCD119]">
                                                {nd.mono}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-3 font-tommy-bold text-[17px] leading-[1.15] tracking-tight text-[#1A1917] dark:text-white">
                                        {nd.title}
                                    </p>
                                    {nd.role && (
                                        <p className="mt-1.5 font-tommy-regular text-[11px] uppercase tracking-[1.5px] text-[#8A857C] dark:text-[#9A968E]">
                                            {nd.role}
                                        </p>
                                    )}
                                    {nd.body && (
                                        <p className="mt-3.5 font-tommy-regular text-[13px] leading-[1.55] text-[#5A554C] dark:text-[#A8A399]">
                                            {nd.body}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
