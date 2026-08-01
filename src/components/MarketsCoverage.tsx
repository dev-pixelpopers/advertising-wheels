'use client';

/**
 * MarketsCoverage — "Markets & Coverage" US coverage dashboard.
 *
 * Single-column, scroll-driven section. The wrapper reserves 260vh of
 * scroll depth and pins one full-screen frame that scrubs through two
 * states:
 *
 *   1. INTRO   — heading, copy and the national stat grid hold the screen
 *                while the map peeks in from the bottom edge.
 *   2. EXPANDED— on scroll the map rises and expands edge-to-edge into a
 *                full-screen view as the intro copy lifts away; the map
 *                controls (region tabs, zoom, detail panel) fade in and
 *                pointer interaction switches on.
 *
 * Below `lg` the pin is dropped entirely — the section stacks as ordinary
 * content with a fixed-height map, so touch scrolling is never hijacked.
 *
 * Market coordinates were calibrated against the map asset's own geometry,
 * so every node sits on its true landmass position.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { useGSAP } from '@gsap/react';
import UsMap from './map/UsMap';

gsap.registerPlugin(useGSAP, ScrollTrigger, MotionPathPlugin);

/* ------------------------------------------------------------------ */
/*  Map space                                                          */
/* ------------------------------------------------------------------ */

const MAP_W = 2000;
const MAP_H = 1200;
const TRUCK_SRC = '/assets/images/market/truck.svg';

/** Zoom limits, expressed as viewBox width. */
const MIN_VIEW_W = 300; // most zoomed-in
const MAX_VIEW_W = 1960; // most zoomed-out

type Region = 'NATIONAL' | 'WEST' | 'CENTRAL' | 'SOUTH' | 'NORTHEAST';
const REGIONS: Region[] = ['NATIONAL', 'WEST', 'CENTRAL', 'SOUTH', 'NORTHEAST'];

interface Market {
    id: string;
    city: string;
    region: Exclude<Region, 'NATIONAL'>;
    x: number;
    y: number;
    /** Adults 18+ inside the coverage area. */
    adults: number;
    /** Total adult 18+ population of the metro. */
    pop18: number;
    /** Impressions per truck across a 4-week flight. */
    impressions: number;
    audience?: string;
}

