'use client';

/**
 * MarketsCoverage — "Markets & Coverage" cinematic US-map dashboard.
 *
 * A single-component section that renders a stylized vector map of the
 * continental United States (pure inline SVG — no bitmap assets) with:
 *   - a pinned header (heading + supporting copy) and region tab bar
 *     (NATIONAL / WEST / CENTRAL / EAST)
 *   - a GSAP-tweened SVG viewBox "camera" for pan & zoom
 *   - a circuit-board style highway network with node dots
 *   - mini truck icons driving along the routes (GSAP MotionPath)
 *   - pulsing hub hotspots with hover peek states
 *   - a glassmorphic floating data card projected next to the active hub
 *     (bottom-sheet on mobile).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger, MotionPathPlugin);

/* ------------------------------------------------------------------ */
/*  Map space + mock data                                              */
/* ------------------------------------------------------------------ */

// Fixed SVG coordinate space — everything (map, routes, camera) lives here.
const VB_W = 1000;
const VB_H = 600;

type Region = 'NATIONAL' | 'WEST' | 'CENTRAL' | 'EAST';
const REGIONS: Region[] = ['NATIONAL', 'WEST', 'CENTRAL', 'EAST'];

interface Hub {
    id: string;
    region: Exclude<Region, 'NATIONAL'>;
    cityName: string;
    /** Position in SVG map units. */
    x: number;
    y: number;
    metrics: { volume: string; routes: string; coverage: string };
}

const HUBS: Hub[] = [
    {
        id: 'lax',
        region: 'WEST',
        cityName: 'Los Angeles (LAX Hub)',
        x: 165,
        y: 305,
        metrics: {
            volume: '1.4M Impressions / Day',
            routes: 'I-5, I-10, US-101',
            coverage: 'SoCal Metro Circuit',
        },
    },
    {
        id: 'dfw',
        region: 'CENTRAL',
        cityName: 'Dallas–Fort Worth (DFW Hub)',
        x: 475,
        y: 365,
        metrics: {
            volume: '980K Impressions / Day',
            routes: 'I-35, I-20, I-45',
            coverage: 'Texas Triangle Network',
        },
    },
    {
        id: 'ord',
        region: 'CENTRAL',
        cityName: 'Chicago (ORD Hub)',
        x: 640,
        y: 180,
        metrics: {
            volume: '1.1M Impressions / Day',
            routes: 'I-90, I-94, I-55',
            coverage: 'Great Lakes Corridor',
        },
    },
    {
        id: 'jfk',
        region: 'EAST',
        cityName: 'New York City (JFK Hub)',
        x: 795,
        y: 186,
        metrics: {
            volume: '1.6M Impressions / Day',
            routes: 'I-95, I-78, I-87',
            coverage: 'Tri-State Metro Cluster',
        },
    },
];

/** Camera framings for each tab (all keep the 1000:600 aspect ratio). */
const REGION_VIEWS: Record<Region, { x: number; y: number; w: number; h: number }> = {
    NATIONAL: { x: 0, y: 0, w: VB_W, h: VB_H },
    WEST: { x: 60, y: 150, w: 400, h: 240 },
    CENTRAL: { x: 380, y: 130, w: 420, h: 252 },
    EAST: { x: 590, y: 80, w: 370, h: 222 },
};

/**
 * Main highway routes between hubs — circuit-board style polylines with
 * 45° elbows. `regions` decides which tabs light them up + draw them in.
 */
const ROUTES = [
    { id: 'route-lax-dfw', d: 'M 165 305 L 260 305 L 305 350 L 430 350 L 445 365 L 475 365', regions: 'WEST|CENTRAL' },
    { id: 'route-dfw-ord', d: 'M 475 365 L 520 365 L 560 325 L 560 250 L 615 205 L 640 180', regions: 'CENTRAL' },
    { id: 'route-ord-jfk', d: 'M 640 180 L 730 180 L 742 186 L 795 186', regions: 'CENTRAL|EAST' },
    { id: 'route-lax-ord', d: 'M 165 305 L 212 258 L 330 258 L 375 225 L 520 225 L 568 200 L 640 180', regions: 'WEST|CENTRAL' },
];

/** Trucks: which route each one drives, how long a full run takes. */
const TRUCKS = [
    { route: '#route-lax-ord', duration: 26, delay: 0, regions: 'WEST|CENTRAL' },
    { route: '#route-lax-dfw', duration: 20, delay: 6, regions: 'WEST|CENTRAL' },
    { route: '#route-ord-jfk', duration: 14, delay: 3, regions: 'CENTRAL|EAST' },
];

