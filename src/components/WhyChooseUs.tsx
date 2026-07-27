'use client';

/**
 * WhyChooseUs — Apple-style pinned scroll story: "Why Choose Us".
 *
 * A 400vh scroll track pins a full-screen split view (copy left 45%,
 * visualization right 55%) and scrubs a single master timeline through
 * four chapters:
 *
 *   1. The Smart Play          — HUD frame slices in around an isometric
 *                                truck chassis; a surface-area flag deploys.
 *   2. The Everywhere Illusion — the truck "rotates" to side view
 *                                (perspective rotateY crossfade), a liquid
 *                                brand-wrap bar floods the panel, social
 *                                particles drift from the tires.
 *   3. Your Canvas, Your Rules — camera pulls back, wireframe ghost fleet
 *                                fans out, geo pins pop over three cities.
 *   4. The Proof is in the     — the truck turns to glass revealing a neon
 *      Pavement                  grid engine; telemetry cards sprout with
 *                                live ticking impressions; high-beams pulse
 *                                to close the section.
 *
 * The "3D" is simulated with layered SVG assets + CSS perspective —
 * every scrubbed property is a compositor transform or opacity, so the
 * timeline stays at 60fps with no WebGL cost.
 */

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  Palette + copy                                                     */
/* ------------------------------------------------------------------ */

/* Brand palette — matches the rest of the site: the dark surface used by
   TruckExperience/MarketsCoverage, the signature yellow, and the cream that
   carries structure lines and muted copy. */
const INK = '#0A0A0A';      // section ground
const SURFACE = '#1A1917';  // panel / body fill
const PANEL = '#141414';    // recessed fill
const EDGE = '#4A4640';     // warm structural stroke
const BRAND = '#FCD119';    // accent — replaces the old emerald
const MUTED = '#9A968E';    // secondary copy on dark

const CHAPTERS = [
    {
        tag: '01 — Efficiency',
        title: 'The Smart Play',
        body: 'One truck. 600 square feet of uninterrupted brand canvas rolling through rush hour. That is 10x the efficiency of a static board — at a fraction of the cost.',
    },
    {
        tag: '02 — Reach',
        title: 'The Everywhere Illusion',
        body: 'The same vehicle seen on five highways feels like fifty. Sightings become photos, photos become posts — the earned-media flywheel starts spinning on its own.',
    },
    {
        tag: '03 — Scale',
        title: 'Your Canvas, Your Rules',
        body: 'Start with a single route. Scale to a synchronized fleet blanketing corridors from NYC to California. Your creative, your markets, your schedule.',
    },
    {
        tag: '04 — Proof',
        title: 'The Proof is in the Pavement',
        body: 'Every mile is measured. 24/7 GPS telemetry, audited impression modelling and wrap longevity reports — analytics that outlive any campaign flight.',
    },
];

const PINS = [
    { label: 'Manhattan, NY', left: '16%', top: '16%' },
    { label: 'Chicago, IL', left: '44%', top: '8%' },
    { label: 'Los Angeles, CA', left: '68%', top: '18%' },
];

/* Social-burst particles: position (viewport %) near the tires. */
const PARTICLES = [
    { left: '30%', top: '70%', kind: 'ring' },
    { left: '34%', top: '74%', kind: 'dot' },
    { left: '38%', top: '69%', kind: 'plus' },
    { left: '52%', top: '73%', kind: 'dot' },
    { left: '56%', top: '69%', kind: 'ring' },
    { left: '60%', top: '74%', kind: 'plus' },
    { left: '44%', top: '75%', kind: 'dot' },
    { left: '48%', top: '68%', kind: 'ring' },
] as const;

/* ------------------------------------------------------------------ */
/*  SVG truck assets                                                   */
/* ------------------------------------------------------------------ */

/**
 * Side-profile box truck, facing right.
 * `mode` swaps the material treatment:
 *   solid — dark body + liquid brand-wrap layer (class .wcu-wrapbar)
 *   ghost — neon wireframe silhouette (fleet duplicates)
 *   glass — translucent panels + internal neon grid "engine"
 */