/** The 50 covered markets — client coverage figures (60% of metro 18+). */
const MARKETS: Market[] = [
    // ---------------- WEST ----------------
    { id: 'lax', city: 'Los Angeles, CA', region: 'WEST', x: 301.9, y: 707.4, adults: 6120000, pop18: 10200000, impressions: 1751625 },
    { id: 'sfo', city: 'San Francisco, CA', region: 'WEST', x: 205.4, y: 531.5, adults: 2940000, pop18: 4900000, impressions: 749250 },
    { id: 'phx', city: 'Phoenix, AZ', region: 'WEST', x: 501.4, y: 767.4, adults: 2460000, pop18: 4100000, impressions: 384750 },
    { id: 'sea', city: 'Seattle-Tacoma, WA', region: 'WEST', x: 308.3, y: 116.1, adults: 2220000, pop18: 3700000, impressions: 931500 },
    { id: 'den', city: 'Denver, CO', region: 'WEST', x: 774.7, y: 537.9, adults: 1740000, pop18: 2900000, impressions: 810000 },
    { id: 'sac', city: 'Sacramento, CA', region: 'WEST', x: 228.8, y: 504.0, adults: 1440000, pop18: 2400000, impressions: 513000 },
    { id: 'san', city: 'San Diego, CA', region: 'WEST', x: 331.9, y: 763.2, adults: 1500000, pop18: 2500000, impressions: 776250 },
    { id: 'pdx', city: 'Portland, OR', region: 'WEST', x: 273.1, y: 203.2, adults: 1320000, pop18: 2200000, impressions: 810000 },
    { id: 'slc', city: 'Salt Lake City, UT', region: 'WEST', x: 556.1, y: 465.0, adults: 660000, pop18: 1100000, impressions: 540000 },
    { id: 'las', city: 'Las Vegas, NV', region: 'WEST', x: 414.6, y: 640.6, adults: 960000, pop18: 1600000, impressions: 810000 },
    { id: 'abq', city: 'Albuquerque, NM', region: 'WEST', x: 698.6, y: 729.3, adults: 420000, pop18: 700000, impressions: 337500 },

    // ---------------- CENTRAL ----------------
    { id: 'ord', city: 'Chicago, IL', region: 'CENTRAL', x: 1336.7, y: 450.4, adults: 3960000, pop18: 6600000, impressions: 978750 },
    { id: 'dfw', city: 'Dallas-Ft. Worth, TX', region: 'CENTRAL', x: 1043.1, y: 853.8, adults: 3240000, pop18: 5400000, impressions: 985500 },
    { id: 'hou', city: 'Houston, TX', region: 'CENTRAL', x: 1097.7, y: 978.2, adults: 2820000, pop18: 4700000, impressions: 675000, audience: 'Commuters, shoppers, sports & event crowds — ~1.2M weekly' },
    { id: 'msp', city: 'Minneapolis-St. Paul, MN', region: 'CENTRAL', x: 1151.6, y: 330.4, adults: 1860000, pop18: 3100000, impressions: 742500 },
    { id: 'dtw', city: 'Detroit, MI', region: 'CENTRAL', x: 1476.6, y: 409.3, adults: 1920000, pop18: 3200000, impressions: 877500 },
    { id: 'cle', city: 'Cleveland, OH', region: 'CENTRAL', x: 1529.9, y: 439.3, adults: 1560000, pop18: 2600000, impressions: 384750 },
    { id: 'ind', city: 'Indianapolis, IN', region: 'CENTRAL', x: 1394.0, y: 536.0, adults: 1140000, pop18: 1900000, impressions: 540000 },
    { id: 'stl', city: 'St. Louis, MO', region: 'CENTRAL', x: 1265.4, y: 599.1, adults: 1380000, pop18: 2300000, impressions: 675000 },
    { id: 'aus', city: 'Austin, TX', region: 'CENTRAL', x: 1009.3, y: 953.9, adults: 1020000, pop18: 1700000, impressions: 1074195 },
    { id: 'grr', city: 'Grand Rapids, MI', region: 'CENTRAL', x: 1397.8, y: 396.4, adults: 450000, pop18: 750000, impressions: 715500 },
    { id: 'mci', city: 'Kansas City, MO', region: 'CENTRAL', x: 1118.7, y: 583.8, adults: 900000, pop18: 1500000, impressions: 675000 },
    { id: 'cvg', city: 'Cincinnati, OH', region: 'CENTRAL', x: 1451.3, y: 557.3, adults: 840000, pop18: 1400000, impressions: 607500 },
    { id: 'sat', city: 'San Antonio, TX', region: 'CENTRAL', x: 981.7, y: 985.2, adults: 960000, pop18: 1600000, impressions: 742500 },
    { id: 'okc', city: 'Oklahoma City, OK', region: 'CENTRAL', x: 1018.3, y: 739.4, adults: 540000, pop18: 900000, impressions: 405000 },

    // ---------------- SOUTH ----------------
    { id: 'mia', city: 'Miami-Ft. Lauderdale, FL', region: 'SOUTH', x: 1691.5, y: 1101.2, adults: 2400000, pop18: 4000000, impressions: 1373692 },
    { id: 'atl', city: 'Atlanta, GA', region: 'SOUTH', x: 1484.4, y: 791.4, adults: 2700000, pop18: 4500000, impressions: 1029105 },
    { id: 'tpa', city: 'Tampa-St. Pete, FL', region: 'SOUTH', x: 1595.1, y: 1026.9, adults: 1800000, pop18: 3000000, impressions: 641250 },
    { id: 'mco', city: 'Orlando, FL', region: 'SOUTH', x: 1625.5, y: 996.4, adults: 1740000, pop18: 2900000, impressions: 607500 },
    { id: 'clt', city: 'Charlotte, NC', region: 'SOUTH', x: 1598.8, y: 704.2, adults: 1260000, pop18: 2100000, impressions: 573750 },
    { id: 'rdu', city: 'Raleigh-Durham, NC', region: 'SOUTH', x: 1669.4, y: 661.9, adults: 1080000, pop18: 1800000, impressions: 506250 },
    { id: 'bna', city: 'Nashville, TN', region: 'SOUTH', x: 1389.7, y: 696.8, adults: 1080000, pop18: 1800000, impressions: 1032750 },
    { id: 'jax', city: 'Jacksonville, FL', region: 'SOUTH', x: 1602.8, y: 923.1, adults: 720000, pop18: 1200000, impressions: 472500 },
    { id: 'rsw', city: 'Ft. Myers, FL', region: 'SOUTH', x: 1626.5, y: 1069.8, adults: 450000, pop18: 750000, impressions: 634500 },
    { id: 'gsp', city: 'Greenville-Spartanburg, SC', region: 'SOUTH', x: 1547.9, y: 731.7, adults: 510000, pop18: 850000, impressions: 405000 },
    { id: 'mem', city: 'Memphis, TN', region: 'SOUTH', x: 1279.9, y: 750.7, adults: 540000, pop18: 900000, impressions: 472500 },
    { id: 'pbi', city: 'West Palm Beach, FL', region: 'SOUTH', x: 1689.2, y: 1062.5, adults: 600000, pop18: 1000000, impressions: 499500 },
    { id: 'sdf', city: 'Louisville, KY', region: 'SOUTH', x: 1414.6, y: 600.7, adults: 510000, pop18: 850000, impressions: 432000 },
    { id: 'msy', city: 'New Orleans, LA', region: 'SOUTH', x: 1294.4, y: 970.6, adults: 510000, pop18: 850000, impressions: 432000 },
    { id: 'orf', city: 'Norfolk-Virginia Beach, VA', region: 'SOUTH', x: 1738.3, y: 591.5, adults: 600000, pop18: 1000000, impressions: 472500 },
    { id: 'ric', city: 'Richmond, VA', region: 'SOUTH', x: 1694.2, y: 572.8, adults: 510000, pop18: 850000, impressions: 432000 },

    // ---------------- NORTHEAST ----------------
    { id: 'nyc', city: 'New York, NY', region: 'NORTHEAST', x: 1769.3, y: 396.8, adults: 9360000, pop18: 15600000, impressions: 2025000 },
    { id: 'phl', city: 'Philadelphia, PA', region: 'NORTHEAST', x: 1742.4, y: 443.2, adults: 2820000, pop18: 4700000, impressions: 877500 },
    { id: 'dca', city: 'Washington, DC', region: 'NORTHEAST', x: 1694.2, y: 508.6, adults: 2940000, pop18: 4900000, impressions: 648000 },
    { id: 'bos', city: 'Boston, MA', region: 'NORTHEAST', x: 1835.2, y: 288.1, adults: 2640000, pop18: 4400000, impressions: 1350000 },
    { id: 'bwi', city: 'Baltimore, MD', region: 'NORTHEAST', x: 1704.2, y: 487.6, adults: 1380000, pop18: 2300000, impressions: 742500 },
    { id: 'pit', city: 'Pittsburgh, PA', region: 'NORTHEAST', x: 1586.7, y: 468.8, adults: 1260000, pop18: 2100000, impressions: 648000 },
    { id: 'bdl', city: 'Hartford, CT', region: 'NORTHEAST', x: 1796.1, y: 335.4, adults: 540000, pop18: 900000, impressions: 540000 },
    { id: 'pvd', city: 'Providence, RI', region: 'NORTHEAST', x: 1832.7, y: 315.6, adults: 570000, pop18: 950000, impressions: 450000 },
    { id: 'buf', city: 'Buffalo, NY', region: 'NORTHEAST', x: 1617.6, y: 346.5, adults: 480000, pop18: 800000, impressions: 384750 },
];

/** Camera framings per tab (map units). */
const REGION_VIEWS: Record<Region, { x: number; y: number; w: number; h: number }> = {
    NATIONAL: { x: 120, y: 60, w: 1820, h: 1092 },
    WEST: { x: 150, y: 80, w: 780, h: 468 },
    CENTRAL: { x: 900, y: 250, w: 700, h: 420 },
    SOUTH: { x: 1200, y: 600, w: 640, h: 384 },
    NORTHEAST: { x: 1520, y: 250, w: 460, h: 276 },
};

/**
 * Interstate corridors, defined as chains of market ids so every route is
 * guaranteed to run through real, calibrated nodes (the `d` string is built
 * from the MARKETS table below). Between them these routes touch all 50
 * covered markets — no market sits off the network.
 */