/** Decorative circuit stubs (with hollow end-dots), grouped per region. */
const STUBS: { region: string; d: string; dots: [number, number][] }[] = [
    { region: 'WEST', d: 'M 132 200 L 186 200 L 208 222', dots: [[132, 200], [208, 222]] },
    { region: 'WEST', d: 'M 214 340 L 262 340', dots: [[214, 340], [262, 340]] },
    { region: 'CENTRAL', d: 'M 498 300 L 540 300 L 562 278', dots: [[498, 300], [562, 278]] },
    { region: 'CENTRAL', d: 'M 596 320 L 652 320', dots: [[596, 320], [652, 320]] },
    { region: 'CENTRAL', d: 'M 380 300 L 420 300 L 438 316', dots: [[380, 300], [438, 316]] },
    { region: 'EAST', d: 'M 700 244 L 742 244 L 760 226', dots: [[700, 244], [760, 226]] },
    { region: 'EAST', d: 'M 736 300 L 736 336 L 712 356', dots: [[736, 300], [712, 356]] },
];

/**
 * Stylized continental-US silhouette (clockwise from the Pacific
 * Northwest): Canada border → Great Lakes notch → New England → East
 * coast → Florida → Gulf → Texas tip → Mexico border → West coast.
 */
const US_PATH =
    'M 112 108 L 150 92 L 240 86 L 340 84 L 440 88 L 540 96 L 596 104 ' +
    'L 612 130 L 632 112 L 648 148 L 668 124 L 686 158 L 706 134 L 736 128 ' +
    'L 780 96 L 806 84 L 822 100 L 800 132 L 812 150 L 792 172 L 800 190 ' +
    'L 780 214 L 772 246 L 780 268 L 760 292 L 752 322 ' +
    'L 758 352 L 786 408 L 800 452 L 782 458 L 758 414 L 736 376 ' +
    'L 700 362 L 664 356 L 636 368 L 604 352 L 574 360 L 544 352 L 522 368 ' +
    'L 500 400 L 482 442 L 470 474 L 452 448 L 456 412 L 440 392 ' +
    'L 400 376 L 352 360 L 300 346 L 252 332 L 216 322 ' +
    'L 188 322 L 164 316 L 148 296 L 138 262 L 126 224 L 118 184 L 112 146 Z';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MarketsCoverage() {
    const rootRef = useRef<HTMLElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const cardAnchorRef = useRef<HTMLDivElement>(null);

    const [activeRegion, setActiveRegion] = useState<Region>('NATIONAL');
    const [activeHub, setActiveHub] = useState<Hub | null>(null);

    // The live camera. Mutated by GSAP, flushed into the viewBox attribute.
    const cam = useRef({ ...REGION_VIEWS.NATIONAL });
    // Keep the current focus in refs so resize/camera callbacks never go stale.
    const activeHubRef = useRef<Hub | null>(null);
    const activeRegionRef = useRef<Region>('NATIONAL');

    const applyCamera = useCallback(() => {
        const c = cam.current;
        svgRef.current?.setAttribute('viewBox', `${c.x} ${c.y} ${c.w} ${c.h}`);
    }, []);

    /**
     * Project a point in SVG map units to pixels inside the stage element,
     * honouring the current viewBox + preserveAspectRatio via the CTM.
     */
    const projectToStage = useCallback((mx: number, my: number) => {
        const svg = svgRef.current;
        const stage = stageRef.current;
        if (!svg || !stage) return null;
        const ctm = svg.getScreenCTM();
        if (!ctm) return null;
        const pt = new DOMPoint(mx, my).matrixTransform(ctm);
        const r = stage.getBoundingClientRect();
        return { x: pt.x - r.left, y: pt.y - r.top, w: r.width, h: r.height };
    }, []);

    /** Keep the floating card glued next to its hub while the camera moves. */
    const syncCard = useCallback(() => {
        const hub = activeHubRef.current;
        const anchor = cardAnchorRef.current;
        if (!hub || !anchor) return;
        // On mobile the card is a bottom sheet — no projection needed.
        if (window.innerWidth < 768) {
            gsap.set(anchor, { x: 0, y: 0 });
            return;
        }
        const p = projectToStage(hub.x, hub.y);
        if (!p) return;
        const cardW = cardRef.current?.offsetWidth ?? 340;
        const cardH = cardRef.current?.offsetHeight ?? 260;
        // Prefer the right side of the hub; flip left when clipped.
        let cx = p.x + 34;
        if (cx + cardW > p.w - 16) cx = p.x - 34 - cardW;
        const cy = gsap.utils.clamp(16, p.h - cardH - 16, p.y - cardH / 2);
        gsap.set(anchor, { x: cx, y: cy });
    }, [projectToStage]);

    /** Fly the SVG camera to a new framing. */
    const flyTo = useCallback(
        (view: { x: number; y: number; w: number; h: number }, duration = 1.5) => {
            gsap.to(cam.current, {
                ...view,
                duration,
                ease: 'power3.inOut',
                overwrite: 'auto',
                onUpdate: () => {
                    applyCamera();
                    syncCard();
                },
            });
        },
        [applyCamera, syncCard]
    );

    /** Dim / illuminate network clusters + hubs for the current focus. */
    const applyFocus = useCallback((region: Region, focusHub: Hub | null) => {
        const root = rootRef.current;
        if (!root) return;
        const litRegion = focusHub ? focusHub.region : region;
        const dimTo = focusHub ? 0.12 : 0.25;
        // Route stubs, trucks — anything tagged with a region list.
        root.querySelectorAll<SVGGElement>('[data-net-regions]').forEach((g) => {
            const list = g.dataset.netRegions ?? '';
            const lit = focusHub || region !== 'NATIONAL' ? list.includes(litRegion) : true;
            gsap.to(g, { opacity: lit ? 1 : dimTo, duration: 0.9, ease: 'power2.out', overwrite: 'auto' });
        });
        // Hub hotspots.
        root.querySelectorAll<SVGGElement>('[data-hub]').forEach((g) => {
            const hub = HUBS.find((h) => h.id === g.dataset.hub)!;
            const lit = focusHub
                ? hub.id === focusHub.id
                : region === 'NATIONAL' || hub.region === region;
            gsap.to(g, { opacity: lit ? 1 : 0.3, duration: 0.9, ease: 'power2.out', overwrite: 'auto' });
        });
    }, []);

    /** Stroke-draw the main routes for the current tab; fade the rest. */
    const drawRoutes = useCallback((region: Region) => {
        const root = rootRef.current;
        if (!root) return;
        root.querySelectorAll<SVGPathElement>('[data-route-main]').forEach((path, i) => {
            const belongs =
                region === 'NATIONAL' || (path.dataset.routeMain ?? '').includes(region);
            const len = path.getTotalLength();
            if (belongs) {
                gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
                gsap.to(path, {
                    strokeDashoffset: 0,
                    duration: 1.4,
                    delay: 0.25 + i * 0.15,
                    ease: 'power2.inOut',
                    overwrite: 'auto',
                });
            } else {
                gsap.to(path, { opacity: 0.15, duration: 0.5, overwrite: 'auto' });
            }
        });
    }, []);

    /* ----- user intents ------------------------------------------- */

    const selectRegion = useCallback(
        (region: Region) => {
            setActiveRegion(region);
            setActiveHub(null);
            activeRegionRef.current = region;
            activeHubRef.current = null;
            flyTo(REGION_VIEWS[region]);
            applyFocus(region, null);
            drawRoutes(region);
        },
        [flyTo, applyFocus, drawRoutes]
    );

    const selectHub = useCallback(
        (hub: Hub) => {
            setActiveHub(hub);
            activeHubRef.current = hub;
            // Tight framing, hub pushed left of centre so the card has room.
            const w = 300;
            const h = w * (VB_H / VB_W);
            flyTo({ x: hub.x - w * 0.38, y: hub.y - h * 0.52, w, h }, 1.6);
            applyFocus(activeRegionRef.current, hub);
        },
        [flyTo, applyFocus]
    );

    const closeHub = useCallback(() => {
        if (!activeHubRef.current) return;
        setActiveHub(null);
        activeHubRef.current = null;
        flyTo(REGION_VIEWS[activeRegionRef.current], 1.3);
        applyFocus(activeRegionRef.current, null);
    }, [flyTo, applyFocus]);

    /* ----- lifecycle ----------------------------------------------- */

    // Entrance choreography + scroll trigger + truck motion.
    useGSAP(
        () => {
            applyCamera();

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'top 65%',
                    once: true,
                },
                defaults: { ease: 'power3.out' },
            });
            tl.from('[data-mc-header] > *', { y: 26, autoAlpha: 0, duration: 0.8, stagger: 0.08 })
                .from(stageRef.current, { autoAlpha: 0, scale: 1.04, duration: 1.1 }, '-=0.5')
                .add(() => drawRoutes('NATIONAL'), '-=0.4');

            // Trucks continuously drive the main routes (skip if the user
            // prefers reduced motion).
            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                gsap.utils.toArray<SVGGElement>('[data-truck]').forEach((truck, i) => {
                    const spec = TRUCKS[i];
                    gsap.to(truck, {
                        motionPath: {
                            path: spec.route,
                            align: spec.route,
                            alignOrigin: [0.5, 0.62],
                            autoRotate: true,
                        },
                        duration: spec.duration,
                        delay: spec.delay,
                        repeat: -1,
                        yoyo: true,
                        ease: 'none',
                    });
                });
            }
        },
        { scope: rootRef }
    );

    // Card entrance whenever a hub becomes active.
    useGSAP(
        () => {
            if (!activeHub || !cardRef.current) return;
            syncCard();
            gsap.fromTo(
                cardRef.current,
                { autoAlpha: 0, y: 18, scale: 0.96 },
                { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, delay: 0.45, ease: 'power3.out' }
            );
        },
        { dependencies: [activeHub], scope: rootRef }
    );

    // Re-project the card on viewport resizes.
    useEffect(() => {
        const onResize = () => syncCard();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [syncCard]);

    /* ----- render --------------------------------------------------- */

    return (
        <section ref={rootRef} className="relative w-full bg-[#4d5666]">
            {/* Component-scoped keyframes (radar pulse, hover stem, tags). */}
            <style>{`
                @keyframes mc-pulse {
                    0%   { transform: scale(0.35); opacity: 0.85; }
                    100% { transform: scale(3);    opacity: 0; }
                }
                .mc-pulse {
                    transform-box: fill-box;
                    transform-origin: center;
                    animation: mc-pulse 2.6s cubic-bezier(0.2, 0.6, 0.4, 1) infinite;
                }
                .mc-pulse--late { animation-delay: 1.3s; }
                /* Hover: radar speeds up. */
                .mc-hot:hover .mc-pulse { animation-duration: 1.1s; }
                /* Hover: connector stem draws itself upward from the dot. */
                .mc-stem {
                    transform-box: fill-box;
                    transform-origin: center bottom;
                    transform: scaleY(0);
                    transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                .mc-hot:hover .mc-stem { transform: scaleY(1); }
                /* Hover: minimal peek tag appears instantly. */
                .mc-tag { opacity: 0; transition: opacity 0.15s linear; }
                .mc-hot:hover .mc-tag { opacity: 1; }
                @media (prefers-reduced-motion: reduce) {
                    .mc-pulse { animation: none; opacity: 0; }
                    .mc-stem  { transition: none; }
                }
            `}</style>

            {/* ------------------------------------------------------ */}
            {/* Pinned header: heading + supporting copy + tab bar      */}
            {/* ------------------------------------------------------ */}
            <div
                data-mc-header
                className="sticky top-0 z-30 flex w-full flex-col gap-5 border-b border-white/10 bg-[#4d5666]/85 px-6 py-6 backdrop-blur-[12px] md:flex-row md:items-end md:justify-between md:px-14 md:py-8"
            >
                <div className="max-w-[560px]">
                    <p className="font-tommy-regular text-[12px] uppercase tracking-[4px] text-[#ebdacf]/60">
                        Nationwide Network
                    </p>
                    <h2 className="mt-1 font-tommy-bold text-[32px] leading-[1.05] text-[#ebdacf] md:text-[44px]">
                        Markets &amp; Coverage<span className="text-[#FCD119]">.</span>
                    </h2>
                    {/* Supporting copy underneath the heading */}
                    <p className="mt-3 font-tommy-regular text-[14px] leading-[1.6] text-[#ebdacf]/70 md:text-[15px]">
                        From coast to coast, our fleet turns America&apos;s busiest highways
                        into high-impact moving billboards. Pick a region — or tap a hub —
                        to explore live coverage, corridors and daily impressions.
                    </p>
                </div>
                {/* Region switcher */}
                <nav className="-mx-1 flex items-center gap-1 overflow-x-auto md:mx-0 md:gap-2" aria-label="Map regions">
                    {REGIONS.map((region) => {
                        const active = region === activeRegion;
                        return (
                            <button
                                key={region}
                                onClick={() => selectRegion(region)}
                                className={`group relative shrink-0 px-3 py-2 font-tommy-medium text-[12px] uppercase tracking-[2.5px] transition-colors duration-300 md:px-4 md:text-[13px] ${
                                    active ? 'text-[#ebdacf]' : 'text-[#ebdacf]/45 hover:text-[#ebdacf]/80'
                                }`}
                            >
                                {region}
                                {/* Sleek accent underline */}
                                <span
                                    className={`absolute bottom-0 left-3 right-3 h-[2px] origin-left rounded-full bg-[#FCD119] transition-transform duration-500 ease-out md:left-4 md:right-4 ${
                                        active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'
                                    }`}
                                />
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* ------------------------------------------------------ */}
            {/* Full-screen map canvas                                  */}
            {/* ------------------------------------------------------ */}
            <div ref={stageRef} className="relative h-[80vh] w-full overflow-hidden md:h-screen">
                <svg
                    ref={svgRef}
                    viewBox={`0 0 ${VB_W} ${VB_H}`}
                    preserveAspectRatio="xMidYMid slice"
                    className="h-full w-full"
                    role="img"
                    aria-label="Map of the United States showing active market hubs"
                    onClick={closeHub}
                >
                    <defs>
                        {/* Neon glow for main routes + hub cores. */}
                        <filter id="mc-glow" x="-80%" y="-80%" width="260%" height="260%">
                            <feGaussianBlur stdDeviation="2.2" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        {/* Subtle dot-grid texture stamped onto the landmass. */}
                        <pattern id="mc-dots" width="16" height="16" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1" fill="rgba(0,0,0,0.05)" />
                        </pattern>
                        {/* Reusable truck icon (faces right; MotionPath rotates it). */}
                        <g id="mc-truck-icon">
                            {/* trailer */}
                            <rect x="-17" y="-13" width="23" height="11.5" rx="1.6" fill="#ffffff" stroke="rgba(0,0,0,0.25)" strokeWidth="0.7" />
                            {/* cab */}
                            <path d="M 7 -10.5 L 13.5 -10.5 L 17 -6 L 17 -1.5 L 7 -1.5 Z" fill="#FCD119" stroke="rgba(0,0,0,0.25)" strokeWidth="0.7" />
                            {/* window */}
                            <path d="M 9 -9 L 12.8 -9 L 15 -6 L 9 -6 Z" fill="#4d5666" />
                            {/* wheels */}
                            <circle cx="-11" cy="0" r="2.4" fill="#1a1d24" />
                            <circle cx="-4" cy="0" r="2.4" fill="#1a1d24" />
                            <circle cx="12" cy="0" r="2.4" fill="#1a1d24" />
                        </g>
                    </defs>

                    {/* Faint blueprint grid behind the map. */}
                    <g stroke="rgba(255,255,255,0.045)" strokeWidth="0.6">
                        {Array.from({ length: 9 }, (_, i) => (
                            <line key={`v${i}`} x1={(i + 1) * 100} y1="0" x2={(i + 1) * 100} y2={VB_H} />
                        ))}
                        {Array.from({ length: 5 }, (_, i) => (
                            <line key={`h${i}`} x1="0" y1={(i + 1) * 100} x2={VB_W} y2={(i + 1) * 100} />
                        ))}
                    </g>

                    {/* -------------------- The USA -------------------- */}
                    {/* Extruded 3D edge (offset duplicate underneath). */}
                    <path d={US_PATH} transform="translate(-12, 15)" fill="#FCD119" opacity="0.95" />
                    {/* Main landmass */}
                    <path d={US_PATH} fill="#ebdacf" stroke="rgba(0,0,0,0.15)" strokeWidth="1" strokeLinejoin="round" />
                    {/* Dot-grid texture clipped to the land */}
                    <path d={US_PATH} fill="url(#mc-dots)" />
                    {/* Faint interior seams (state-line hints) */}
                    <g fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8">
                        <path d="M 252 90 L 252 332" />
                        <path d="M 430 88 L 438 388" />
                        <path d="M 588 102 L 582 356" />
                        <path d="M 126 226 L 588 230" />
                    </g>

                    {/* ------------- Decorative circuit stubs ------------- */}
                    {STUBS.map((s, i) => (
                        <g
                            key={i}
                            data-net-regions={s.region}
                            fill="none"
                            stroke="rgba(255,255,255,0.75)"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d={s.d} />
                            {s.dots.map(([dx, dy], j) => (
                                <circle key={j} cx={dx} cy={dy} r="3.4" fill="#ebdacf" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" />
                            ))}
                        </g>
                    ))}

                    {/* ------------------ Main highway routes -------------- */}
                    <g fill="none" stroke="#FCD119" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter="url(#mc-glow)">
                        {ROUTES.map((r) => (
                            <path key={r.id} id={r.id} data-route-main={r.regions} d={r.d} opacity="0" />
                        ))}
                    </g>

                    {/* ---------------------- Trucks ----------------------- */}
                    {TRUCKS.map((t, i) => (
                        <g key={i} data-truck data-net-regions={t.regions}>
                            <use href="#mc-truck-icon" />
                        </g>
                    ))}

                    {/* -------------------- Hub hotspots ------------------- */}
                    {HUBS.map((hub) => {
                        const code = hub.id.toUpperCase();
                        return (
                            <g
                                key={hub.id}
                                data-hub={hub.id}
                                className="mc-hot cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation(); // don't trigger the backdrop close handler
                                    selectHub(hub);
                                }}
                                role="button"
                                aria-label={`${hub.cityName} — view stats`}
                            >
                                {/* Generous invisible hit area */}
                                <circle cx={hub.x} cy={hub.y} r="24" fill="transparent" />
                                {/* Looping sonar pulses */}
                                <circle className="mc-pulse" cx={hub.x} cy={hub.y} r="10" fill="none" stroke="#FCD119" strokeWidth="1.1" />
                                <circle className="mc-pulse mc-pulse--late" cx={hub.x} cy={hub.y} r="10" fill="none" stroke="#FCD119" strokeWidth="0.9" />
                                {/* Sharp glowing core dot */}
                                <circle cx={hub.x} cy={hub.y} r="4.5" fill="#FCD119" filter="url(#mc-glow)" />
                                <circle cx={hub.x} cy={hub.y} r="1.8" fill="#1a1d24" />
                                {/* Hover: vertical connector stem + peek tag */}
                                <line className="mc-stem" x1={hub.x} y1={hub.y - 7} x2={hub.x} y2={hub.y - 42} stroke="#ebdacf" strokeWidth="1" />
                                <text
                                    className="mc-tag select-none"
                                    x={hub.x}
                                    y={hub.y - 49}
                                    textAnchor="middle"
                                    fill="#ebdacf"
                                    fontSize="11.5"
                                    letterSpacing="1.5"
                                    style={{ fontFamily: 'var(--font-tommy-medium)' }}
                                >
                                    [ {code} HUB — VIEW STATS ]
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {/* ---------------------------------------------------- */}
                {/* Floating glassmorphic data card                       */}
                {/* Desktop: projected next to the hub.                   */}
                {/* Mobile: docks as a bottom sheet.                      */}
                {/* ---------------------------------------------------- */}
                {activeHub && (
                    <div
                        ref={cardAnchorRef}
                        className="absolute inset-x-4 bottom-6 z-20 md:inset-auto md:left-0 md:top-0 md:will-change-transform"
                    >
                        <div
                            ref={cardRef}
                            className="rounded-2xl border border-white/15 bg-[#151a22]/60 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-[12px] md:w-[340px]"
                        >
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-tommy-regular text-[10px] uppercase tracking-[3px] text-[#FCD119]">
                                        {activeHub.region} · Active Hub
                                    </p>
                                    <h3 className="mt-1 font-tommy-bold text-[20px] leading-tight text-[#ebdacf]">
                                        {activeHub.cityName}
                                    </h3>
                                </div>
                                <button
                                    onClick={closeHub}
                                    aria-label="Close hub details"
                                    className="rounded-full border border-white/15 p-1.5 text-[#ebdacf]/60 transition-colors hover:text-[#ebdacf]"
                                >
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M1 1 L11 11 M11 1 L1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>
                            <dl className="space-y-3">
                                {(
                                    [
                                        ['Daily Reach', activeHub.metrics.volume],
                                        ['Key Corridors', activeHub.metrics.routes],
                                        ['Coverage', activeHub.metrics.coverage],
                                    ] as const
                                ).map(([label, value]) => (
                                    <div key={label} className="flex items-baseline justify-between gap-4 border-b border-white/8 pb-3 last:border-0 last:pb-0">
                                        <dt className="font-tommy-regular text-[11px] uppercase tracking-[2px] text-[#ebdacf]/50">
                                            {label}
                                        </dt>
                                        <dd className="text-right font-tommy-medium text-[14px] text-[#ebdacf]">
                                            {value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                )}

                {/* Subtle vignette to seat the map into the section */}
                <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_140px_rgba(0,0,0,0.35)]" />
            </div>
        </section>
    );
}