function TruckSide({ mode }: { mode: 'solid' | 'ghost' | 'glass' }) {
    const ghost = mode === 'ghost';
    const glass = mode === 'glass';
    const bodyFill = ghost ? 'none' : glass ? 'rgba(252,209,25,0.07)' : SURFACE;
    const stroke = ghost ? 'rgba(252,209,25,0.45)' : glass ? BRAND : EDGE;

    return (
        <svg viewBox="0 0 520 260" className="h-auto w-full" aria-hidden="true">
            {mode === 'solid' && (
                <defs>
                    <linearGradient id="wcu-wrapgrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stopColor="#C8992B" />
                        <stop offset="0.55" stopColor={BRAND} />
                        <stop offset="1" stopColor="#FFE98A" />
                    </linearGradient>
                    <clipPath id="wcu-wrapclip">
                        <rect x="30" y="52" width="298" height="116" rx="6" />
                    </clipPath>
                </defs>
            )}

            {/* Trailer box */}
            <rect x="22" y="42" width="314" height="136" rx="10" fill={bodyFill} stroke={stroke} strokeWidth={ghost ? 2 : 1.5} />

            {/* Liquid brand-wrap: floods cab → tail via scaleX scrub */}
            {mode === 'solid' && (
                <g clipPath="url(#wcu-wrapclip)">
                    <rect className="wcu-wrapbar" x="30" y="52" width="298" height="116" fill="url(#wcu-wrapgrad)" />
                    {/* Simple brand shapes riding on the wrap */}
                    {/* Dark-on-yellow, the way the brand actually sits on a wrap. */}
                    <circle className="wcu-wrapbar-art" cx="90" cy="110" r="26" fill="rgba(26,25,23,0.9)" />
                    <rect className="wcu-wrapbar-art" x="140" y="96" width="120" height="10" rx="5" fill="rgba(26,25,23,0.92)" />
                    <rect className="wcu-wrapbar-art" x="140" y="118" width="76" height="10" rx="5" fill="rgba(26,25,23,0.55)" />
                </g>
            )}

            {/* Internal neon grid engine (glass mode only) */}
            {glass && (
                <g className="wcu-engine" stroke={BRAND} strokeWidth="0.8" opacity="0.55">
                    {[70, 118, 166, 214, 262, 310].map((x) => (
                        <line key={x} x1={x} y1="48" x2={x} y2="172" />
                    ))}
                    {[74, 106, 138].map((y) => (
                        <line key={y} x1="26" y1={y} x2="332" y2={y} />
                    ))}
                    {/* Glowing engine core */}
                    <circle cx="360" cy="150" r="16" fill={BRAND} opacity="0.25" stroke="none" />
                    <circle cx="360" cy="150" r="7" fill={BRAND} stroke="none" />
                </g>
            )}

            {/* Cab */}
            <path
                d="M 346 92 L 412 92 L 452 132 L 458 158 L 458 178 L 346 178 Z"
                fill={ghost ? 'none' : glass ? 'rgba(252,209,25,0.1)' : PANEL}
                stroke={stroke}
                strokeWidth={ghost ? 2 : 1.5}
            />
            {/* Windshield */}
            <path d="M 354 100 L 406 100 L 434 130 L 354 130 Z" fill={ghost || glass ? 'none' : INK} stroke={stroke} strokeWidth="1" />
            {/* Headlight (high-beam anchor) */}
            <rect x="452" y="150" width="8" height="12" rx="2" fill={ghost ? 'none' : BRAND} stroke={stroke} strokeWidth="0.8" />

            {/* Underbody + wheels */}
            <line x1="22" y1="192" x2="458" y2="192" stroke={stroke} strokeWidth="1" opacity="0.5" />
            {[92, 168, 398].map((cx) => (
                <g key={cx}>
                    <circle cx={cx} cy="200" r="26" fill={ghost ? 'none' : INK} stroke={stroke} strokeWidth={ghost ? 2 : 1.5} />
                    <circle cx={cx} cy="200" r="9" fill="none" stroke={ghost || glass ? BRAND : '#6B655C'} strokeWidth="1.5" />
                </g>
            ))}
        </svg>
    );
}