const CORRIDOR_ROUTES: { id: string; region: string; nodes: string[] }[] = [
    { id: 'i5',   region: 'WEST',                     nodes: ['sea', 'pdx', 'sac', 'sfo', 'lax', 'san'] },
    { id: 'i15',  region: 'WEST',                     nodes: ['slc', 'las', 'lax'] },
    { id: 'i10',  region: 'WEST|CENTRAL|SOUTH',       nodes: ['san', 'phx', 'sat', 'hou', 'msy', 'jax'] },
    { id: 'i25',  region: 'WEST',                     nodes: ['den', 'abq'] },
    { id: 'i40',  region: 'WEST|CENTRAL|SOUTH',       nodes: ['abq', 'okc', 'mem', 'bna', 'rdu'] },
    { id: 'i35',  region: 'CENTRAL',                  nodes: ['msp', 'mci', 'okc', 'dfw', 'aus', 'sat'] },
    { id: 'i70',  region: 'WEST|CENTRAL|NORTHEAST',   nodes: ['den', 'mci', 'stl', 'ind', 'cvg', 'pit'] },
    { id: 'i90',  region: 'CENTRAL|NORTHEAST',        nodes: ['ord', 'dtw', 'cle', 'buf', 'bos'] },
    { id: 'i94',  region: 'CENTRAL',                  nodes: ['msp', 'ord'] },
    { id: 'i96',  region: 'CENTRAL',                  nodes: ['ord', 'grr', 'dtw'] },
    { id: 'i75',  region: 'CENTRAL|SOUTH',            nodes: ['dtw', 'cvg', 'atl', 'tpa', 'rsw', 'mia'] },
    { id: 'i95',  region: 'NORTHEAST|SOUTH',          nodes: ['bos', 'pvd', 'bdl', 'nyc', 'phl', 'bwi', 'dca', 'ric', 'rdu'] },
    { id: 'i95s', region: 'SOUTH',                    nodes: ['jax', 'mco', 'pbi', 'mia'] },
    { id: 'i85',  region: 'SOUTH',                    nodes: ['atl', 'gsp', 'clt', 'rdu'] },
    { id: 'i64',  region: 'CENTRAL|SOUTH',            nodes: ['stl', 'sdf', 'cvg'] },
    { id: 'i64e', region: 'SOUTH',                    nodes: ['ric', 'orf'] },
    { id: 'i4',   region: 'SOUTH',                    nodes: ['tpa', 'mco', 'jax'] },
];

/**
 * State names, taken verbatim from map-v2.svg's own `#labels` group — so each
 * one sits exactly where the map's author placed it (the small north-east
 * states are deliberately set offshore, as on any printed map).
 */
const STATE_LABELS: { s: string; x: number; y: number }[] = [
    { s: 'AL', x: 1403.0, y: 836.0 },
    { s: 'AR', x: 1191.0, y: 766.0 },
    { s: 'AZ', x: 516.6, y: 740.1 },
    { s: 'CA', x: 264.6, y: 580.1 },
    { s: 'CO', x: 744.6, y: 570.1 },
    { s: 'CT', x: 1863.0, y: 427.0 },
    { s: 'DE', x: 1809.0, y: 519.0 },
    { s: 'FL', x: 1621.0, y: 1020.0 },
    { s: 'GA', x: 1519.0, y: 828.0 },
    { s: 'IA', x: 1155.0, y: 452.0 },
    { s: 'ID', x: 509.0, y: 326.0 },
    { s: 'IL', x: 1297.0, y: 528.0 },
    { s: 'IN', x: 1395.0, y: 524.0 },
    { s: 'KS', x: 989.0, y: 606.0 },
    { s: 'KY', x: 1447.0, y: 624.0 },
    { s: 'LA', x: 1199.0, y: 924.0 },
    { s: 'MA', x: 1902.0, y: 313.0 },
    { s: 'MD', x: 1806.0, y: 573.0 },
    { s: 'ME', x: 1871.0, y: 198.0 },
    { s: 'MI', x: 1417.0, y: 376.0 },
    { s: 'MN', x: 1111.0, y: 272.0 },
    { s: 'MO', x: 1181.0, y: 610.0 },
    { s: 'MS', x: 1295.0, y: 846.0 },
    { s: 'MT', x: 669.0, y: 210.0 },
    { s: 'NC', x: 1663.0, y: 684.0 },
    { s: 'ND', x: 937.0, y: 218.0 },
    { s: 'NE', x: 955.0, y: 474.0 },
    { s: 'NH', x: 1780.0, y: 173.0 },
    { s: 'NJ', x: 1820.0, y: 468.0 },
    { s: 'NM', x: 710.6, y: 756.1 },
    { s: 'NV', x: 386.6, y: 492.1 },
    { s: 'NY', x: 1717.0, y: 342.0 },
    { s: 'OH', x: 1497.0, y: 500.0 },
    { s: 'OK', x: 1027.0, y: 740.0 },
    { s: 'OR', x: 315.0, y: 276.0 },
    { s: 'PA', x: 1661.0, y: 446.0 },
    { s: 'RI', x: 1909.0, y: 400.0 },
    { s: 'SC', x: 1611.0, y: 768.0 },
    { s: 'SD', x: 935.0, y: 346.0 },
    { s: 'TN', x: 1405.0, y: 708.0 },
    { s: 'TX', x: 968.0, y: 922.3 },
    { s: 'UT', x: 556.6, y: 536.1 },
    { s: 'VA', x: 1655.0, y: 594.0 },
    { s: 'VT', x: 1719.0, y: 190.0 },
    { s: 'WA', x: 355.0, y: 138.0 },
    { s: 'WI', x: 1263.0, y: 338.0 },
    { s: 'WV', x: 1569.0, y: 568.0 },
    { s: 'WY', x: 699.0, y: 386.0 },
];

/**
 * Live trucks. Each rides a corridor inside an upright circular pin: the
 * badge itself never tilts, so the side-profile truck art always reads, and
 * only a small heading arrow rotates to show direction of travel.
 */
/**
 * Corridor geometry, built from the market nodes so each route provably runs
 * through real calibrated coordinates rather than a hand-written path string.
 */
const CORRIDORS = CORRIDOR_ROUTES.map((route) => ({
    id: route.id,
    region: route.region,
    d: route.nodes
        .map((id) => {
            const m = MARKETS.find((x) => x.id === id)!;
            return `${m.x} ${m.y}`;
        })
        .map((pt, i) => (i === 0 ? `M ${pt}` : `L ${pt}`))
        .join(' '),
}));

/** One truck per major corridor (the long-haul routes read best in motion). */
const TRUCK_ROUTES = ['i5', 'i10', 'i35', 'i90', 'i95', 'i75'];
const TRUCKS = CORRIDOR_ROUTES.filter((c) => TRUCK_ROUTES.includes(c.id)).map((c, i) => ({
    corridor: c.id,
    region: c.region,
    // Staggered so the fleet never moves in lock-step.
    delay: i * 1.6,
}));

/** Map units travelled per second — duration is derived from each route's
 *  real length so every truck moves at the same apparent speed. */
const TRUCK_SPEED = 26;

const fmt = (n: number) => n.toLocaleString('en-US');
const compact = (n: number) =>
    n >= 1e6 ? `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M` : `${Math.round(n / 1e3)}K`;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MarketsCoverage() {
    const rootRef = useRef<HTMLElement>(null);
    const pinRef = useRef<HTMLDivElement>(null);
    const introRef = useRef<HTMLDivElement>(null);
    const mapWrapRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const [activeRegion, setActiveRegion] = useState<Region>('NATIONAL');
    const [activeMarket, setActiveMarket] = useState<Market | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    /** True once the map has scrubbed open to full screen (or on mobile). */
    const [expanded, setExpanded] = useState(false);
    const expandedRef = useRef(false);

    // Live camera; mutated by GSAP + drag, flushed to the viewBox attribute.
    const cam = useRef({ ...REGION_VIEWS.NATIONAL });
    const activeRegionRef = useRef<Region>('NATIONAL');
    // Drag bookkeeping — `moved` suppresses the click that ends a drag.
    const drag = useRef({ on: false, px: 0, py: 0, moved: 0, id: -1, captured: false });

    const totals = useMemo(
        () => ({
            count: MARKETS.length,
            adults: MARKETS.reduce((s, m) => s + m.adults, 0),
            impressions: MARKETS.reduce((s, m) => s + m.impressions, 0),
        }),
        []
    );

    const maxImp = useMemo(() => Math.max(...MARKETS.map((m) => m.impressions)), []);
    const radiusOf = useCallback(
        (m: Market) => 5.2 + Math.sqrt(m.impressions / maxImp) * 9.2,
        [maxImp]
    );

    /** Keep the camera inside sane bounds at any zoom level. */
    const clampCam = useCallback(() => {
        const c = cam.current;
        c.w = gsap.utils.clamp(MIN_VIEW_W, MAX_VIEW_W, c.w);
        c.h = c.w * (REGION_VIEWS.NATIONAL.h / REGION_VIEWS.NATIONAL.w);
        c.x = gsap.utils.clamp(-120, MAP_W - c.w + 120, c.x);
        c.y = gsap.utils.clamp(-80, MAP_H - c.h + 80, c.y);
    }, []);

    const applyCamera = useCallback(() => {
        const c = cam.current;
        svgRef.current?.setAttribute('viewBox', `${c.x} ${c.y} ${c.w} ${c.h}`);
    }, []);

    /** Tween the camera to a framing. */
    const flyTo = useCallback(
        (view: { x: number; y: number; w: number; h: number }, duration = 1.2) => {
            gsap.to(cam.current, {
                ...view,
                duration,
                ease: 'power3.inOut',
                overwrite: 'auto',
                onUpdate: applyCamera,
            });
        },
        [applyCamera]
    );

    /** Dim / illuminate nodes + trucks for the current focus. */
    const applyFocus = useCallback((region: Region, focus: Market | null) => {
        const root = rootRef.current;
        if (!root) return;
        const lit = focus ? focus.region : region;
        root.querySelectorAll<SVGGElement>('[data-node]').forEach((g) => {
            const m = MARKETS.find((x) => x.id === g.dataset.node)!;
            const on = focus ? m.id === focus.id : region === 'NATIONAL' || m.region === region;
            gsap.to(g, {
                opacity: on ? 1 : focus ? 0.2 : 0.3,
                duration: 0.8,
                ease: 'power2.out',
                overwrite: 'auto',
            });
        });
        // Trucks follow the same focus rules as the corridor they ride.
        root.querySelectorAll<SVGGElement>('[data-truck]').forEach((g) => {
            const on = region === 'NATIONAL' && !focus ? true : (g.dataset.truck ?? '').includes(lit);
            gsap.to(g, { opacity: on ? 1 : 0, duration: 0.6, overwrite: 'auto' });
        });
    }, []);

    /** Stroke-draw the corridors belonging to the current tab. */
    const drawCorridors = useCallback((region: Region) => {
        const root = rootRef.current;
        if (!root) return;
        root.querySelectorAll<SVGPathElement>('[data-corridor]').forEach((path, i) => {
            const belongs = region === 'NATIONAL' || (path.dataset.corridor ?? '').includes(region);
            const len = path.getTotalLength();
            if (belongs) {
                gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
                gsap.to(path, {
                    strokeDashoffset: 0,
                    duration: 1.3,
                    delay: 0.2 + i * 0.1,
                    ease: 'power2.inOut',
                    overwrite: 'auto',
                });
            } else {
                gsap.to(path, { opacity: 0.12, duration: 0.5, overwrite: 'auto' });
            }
        });
    }, []);

    /* ----- intents -------------------------------------------------- */

    const selectRegion = useCallback(
        (region: Region) => {
            setActiveRegion(region);
            setActiveMarket(null);
            activeRegionRef.current = region;
            flyTo(REGION_VIEWS[region]);
            applyFocus(region, null);
            drawCorridors(region);
        },
        [flyTo, applyFocus, drawCorridors]
    );

    const selectMarket = useCallback(
        (m: Market) => {
            setActiveMarket(m);
            const w = 520;
            const h = w * (REGION_VIEWS.NATIONAL.h / REGION_VIEWS.NATIONAL.w);
            flyTo({ x: m.x - w / 2, y: m.y - h / 2, w, h }, 1.3);
            applyFocus(activeRegionRef.current, m);
        },
        [flyTo, applyFocus]
    );

    const clearMarket = useCallback(() => {
        setActiveMarket(null);
        flyTo(REGION_VIEWS[activeRegionRef.current], 1.1);
        applyFocus(activeRegionRef.current, null);
    }, [flyTo, applyFocus]);

    /* ----- direct manipulation (pan + zoom) -------------------------- */

    /** Zoom by a factor, keeping `anchor` (map units) visually fixed. */
    const zoomBy = useCallback(
        (factor: number, anchor?: { x: number; y: number }) => {
            gsap.killTweensOf(cam.current);
            const c = cam.current;
            const ax = anchor?.x ?? c.x + c.w / 2;
            const ay = anchor?.y ?? c.y + c.h / 2;
            // Where the anchor sits proportionally inside the current view.
            const rx = (ax - c.x) / c.w;
            const ry = (ay - c.y) / c.h;
            const nw = gsap.utils.clamp(MIN_VIEW_W, MAX_VIEW_W, c.w * factor);
            const nh = nw * (REGION_VIEWS.NATIONAL.h / REGION_VIEWS.NATIONAL.w);
            c.x = ax - rx * nw;
            c.y = ay - ry * nh;
            c.w = nw;
            c.h = nh;
            clampCam();
            applyCamera();
        },
        [clampCam, applyCamera]
    );

    /** Pointer position → map units. */
    const toMapPoint = useCallback((clientX: number, clientY: number) => {
        const svg = svgRef.current;
        if (!svg) return null;
        const ctm = svg.getScreenCTM();
        if (!ctm) return null;
        return new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    }, []);

    /** Past this much pointer travel a press counts as a pan, not a tap. */
    const DRAG_SLOP = 6;

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        if (e.button !== 0) return;
        gsap.killTweensOf(cam.current);
        // NB: pointer capture is deliberately NOT taken here. Capturing on
        // press retargets the follow-up `click` to the stage, so taps would
        // never reach a market node and its card could never open. Capture is
        // claimed lazily below, once the press is definitely a drag.
        drag.current = { on: true, px: e.clientX, py: e.clientY, moved: 0, id: e.pointerId, captured: false };
    }, []);

    const onPointerMove = useCallback(
        (e: React.PointerEvent) => {
            const d = drag.current;
            if (!d.on) return;
            const svg = svgRef.current;
            const ctm = svg?.getScreenCTM();
            if (!ctm) return;
            const dx = e.clientX - d.px;
            const dy = e.clientY - d.py;
            d.moved += Math.abs(dx) + Math.abs(dy);
            d.px = e.clientX;
            d.py = e.clientY;
            // Once it is clearly a pan, take the pointer so the drag survives
            // the cursor leaving the stage.
            if (!d.captured && d.moved > DRAG_SLOP) {
                d.captured = true;
                setIsDragging(true);
                try {
                    (e.currentTarget as HTMLElement).setPointerCapture(d.id);
                } catch {
                    /* capture unavailable — panning still works in-bounds */
                }
            }
            // Convert the pixel delta into map units via the live scale.
            cam.current.x -= dx / ctm.a;
            cam.current.y -= dy / ctm.d;
            clampCam();
            applyCamera();
        },
        [clampCam, applyCamera]
    );

    const onPointerUp = useCallback((e: React.PointerEvent) => {
        const d = drag.current;
        d.on = false;
        setIsDragging(false);
        if (d.captured) {
            d.captured = false;
            try {
                (e.currentTarget as HTMLElement).releasePointerCapture(d.id);
            } catch {
                /* pointer already released */
            }
        }
    }, []);

    /**
     * Wheel zoom. Only claims the wheel once the map is zoomed in past the
     * national framing (or when a modifier is held), so ordinary page
     * scrolling over the section is never hijacked.
     */
    const onWheel = useCallback(
        (e: React.WheelEvent) => {
            // Never claim the wheel while the section is still scrubbing open.
            if (!expandedRef.current) return;
            const zoomedIn = cam.current.w < REGION_VIEWS.NATIONAL.w - 1;
            if (!zoomedIn && !e.ctrlKey && !e.metaKey) return;
            e.preventDefault();
            const p = toMapPoint(e.clientX, e.clientY);
            zoomBy(e.deltaY > 0 ? 1.12 : 0.89, p ? { x: p.x, y: p.y } : undefined);
        },
        [toMapPoint, zoomBy]
    );

    const zoomIn = useCallback(() => zoomBy(0.75), [zoomBy]);
    const zoomOut = useCallback(() => zoomBy(1.33), [zoomBy]);

    const resetView = useCallback(() => {
        setActiveMarket(null);
        setActiveRegion('NATIONAL');
        activeRegionRef.current = 'NATIONAL';
        flyTo(REGION_VIEWS.NATIONAL);
        applyFocus('NATIONAL', null);
        drawCorridors('NATIONAL');
    }, [flyTo, applyFocus, drawCorridors]);

    /* ----- lifecycle ------------------------------------------------ */

    /** Flip interaction on/off as the map finishes opening. */
    const setExpandedOnce = useCallback((next: boolean) => {
        if (expandedRef.current === next) return;
        expandedRef.current = next;
        setExpanded(next);
    }, []);

    useGSAP(
        () => {
            applyCamera();
            // Lay the corridors down immediately so the trucks always have a
            // visible road under them — the scroll-triggered redraw below is
            // just the flourish, not what makes them exist.
            drawCorridors('NATIONAL');

            // Entrance: heading + stats reveal as the section scrolls into view.
            gsap.from('[data-mc-head] > *', {
                y: 22,
                autoAlpha: 0,
                duration: 0.7,
                stagger: 0.08,
                ease: 'power3.out',
                scrollTrigger: { trigger: rootRef.current, start: 'top 75%', once: true },
            });
            gsap.from('[data-mc-stat]', {
                y: 16,
                autoAlpha: 0,
                duration: 0.5,
                stagger: 0.07,
                ease: 'power3.out',
                scrollTrigger: { trigger: rootRef.current, start: 'top 65%', once: true },
                onComplete: () => drawCorridors('NATIONAL'),
            });

            setExpandedOnce(false);

            const tl = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'top top',
                    end: 'bottom bottom',
                    pin: pinRef.current,
                    scrub: 0.6,
                    anticipatePin: 1,
                    onUpdate: (self) => setExpandedOnce(self.progress > 0.5),
                },
            });

            tl.fromTo(
                mapWrapRef.current,
                { yPercent: 68, scaleX: 0.92, scaleY: 0.92, transformOrigin: '50% 0%', borderRadius: 20 },
                { yPercent: 0, scaleX: 1, scaleY: 1, borderRadius: 0, duration: 0.6 },
                0
            )
                .fromTo(
                    introRef.current,
                    { yPercent: 0, autoAlpha: 1 },
                    { yPercent: -20, autoAlpha: 0, duration: 0.45, ease: 'power1.in' },
                    0.05
                )
                .fromTo(
                    '[data-mc-ui]',
                    { autoAlpha: 0 },
                    { autoAlpha: 1, duration: 0.15 },
                    0.5
                );

            /* ---------- Truck pins ----------
             * One truck per corridor. The pin travels the route but is never
             * rotated, so the side-on truck art stays upright and legible;
             * direction is carried entirely by the heading arrow.
             *
             * The arrow angle is read from the route's own tangent at the
             * truck's current progress rather than from frame-to-frame position
             * deltas — the tangent is exact at every point, so the arrow tracks
             * each bend of the route instead of drifting toward one heading. */
            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                gsap.utils.toArray<SVGGElement>('[data-truck]').forEach((truck, i) => {
                    const spec = TRUCKS[i];
                    const sel = `#corridor-${spec.corridor}`;
                    const pathEl = rootRef.current?.querySelector<SVGPathElement>(sel);
                    if (!pathEl) return;

                    const scaleG = truck.querySelector<SVGGElement>('[data-truck-scale]');
                    const artG = truck.querySelector<SVGGElement>('[data-truck-art]');
                    const arrowG = truck.querySelector<SVGGElement>('[data-truck-arrow]');
                    const L = pathEl.getTotalLength();
                    let angle: number | null = null;
                    let dir = 1;

                    const tween = gsap.to(truck, {
                        motionPath: { path: sel, align: sel, alignOrigin: [0.5, 0.5], autoRotate: false },
                        duration: Math.max(12, L / TRUCK_SPEED),
                        delay: spec.delay,
                        repeat: -1,
                        ease: 'none',
                        onUpdate: () => {
                            // Sample the route just before and after the truck to
                            // get the true direction of travel at this point.
                            const d = tween.progress() * L;
                            const a = pathEl.getPointAtLength(Math.max(0, d - 3));
                            const b = pathEl.getPointAtLength(Math.min(L, d + 3));
                            const dx = b.x - a.x;
                            const dy = b.y - a.y;
                            if (dx || dy) {
                                // +90 because the arrow art points "up" at 0deg.
                                const target = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
                                if (angle === null) {
                                    angle = target;
                                } else {
                                    // Shortest-path easing so the arrow sweeps
                                    // around elbows instead of snapping.
                                    const delta = ((target - angle + 540) % 360) - 180;
                                    angle += delta * 0.2;
                                }
                                if (Math.abs(dx) > 0.001) dir = dx > 0 ? 1 : -1;
                            }
                            const k = (cam.current.w / REGION_VIEWS.NATIONAL.w) * 2;
                            // Native SVG transforms, not GSAP's: each of these
                            // groups is authored around a (0,0) origin, so
                            // scale/rotate pivot on the pin's centre exactly.
                            // GSAP would infer a pivot from getBBox instead,
                            // which throws the arrow off its orbit.
                            scaleG?.setAttribute('transform', `scale(${k})`);
                            arrowG?.setAttribute('transform', `rotate(${(angle ?? 0).toFixed(2)})`);
                            artG?.setAttribute('transform', `scale(${dir},1)`);
                        },
                    });
                });
            }
        },
        { scope: rootRef }
    );

    // Crossfade the left stats panel whenever the selection changes.
    useGSAP(
        () => {
            if (!panelRef.current) return;
            gsap.fromTo(
                panelRef.current,
                { autoAlpha: 0, y: 12 },
                { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }
            );
        },
        { dependencies: [activeMarket], scope: rootRef }
    );

    // The wheel handler must be non-passive to be able to preventDefault.
    useEffect(() => {
        const el = stageRef.current;
        if (!el) return;
        const handler = (e: WheelEvent) => {
            if (!expandedRef.current) return;
            const zoomedIn = cam.current.w < REGION_VIEWS.NATIONAL.w - 1;
            if (!zoomedIn && !e.ctrlKey && !e.metaKey) return;
            e.preventDefault();
        };
        el.addEventListener('wheel', handler, { passive: false });
        return () => el.removeEventListener('wheel', handler);
    }, []);

    /* ----- render ---------------------------------------------------- */

    return (
        <section
            ref={rootRef}
            className="relative w-full bg-[#EEE8D9] transition-colors duration-300 h-[220vh] sm:h-[240vh] lg:h-[260vh] dark:bg-[#0A0A0A]"
        >
            <style>{`
                /* Landmass outline — the inlined map reads this. */
                .mc-map-scope { --map-stroke: rgba(26,25,23,0.45); }
                :where(.dark) .mc-map-scope { --map-stroke: rgba(255,255,255,0.38); }
                @keyframes mc-pulse {
                    0%   { transform: scale(0.4); opacity: 0.7; }
                    100% { transform: scale(2.8); opacity: 0; }
                }
                .mc-pulse {
                    transform-box: fill-box; transform-origin: center;
                    animation: mc-pulse 2.8s cubic-bezier(0.2,0.6,0.4,1) infinite;
                }
                .mc-pulse--late { animation-delay: 1.4s; }
                .mc-hot:hover .mc-pulse { animation-duration: 1.1s; }
                .mc-stem {
                    transform-box: fill-box; transform-origin: center bottom;
                    transform: scaleY(0);
                    transition: transform .32s cubic-bezier(.2,.8,.2,1);
                }
                .mc-hot:hover .mc-stem { transform: scaleY(1); }
                .mc-tag { opacity: 0; transition: opacity .14s linear; }
                .mc-hot:hover .mc-tag { opacity: 1; }
                .mc-core { transition: r .25s ease; }
                .mc-hot:hover .mc-core { r: 14; }
                /* Sonar rings radiating from each travelling truck pin. */
                @keyframes mc-ping {
                    0%   { transform: scale(0.7); opacity: 0.6; }
                    100% { transform: scale(2.1); opacity: 0; }
                }
                .mc-ping {
                    transform-box: fill-box; transform-origin: center;
                    animation: mc-ping 2.4s cubic-bezier(0.2,0.6,0.4,1) infinite;
                }
                .mc-ping--late { animation-delay: 1.2s; }
                @media (prefers-reduced-motion: reduce) {
                    .mc-pulse, .mc-ping { animation: none; opacity: 0; }
                    .mc-stem { transition: none; }
                }
            `}</style>

            {/* The frame that gets pinned for the whole scroll sequence. */}
            <div
                ref={pinRef}
                className="relative w-full overflow-hidden h-screen h-[100dvh]"
            >
                {/* ============ INTRO: heading, copy + national stats ============ */}
                <div
                    ref={introRef}
                    className="absolute inset-x-0 top-0 z-10 mx-auto w-full max-w-[1100px] px-4 pt-[5vh] text-center sm:px-6 sm:pt-[8vh] md:px-[60px] lg:pt-[14vh]"
                >
                    <div data-mc-head>
                        <p className="font-tommy-regular text-[10px] uppercase tracking-[3px] text-black/50 sm:text-[11px] sm:tracking-[4px] md:text-[13px] dark:text-white/50">
                            Markets &amp; Coverage
                        </p>
                        <h2 className="mt-2 font-tommy-bold text-[22px] leading-[0.95] text-black sm:text-[28px] md:text-[clamp(1.75rem,3vw,2.75rem)] lg:tracking-[-1.5px] dark:text-white">
                            Where We Roll<span className="text-[#FCD119]">.</span>
                        </h2>
                        <p className="mx-auto mt-2 font-tommy-regular text-[11.5px] leading-[1.6] text-black/60 sm:mt-3 sm:text-[14px] sm:leading-[1.7] md:text-[16px] lg:mt-5 lg:max-w-[620px] dark:text-white/55">
                            {totals.count} metro markets from coast to coast, reaching{' '}
                            {compact(totals.adults)} adults 18+ inside our coverage areas —
                            every mile measured, every market accounted for.
                        </p>
                    </div>

                    {/* National coverage totals */}
                    <div className="mx-auto mt-4 grid max-w-[900px] grid-cols-2 gap-2 sm:mt-6 sm:gap-3 md:mt-9 md:grid-cols-4 md:gap-4">
                        {[
                            { k: `${totals.count}`, l: 'Metro Markets' },
                            { k: compact(totals.adults), l: 'Adults 18+ Reached' },
                            { k: compact(totals.impressions), l: 'Impressions / Flight' },
                            { k: '4 Wks', l: 'Standard Flight' },
                        ].map((s) => (
                            <div
                                key={s.l}
                                data-mc-stat
                                className="rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2.5 text-left sm:px-4 sm:py-4 dark:border-white/10 dark:bg-white/[0.04]"
                            >
                                <p className="font-tommy-bold text-[18px] leading-none text-black sm:text-[24px] md:text-[34px] dark:text-white">
                                    {s.k}
                                </p>
                                <p className="mt-1 font-tommy-regular text-[9.5px] uppercase tracking-[1.5px] text-black/45 sm:text-[11px] sm:tracking-[2px] dark:text-white/45">
                                    {s.l}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Scroll affordance — shown on all viewports */}
                    <p className="mt-4 block font-tommy-regular text-[9.5px] uppercase tracking-[2.5px] text-black/35 sm:mt-6 sm:text-[10.5px] sm:tracking-[3px] dark:text-white/35">
                        Scroll to open the coverage map ↓
                    </p>
                </div>

                {/* ================= THE MAP ================= */}
                <div
                    ref={mapWrapRef}
                    className="absolute inset-0 z-20 overflow-hidden p-0"
                >
                    <div
                        ref={stageRef}
                        className={`mc-map-scope relative h-full w-full touch-none select-none overflow-hidden bg-transparent ${expanded ? '' : 'pointer-events-none'
                            }`}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={onPointerUp}
                        onWheel={onWheel}
                        onDoubleClick={(e) => {
                            const p = toMapPoint(e.clientX, e.clientY);
                            zoomBy(0.6, p ? { x: p.x, y: p.y } : undefined);
                        }}
                    >
                        <svg
                            ref={svgRef}
                            viewBox={`${REGION_VIEWS.NATIONAL.x} ${REGION_VIEWS.NATIONAL.y} ${REGION_VIEWS.NATIONAL.w} ${REGION_VIEWS.NATIONAL.h}`}
                            preserveAspectRatio="xMidYMid meet"
                            className={`h-full w-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                            role="img"
                            aria-label="Map of United States coverage markets"
                        >
                            <defs>
                                <filter id="mc-glow" x="-80%" y="-80%" width="260%" height="260%">
                                    <feGaussianBlur stdDeviation="3.6" result="b" />
                                    <feMerge>
                                        <feMergeNode in="b" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                                {/* Brushed-metal bezel for the truck pins */}
                                <linearGradient id="mc-bezel" x1="0" y1="0" x2="0.35" y2="1">
                                    <stop offset="0" stopColor="#fbf7ee" />
                                    <stop offset="0.35" stopColor="#8f98a6" />
                                    <stop offset="0.62" stopColor="#e9e3d6" />
                                    <stop offset="1" stopColor="#767f8c" />
                                </linearGradient>
                            </defs>

                            {/* US map — stroke only, so the section background shows
                                through (see UsMap). */}
                            <UsMap />

                            {/* State names */}
                            <g className="pointer-events-none select-none fill-black/60 dark:fill-white/55" aria-hidden="true">
                                {STATE_LABELS.map((st) => (
                                    <text
                                        key={st.s}
                                        x={st.x}
                                        y={st.y}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontSize="20"
                                        letterSpacing="1"
                                        style={{ fontFamily: 'var(--font-tommy-medium)' }}
                                    >
                                        {st.s}
                                    </text>
                                ))}
                            </g>

                            {/* Interstate corridors — delicate infrastructure lines
                            that sit under the traffic, never competing with the
                            landmass. */}
                            <g fill="none" stroke="#C8992B" className="dark:stroke-[#FCD119]" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                {CORRIDORS.map((c) => (
                                    <path
                                        key={c.id}
                                        id={`corridor-${c.id}`}
                                        data-corridor={c.region}
                                        d={c.d}
                                        opacity="0"
                                        strokeOpacity="0.75"
                                    />
                                ))}
                            </g>

                            {/* Market nodes */}
                            {MARKETS.map((m) => {
                                const r = radiusOf(m);
                                const on = activeMarket?.id === m.id;
                                return (
                                    <g
                                        key={m.id}
                                        data-node={m.id}
                                        className="mc-hot cursor-pointer"
                                        onClick={() => {
                                            // Ignore the click that ends a drag.
                                            if (drag.current.moved > 6) return;
                                            if (on) clearMarket();
                                            else selectMarket(m);
                                        }}
                                        role="button"
                                        aria-label={`${m.city} — view coverage stats`}
                                    >
                                        <circle cx={m.x} cy={m.y} r={Math.max(26, r + 16)} fill="transparent" />
                                        {/* Rings are reserved for the very top markets —
                                        any lower and the map turns into noise. */}
                                        {m.impressions > 1300000 && (
                                            <>
                                                <circle className="mc-pulse" cx={m.x} cy={m.y} r={r + 6} fill="none" stroke="#FCD119" strokeWidth="1" />
                                                <circle className="mc-pulse mc-pulse--late" cx={m.x} cy={m.y} r={r + 6} fill="none" stroke="#FCD119" strokeWidth="0.8" />
                                            </>
                                        )}
                                        <circle
                                            className="mc-core"
                                            cx={m.x}
                                            cy={m.y}
                                            r={on ? r + 2.4 : r}
                                            fill="#FCD119"
                                            stroke={on ? '#ffffff' : 'rgba(0,0,0,0.35)'}
                                            strokeWidth={on ? 1.6 : 0.8}
                                            filter="url(#mc-glow)"
                                        />
                                        <circle cx={m.x} cy={m.y} r={r * 0.34} fill="#1a1d24" />
                                        <line className="mc-stem" x1={m.x} y1={m.y - r - 2} x2={m.x} y2={m.y - r - 44} stroke="#ffffff" strokeWidth="1.8" />
                                        <text
                                            className={on ? 'select-none' : 'mc-tag select-none'}
                                            x={m.x}
                                            y={m.y - r - (on ? 16 : 54)}
                                            textAnchor="middle"
                                            fill="#ffffff"
                                            fontSize="17"
                                            letterSpacing="0.3"
                                            style={{
                                                fontFamily: 'var(--font-tommy-medium)',
                                                paintOrder: 'stroke',
                                                stroke: 'rgba(12,15,20,0.85)',
                                                strokeWidth: 6.8,
                                                strokeLinejoin: 'round',
                                            }}
                                        >
                                            {m.city} · {compact(m.impressions)}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* ---------- Live truck pins, one per corridor ----------
                            Painted last so a truck always rides OVER the market
                            nodes it passes — SVG has no z-index, stacking is
                            document order. `pointer-events: none` keeps a passing
                            truck from swallowing clicks meant for a node. */}
                            {TRUCKS.map((t) => (
                                <g key={t.corridor} data-truck={t.region} className="pointer-events-none">
                                    {/* This invisible circle keeps the group's bounding
                                    box symmetric about (0,0). MotionPath's
                                    alignOrigin snaps the bbox centre to the route,
                                    so without it the protruding arrow would drag
                                    the whole pin off the road. */}
                                    <circle r="26" fill="none" />
                                    {/* Every child is authored around (0,0) — the pin's
                                    centre — so native scale/rotate pivot on it. */}
                                    <g data-truck-scale>
                                        {/* Sonar rings radiating off the pin */}
                                        <circle className="mc-ping" r="15" fill="none" stroke="#FCD119" strokeWidth="1.3" />
                                        <circle className="mc-ping mc-ping--late" r="15" fill="none" stroke="#FCD119" strokeWidth="1" />

                                        {/* Heading arrow — rides the ring edge so it
                                        reads as part of the pin. Only this rotates. */}
                                        <g data-truck-arrow>
                                            <path
                                                d="M 0 -25 L 5.6 -16.2 L 0 -18.6 L -5.6 -16.2 Z"
                                                fill="#FCD119"
                                                stroke="#12161d"
                                                strokeWidth="0.8"
                                                strokeLinejoin="round"
                                            />
                                        </g>

                                        {/* Glowing halo + brushed bezel + dark face */}
                                        <circle r="15" fill="none" stroke="#FCD119" strokeWidth="2.6" filter="url(#mc-glow)" />
                                        <circle r="12.8" fill="none" stroke="url(#mc-bezel)" strokeWidth="2.4" />
                                        <circle r="11.3" fill="#12161d" />

                                        {/* Truck art — upright, mirrored by heading */}
                                        <g data-truck-art>
                                            <image href={TRUCK_SRC} x="-10" y="-3.09" width="20" height="6.18" />
                                        </g>
                                    </g>
                                </g>
                            ))}
                        </svg>

                        {/* ---------- Region tabs, floating over the map ---------- */}
                        <nav
                            data-mc-ui
                            /* On desktop the map runs full-bleed under the site's fixed
                               header, so the tabs are dropped clear of it. That header's
                               height tracks the viewport width (its py is 2% of vw), so
                               the offset has to as well: 50px logo + 4vw padding + 14px
                               gap. A fixed px value only clears the header at one width. */
                            className="pointer-events-auto absolute inset-x-2 top-14 z-20 mx-auto flex w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-white/15 bg-black/35 p-1 backdrop-blur-md sm:top-16 md:inset-x-3 md:gap-1 lg:top-[calc(64px+4vw)]"
                            aria-label="Coverage regions"
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            {REGIONS.map((region) => {
                                const active = region === activeRegion && !activeMarket;
                                const n =
                                    region === 'NATIONAL'
                                        ? MARKETS.length
                                        : MARKETS.filter((m) => m.region === region).length;
                                return (
                                    <button
                                        key={region}
                                        onClick={() => selectRegion(region)}
                                        className={`shrink-0 rounded-full px-3 py-1.5 font-tommy-medium text-[10px] uppercase tracking-[1.5px] transition-colors duration-300 md:px-4 md:text-[11px] ${active
                                            ? 'bg-[#FCD119] text-black'
                                            : 'text-white/60 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {region}
                                        <span className="ml-1 opacity-60">{n}</span>
                                    </button>
                                );
                            })}
                        </nav>

                        {/* ---------- Zoom controls ---------- */}
                        <div
                            data-mc-ui
                            className="absolute bottom-2.5 right-2.5 z-20 flex flex-col gap-1 md:bottom-3 md:right-3"
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={zoomIn}
                                title="Zoom in"
                                aria-label="Zoom in"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-black/40 font-tommy-medium text-[15px] text-white/80 backdrop-blur-md transition-colors hover:bg-black/60 hover:text-white"
                            >
                                +
                            </button>
                            <button
                                onClick={zoomOut}
                                title="Zoom out"
                                aria-label="Zoom out"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-black/40 font-tommy-medium text-[15px] text-white/80 backdrop-blur-md transition-colors hover:bg-black/60 hover:text-white"
                            >
                                −
                            </button>
                            <button
                                onClick={resetView}
                                title="Reset view"
                                aria-label="Reset view"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition-colors hover:bg-black/60 hover:text-white"
                            >
                                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                                    <path d="M2 7a5 5 0 1 1 1.5 3.6M2 11V7.5h3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>

                        {/* ---------- Selected market panel ---------- */}
                        {activeMarket && (
                            <div
                                ref={panelRef}
                                className="absolute inset-x-2.5 bottom-2.5 z-30 md:inset-x-auto md:left-3 md:top-1/2 md:w-[320px] md:-translate-y-1/2"
                                onPointerDown={(e) => e.stopPropagation()}
                            >
                                <div className="rounded-2xl border border-white/15 bg-[#151a22]/70 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-[12px]">
                                    <div className="mb-4 flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-tommy-regular text-[10px] uppercase tracking-[3px] text-[#FCD119]">
                                                {activeMarket.region} · Selected Market
                                            </p>
                                            <h3 className="mt-1 font-tommy-bold text-[19px] leading-tight text-white md:text-[22px]">
                                                {activeMarket.city}
                                            </h3>
                                        </div>
                                        <button
                                            onClick={clearMarket}
                                            aria-label="Clear selected market"
                                            className="shrink-0 rounded-full border border-white/15 p-1.5 text-white/50 transition-colors hover:text-white"
                                        >
                                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                                <path d="M1 1 L11 11 M11 1 L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="mb-4 rounded-xl bg-[#FCD119]/10 px-4 py-3">
                                        <p className="font-tommy-bold text-[26px] leading-none text-[#FCD119]">
                                            {fmt(activeMarket.impressions)}
                                        </p>
                                        <p className="mt-1.5 font-tommy-regular text-[10px] uppercase tracking-[2px] text-white/50">
                                            Impressions / truck · 4-wk flight
                                        </p>
                                    </div>

                                    <dl className="space-y-2.5">
                                        {(
                                            [
                                                ['Adults 18+ Reached', fmt(activeMarket.adults)],
                                                ['Metro 18+ Population', fmt(activeMarket.pop18)],
                                                ['Coverage Rate', `${Math.round((activeMarket.adults / activeMarket.pop18) * 100)}% of 18+`],
                                            ] as const
                                        ).map(([label, value]) => (
                                            <div
                                                key={label}
                                                className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-2.5 last:border-0 last:pb-0"
                                            >
                                                <dt className="font-tommy-regular text-[10.5px] uppercase tracking-[1.5px] text-white/45">
                                                    {label}
                                                </dt>
                                                <dd className="text-right font-tommy-medium text-[13.5px] text-white">
                                                    {value}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>

                                    {activeMarket.audience && (
                                        <p className="mt-3 font-tommy-regular text-[11px] leading-[1.5] text-white/45">
                                            {activeMarket.audience}
                                        </p>
                                    )}

                                    {/* The truck asset, shown at its natural
                                    side-on orientation where it actually reads. */}
                                    <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
                                        <img
                                            src={TRUCK_SRC}
                                            alt=""
                                            aria-hidden="true"
                                            className="h-auto w-[86px] shrink-0 opacity-90"
                                        />
                                        <p className="font-tommy-regular text-[10px] uppercase leading-[1.5] tracking-[1.5px] text-white/40">
                                            Full-wrap fleet
                                            <br />
                                            in market
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ---------- Hint / legend ---------- */}
                        <div
                            data-mc-ui
                            className="pointer-events-none absolute bottom-2.5 left-2.5 hidden items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 backdrop-blur-md md:bottom-3 md:left-3 md:flex"
                        >
                            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="text-white/60">
                                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                            </svg>
                            <span className="font-tommy-regular text-[10px] uppercase tracking-[1.5px] text-white/60">
                                Drag to pan · node size = impressions
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