/** Stylized 3/4 isometric chassis — dark HUD wireframe treatment. */
function TruckIso() {
    return (
        <svg viewBox="0 0 520 300" className="h-auto w-full" aria-hidden="true">
            {/* Trailer side panel (skewed) */}
            <polygon points="42,78 348,52 348,196 42,222" fill={SURFACE} stroke={EDGE} strokeWidth="1.5" />
            {/* Trailer front face */}
            <polygon points="348,52 432,84 432,208 348,196" fill="#232120" stroke={EDGE} strokeWidth="1.5" />
            {/* Top sliver */}
            <polygon points="42,78 348,52 432,84 128,112" fill={PANEL} stroke={EDGE} strokeWidth="1" opacity="0.9" />
            {/* Panel seams */}
            <g stroke="#33302B" strokeWidth="1">
                <line x1="120" y1="71" x2="120" y2="215" />
                <line x1="200" y1="65" x2="200" y2="209" />
                <line x1="280" y1="58" x2="280" y2="202" />
            </g>
            {/* Cab (front-right) */}
            <polygon points="432,132 470,146 476,178 476,214 432,208" fill={PANEL} stroke={EDGE} strokeWidth="1.5" />
            <polygon points="436,138 464,150 468,172 436,166" fill={INK} stroke="#33302B" strokeWidth="1" />
            {/* Wheels (skewed ellipses) */}
            {[
                [110, 238], [190, 232], [420, 232],
            ].map(([cx, cy]) => (
                <g key={cx}>
                    <ellipse cx={cx} cy={cy} rx="24" ry="21" fill={INK} stroke={EDGE} strokeWidth="1.5" />
                    <ellipse cx={cx} cy={cy} rx="8" ry="7" fill="none" stroke={BRAND} strokeWidth="1.2" opacity="0.7" />
                </g>
            ))}
            {/* HUD measure ticks along the side panel */}
            <g stroke={BRAND} strokeWidth="1" opacity="0.5">
                <line x1="42" y1="240" x2="348" y2="214" strokeDasharray="4 6" />
                <line x1="42" y1="234" x2="42" y2="246" />
                <line x1="348" y1="208" x2="348" y2="220" />
            </g>
        </svg>
    );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function WhyChooseUs() {
    const rootRef = useRef<HTMLDivElement>(null);
    const screenRef = useRef<HTMLDivElement>(null);
    const impressionsRef = useRef<HTMLSpanElement>(null);

    useGSAP(
        () => {
            const q = gsap.utils.selector(rootRef);

            /* Park everything that enters later. */
            gsap.set(q('[data-wcu-chapter]'), { autoAlpha: 0 });
            gsap.set(q('.wcu-truck-side, .wcu-ghost, .wcu-pin, .wcu-card, .wcu-flag-stem, .wcu-flag-label, .wcu-particle, .wcu-truck-glass'), { autoAlpha: 0 });
            gsap.set(q('.wcu-wrapbar, .wcu-wrapbar-art'), { scaleX: 0, transformOrigin: 'left center' });
            gsap.set(q('.wcu-frame-h'), { scaleX: 0 });
            gsap.set(q('.wcu-frame-v'), { scaleY: 0 });
            gsap.set(q('.wcu-corner'), { autoAlpha: 0, scale: 0.4 });
            gsap.set(q('.wcu-intro-item'), { autoAlpha: 0, y: -18 });

            /* Master timeline: duration 4 = one unit per chapter. */
            const tl = gsap.timeline({
                defaults: { ease: 'power2.inOut' },
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'top top',
                    end: 'bottom bottom',
                    pin: screenRef.current,
                    scrub: 0.5,
                    anticipatePin: 1,
                },
            });

            /* Heading then description settle first, and hold for the whole section. */
            tl.to(q('.wcu-intro-item'), { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.07, ease: 'power2.out' }, 0);

            /* ---------------- Chapter copy in / out ---------------- */
            // CH.01 — letter-by-letter stagger.
            tl.fromTo(q('.wcu-ch1-letter'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.18, stagger: 0.012, ease: 'power2.out' }, 0.02);
            tl.fromTo(q('[data-wcu-chapter="0"] .wcu-sub'), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.22 }, 0.12);
            tl.set(q('[data-wcu-chapter="0"]'), { autoAlpha: 1 }, 0);
            tl.to(q('[data-wcu-chapter="0"]'), { yPercent: -55, autoAlpha: 0, duration: 0.2 }, 0.84);

            // CH.02–04 glide in; 02 + 03 glide back out.
            [1, 2, 3].forEach((i) => {
                tl.fromTo(
                    q(`[data-wcu-chapter="${i}"]`),
                    { autoAlpha: 0, yPercent: 30 },
                    { autoAlpha: 1, yPercent: 0, duration: 0.25, ease: 'power2.out' },
                    i + 0.05
                );
                if (i < 3) tl.to(q(`[data-wcu-chapter="${i}"]`), { yPercent: -55, autoAlpha: 0, duration: 0.2 }, i + 0.84);
            });

            /* ---------------- Phase 1: The Smart Play ---------------- */
            // HUD frame slices around the viewport.
            tl.to(q('.wcu-frame-h'), { scaleX: 1, duration: 0.22, stagger: 0.04 }, 0.02);
            tl.to(q('.wcu-frame-v'), { scaleY: 1, duration: 0.22, stagger: 0.04 }, 0.06);
            tl.to(q('.wcu-corner'), { autoAlpha: 1, scale: 1, duration: 0.15, stagger: 0.03, ease: 'back.out(2)' }, 0.14);
            // Iso chassis rises into frame.
            tl.fromTo(q('.wcu-truck-iso'), { autoAlpha: 0, y: 46 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power3.out' }, 0.08);
            // Surface-area flag deploys: stem draws up, label expands.
            tl.fromTo(q('.wcu-flag-stem'), { autoAlpha: 1, scaleY: 0, transformOrigin: 'bottom center' }, { scaleY: 1, duration: 0.12 }, 0.42);
            tl.fromTo(q('.wcu-flag-label'), { autoAlpha: 0, scaleX: 0, transformOrigin: 'left center' }, { autoAlpha: 1, scaleX: 1, duration: 0.16 }, 0.52);

            /* ------------- Phase 2: The Everywhere Illusion ---------- */
            tl.to(q('.wcu-flag-stem, .wcu-flag-label'), { autoAlpha: 0, duration: 0.12 }, 1.0);
            // Simulated 90° yaw: iso face rotates away, side face rotates in.
            tl.to(q('.wcu-truck-iso'), { rotationY: 80, autoAlpha: 0, duration: 0.4 }, 1.05);
            tl.fromTo(q('.wcu-truck-side'), { rotationY: -80, autoAlpha: 0 }, { rotationY: 0, autoAlpha: 1, duration: 0.4 }, 1.32);
            // Liquid wrap floods cab → tail.
            tl.to(q('.wcu-wrapbar'), { scaleX: 1, duration: 0.42, ease: 'power1.inOut' }, 1.5);
            tl.to(q('.wcu-wrapbar-art'), { scaleX: 1, duration: 0.2 }, 1.78);
            // Social particles burst from the tires and drift up.
            tl.fromTo(
                q('.wcu-particle'),
                { autoAlpha: 0, y: 0, scale: 0.5 },
                { autoAlpha: 1, y: -110, scale: 1, duration: 0.3, stagger: 0.035, ease: 'power1.out' },
                1.62
            );
            tl.to(q('.wcu-particle'), { autoAlpha: 0, y: -160, duration: 0.18, stagger: 0.02 }, 1.95);

            /* ------------- Phase 3: Your Canvas, Your Rules ---------- */
            // Camera pulls back.
            tl.to(q('.wcu-truckstage'), { scale: 0.78, y: 26, duration: 0.3 }, 2.02);
            // Ghost fleet fans out symmetrically behind the hero truck.
            tl.fromTo(q('.wcu-ghost--l'), { autoAlpha: 0, x: 0, scale: 0.7 }, { autoAlpha: 0.5, x: -150, scale: 0.82, duration: 0.3 }, 2.12);
            tl.fromTo(q('.wcu-ghost--r'), { autoAlpha: 0, x: 0, scale: 0.7 }, { autoAlpha: 0.5, x: 150, scale: 0.82, duration: 0.3 }, 2.12);
            // Geo pins pop above the fleet.
            tl.fromTo(
                q('.wcu-pin'),
                { autoAlpha: 0, scale: 0, transformOrigin: 'bottom center' },
                { autoAlpha: 1, scale: 1, duration: 0.16, stagger: 0.08, ease: 'back.out(2.2)' },
                2.42
            );

            /* --------- Phase 4: The Proof is in the Pavement --------- */
            // Fleet + pins clear the stage.
            tl.to(q('.wcu-pin, .wcu-ghost'), { autoAlpha: 0, duration: 0.15 }, 3.02);
            tl.to(q('.wcu-truckstage'), { scale: 0.88, y: 10, duration: 0.25 }, 3.05);
            // Panels turn to glass: solid crossfades into the neon-grid variant.
            tl.to(q('.wcu-truck-side'), { autoAlpha: 0, duration: 0.22 }, 3.12);
            tl.fromTo(q('.wcu-truck-glass'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, 3.18);
            // Telemetry cards sprout into the black space.
            tl.fromTo(
                q('.wcu-card'),
                { autoAlpha: 0, scale: 0.7, y: 20 },
                { autoAlpha: 1, scale: 1, y: 0, duration: 0.2, stagger: 0.08, ease: 'back.out(1.6)' },
                3.3
            );
            // Live ticking impressions counter.
            const imp = { v: 0 };
            tl.to(
                imp,
                {
                    v: 2431882,
                    duration: 0.55,
                    ease: 'none',
                    onUpdate: () => {
                        if (impressionsRef.current)
                            impressionsRef.current.textContent = Math.floor(imp.v).toLocaleString('en-US');
                    },
                },
                3.4
            );
            // Exit: high-beams pulse a bright wash, then release the pin.
            tl.fromTo(q('.wcu-beam'), { autoAlpha: 0 }, { autoAlpha: 0.85, duration: 0.08, ease: 'power1.in' }, 3.86);
            tl.to(q('.wcu-beam'), { autoAlpha: 0, duration: 0.06 }, 3.94);
        },
        { scope: rootRef }
    );

    return (
        /* 400vh scroll track */
        <div ref={rootRef} className="relative h-[400vh] w-full" style={{ backgroundColor: INK }}>
            {/* Pinned full-screen frame */}
            <div ref={screenRef} className="flex h-screen w-full flex-col overflow-hidden md:flex-row">
                {/* ------------------------------------------------ */}
                {/* LEFT (45%): scroll-driven chapter copy            */}
                {/* ------------------------------------------------ */}
                {/* Intro and reasons are centred as one group, so the heading clears
                    the site header and the gap between them stays deliberate. */}
                <div className="relative order-2 flex h-[42vh] w-full flex-col justify-center px-7 md:order-1 md:h-full md:w-[45%] md:px-16">
                    {/* Section intro — holds for the whole section while the four
                        reasons cycle underneath it. */}
                    <div className="shrink-0">
                        <h2 className="wcu-intro-item font-tommy-bold text-[32px] uppercase leading-[1.05] tracking-tight text-white md:text-[46px]">
                            Why Choose Us<span style={{ color: BRAND }}>.</span>
                        </h2>
                        <p className="wcu-intro-item mt-3 max-w-[430px] font-tommy-regular text-[14px] leading-[1.6] md:text-[15px]" style={{ color: MUTED }}>
                            Four reasons brands move budget onto the road — efficiency, reach,
                            scale, and proof you can audit.
                        </p>
                    </div>

                    {/* The four reasons — each swaps in as you scroll. Fixed height so
                        the block never resizes as the copy changes underneath. */}
                    <div className="relative mt-7 h-[215px] shrink-0 md:mt-11 md:h-[280px]">
                        {CHAPTERS.map((ch, i) => (
                        <div
                            key={i}
                            data-wcu-chapter={i}
                            className="absolute inset-0 flex flex-col justify-start"
                        >
                            <p className="font-tommy-medium text-[12px] uppercase tracking-[4px]" style={{ color: BRAND }}>
                                {ch.tag}
                            </p>
                            <h3 className="mt-3 font-tommy-bold text-[34px] leading-[1.02] tracking-[-1px] text-white md:text-[56px] md:tracking-[-2px]">
                                {i === 0
                                    ? // CH.01 headline is split for the letter-stagger.
                                      ch.title.split('').map((c, j) => (
                                          <span key={j} className="wcu-ch1-letter inline-block">
                                              {c === ' ' ? ' ' : c}
                                          </span>
                                      ))
                                    : ch.title}
                            </h3>
                            <p className={`mt-5 max-w-[420px] font-tommy-regular text-[14px] leading-[1.7] md:text-[16px] ${i === 0 ? 'wcu-sub' : ''}`} style={{ color: MUTED }}>
                                {ch.body}
                            </p>
                        </div>
                        ))}
                    </div>
                </div>

                {/* ------------------------------------------------ */}
                {/* RIGHT (55%): the visualization viewport           */}
                {/* ------------------------------------------------ */}
                <div className="relative order-1 h-[58vh] w-full md:order-2 md:h-full md:w-[55%]">
                    {/* Minimalist gray grid backdrop */}
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(238,232,217,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(238,232,217,0.05) 1px, transparent 1px)',
                            backgroundSize: '44px 44px',
                        }}
                    />

                    {/* HUD frame: slicing border lines + corner brackets */}
                    <div className="wcu-frame-h absolute left-[6%] right-[6%] top-[7%] h-px origin-left" style={{ backgroundColor: `${BRAND}55` }} />
                    <div className="wcu-frame-h absolute bottom-[7%] left-[6%] right-[6%] h-px origin-right" style={{ backgroundColor: `${BRAND}55` }} />
                    <div className="wcu-frame-v absolute bottom-[7%] left-[6%] top-[7%] w-px origin-top" style={{ backgroundColor: `${BRAND}55` }} />
                    <div className="wcu-frame-v absolute bottom-[7%] right-[6%] top-[7%] w-px origin-bottom" style={{ backgroundColor: `${BRAND}55` }} />
                    {(['left-[6%] top-[7%] border-l-2 border-t-2', 'right-[6%] top-[7%] border-r-2 border-t-2', 'bottom-[7%] left-[6%] border-b-2 border-l-2', 'bottom-[7%] right-[6%] border-b-2 border-r-2'] as const).map((pos, i) => (
                        <div key={i} className={`wcu-corner absolute h-5 w-5 ${pos}`} style={{ borderColor: BRAND }} />
                    ))}

                    {/* Perspective stage for the simulated yaw rotation */}
                    <div className="absolute inset-[12%] [perspective:1200px]">
                        <div className="wcu-truckstage relative h-full w-full will-change-transform">
                            {/* Ghost fleet (phase 3) — behind the hero truck */}
                            <div className="wcu-ghost wcu-ghost--l absolute inset-x-[8%] top-1/2 -translate-y-1/2 will-change-transform">
                                <TruckSide mode="ghost" />
                            </div>
                            <div className="wcu-ghost wcu-ghost--r absolute inset-x-[8%] top-1/2 -translate-y-1/2 will-change-transform">
                                <TruckSide mode="ghost" />
                            </div>
                            {/* Hero truck: three material states, crossfaded */}
                            <div className="wcu-truck-iso absolute inset-x-[4%] top-1/2 -translate-y-1/2 will-change-transform">
                                <TruckIso />
                            </div>
                            <div className="wcu-truck-side absolute inset-x-[8%] top-1/2 -translate-y-1/2 will-change-transform">
                                <TruckSide mode="solid" />
                            </div>
                            <div className="wcu-truck-glass absolute inset-x-[8%] top-1/2 -translate-y-1/2 will-change-transform">
                                <TruckSide mode="glass" />
                            </div>
                        </div>
                    </div>

                    {/* Phase 1: surface-area measurement flag */}
                    <div className="wcu-flag-stem absolute left-[58%] top-[16%] h-16 w-px" style={{ backgroundColor: BRAND }} />
                    <div className="wcu-flag-label absolute left-[58%] top-[9%] whitespace-nowrap rounded-[4px] border px-3 py-1.5 font-tommy-medium text-[10px] uppercase tracking-[2px] md:text-[11px]" style={{ borderColor: `${BRAND}88`, color: BRAND, backgroundColor: `${INK}cc` }}>
                        Surface Area — 600 sq. ft.
                    </div>

                    {/* Phase 2: social particles rising from the tires */}
                    {PARTICLES.map((p, i) => (
                        <div key={i} className="wcu-particle absolute will-change-transform" style={{ left: p.left, top: p.top }}>
                            {p.kind === 'ring' && <div className="h-3 w-3 rounded-full border-2" style={{ borderColor: BRAND }} />}
                            {p.kind === 'dot' && <div className="h-2 w-2 rounded-full" style={{ backgroundColor: BRAND }} />}
                            {p.kind === 'plus' && (
                                <span className="font-tommy-bold text-[13px]" style={{ color: BRAND }}>+</span>
                            )}
                        </div>
                    ))}

                    {/* Phase 3: floating geolocation pins */}
                    {PINS.map((pin, i) => (
                        <div key={i} className="wcu-pin absolute flex flex-col items-center" style={{ left: pin.left, top: pin.top }}>
                            <span className="whitespace-nowrap rounded-[4px] border px-2.5 py-1 font-tommy-medium text-[9px] uppercase tracking-[1.5px] md:text-[10px]" style={{ borderColor: `${BRAND}88`, color: BRAND, backgroundColor: `${INK}cc` }}>
                                {pin.label}
                            </span>
                            <span className="mt-px h-0 w-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent" style={{ borderTopColor: BRAND }} />
                        </div>
                    ))}

                    {/* Phase 4: telemetry dashboard cards */}
                    <div className="wcu-card absolute right-[4%] top-[18%] rounded-[8px] border px-4 py-3 backdrop-blur-sm" style={{ borderColor: `${BRAND}55`, backgroundColor: `${INK}b3` }}>
                        <p className="font-tommy-medium text-[10px] uppercase tracking-[2px]" style={{ color: MUTED }}>Telemetry</p>
                        <p className="mt-1 flex items-center gap-2 font-tommy-medium text-[12px] uppercase tracking-[1px]" style={{ color: BRAND }}>
                            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: BRAND }} />
                            24/7 ACTIVE GPS
                        </p>
                    </div>
                    <div className="wcu-card absolute bottom-[16%] left-[6%] rounded-[8px] border px-4 py-3 backdrop-blur-sm" style={{ borderColor: `${BRAND}55`, backgroundColor: `${INK}b3` }}>
                        <p className="font-tommy-medium text-[10px] uppercase tracking-[2px]" style={{ color: MUTED }}>Impressions</p>
                        <p className="mt-1 font-tommy-bold text-[17px] tracking-[0.5px] tabular-nums" style={{ color: BRAND }}>
                            <span ref={impressionsRef}>Calculating…</span>
                        </p>
                    </div>

                    {/* Exit high-beam wash */}
                    <div
                        className="wcu-beam pointer-events-none absolute inset-0"
                        style={{ background: `radial-gradient(ellipse at 78% 55%, ${BRAND}cc 0%, rgba(255,255,255,0.5) 30%, transparent 70%)`, opacity: 0 }}
                    />
                </div>
            </div>
        </div>
    );
}
