'use client';

/**
 * MarketsCoverage V2 — the roll call.
 *
 * No map, no trucks. The section pins and plays against one scrubbed timeline:
 *
 *   ACT 1  Intro — "Where We Roll", the national totals, the invitation to open
 *          the coverage list.
 *   ACT 2  Roll call — the 31 covered STATES scroll vertically past a fixed
 *          reading line, set oversized in the wordmark weight.
 *   ACT 3  Detail — clicking a state that holds several markets slots its
 *          cities in beneath it, indented. Clicking a city opens its full
 *          record. Twenty of the thirty-one states hold a single market, so
 *          those skip the middle step and open the detail on the first click.
 *
 * TWO INVARIANTS HOLD THIS TOGETHER — break either and the highlight drifts off
 * the reading line:
 *
 *   1. EVERY row is the same height, city rows included. The active index is
 *      then just `-y / rowHeight` — O(1), no layout reads. Measuring 50-odd
 *      nodes per scroll tick would be the obvious approach and the wrong one.
 *   2. The list track is offset by HALF A ROW, not half its own height, so row
 *      zero starts on the line rather than the middle of the column.
 *
 * Expanding a state changes the row count, which changes the scroll-to-y
 * mapping. `seatIndex()` re-seats the scroll afterwards so the state you
 * clicked stays exactly where you clicked it.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
    MARKETS,
    REGIONS,
    STATE_GROUPS,
    TOTALS,
    compact,
    fmt,
    type Market,
    type Region,
    type StateGroup,
} from '@/data/markets';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  Layout constants                                                   */
/* ------------------------------------------------------------------ */

/**
 * Row height per breakpoint. These MUST match the `h-[...]` utilities on the
 * list items AND the half-row offsets on the track. The index maths reads from
 * here; the rendering reads from the classes. A mismatch desynchronises the
 * highlight from the reading line silently.
 */
const ROW_H = { base: 32, md: 40, lg: 50, "Twxl": 60, "Txl": 84 };

/**
 * Mirrors the Tailwind breakpoints actually used on the `h-[...]` row
 * classes below: base < md(768) < lg(1024) < xl(1280) < 3xl(1920, the
 * project's only custom breakpoint — see `--breakpoint-3xl` in globals.css).
 * These MUST stay in sync or the index math measures a different row
 * height than what's on screen, drifting the active row off the line.
 */
const rowHeight = () => {
    if (typeof window === 'undefined') return ROW_H.lg;
    if (window.matchMedia('(min-width: 1920px)').matches) return ROW_H.Txl;
    if (window.matchMedia('(min-width: 1280px)').matches) return ROW_H.Twxl;
    if (window.matchMedia('(min-width: 1024px)').matches) return ROW_H.lg;
    if (window.matchMedia('(min-width: 768px)').matches) return ROW_H.md;
    return ROW_H.base;
};

/**
 * Scroll depth of the pinned sequence, in viewport heights.
 *
 * Tuned so the list travels roughly 1:1 with the scroll — at 61 rows (31 states
 * plus the 30 cities belonging to multi-market states) this works out at ~86px
 * of scroll per 84px row. Lower values make the names race past; much higher and
 * the section feels like it will never end.
 */
const SCROLL_VH = 7;

/**
 * Intro choreography, as fractions of the timeline.
 *
 *   0        → HOLD      intro sits still, fully readable
 *   HOLD     → SWAP_END  intro out and roll in, over the SAME window
 *   SWAP_END → INTRO_END roll settled at full opacity, nothing moving
 *   INTRO_END → 1        the list travels
 *
 * The crossfade endpoints deliberately coincide. When they didn't, there was a
 * trough around 0.05–0.08 where the intro had dropped to ~40% and the roll was
 * only ~30% in — so the heading looked "gone" and the names looked washed out,
 * both at once. Overlapping them keeps total ink on screen roughly constant.
 *
 * The settle window matters too: `activeIdx` is 0 for every progress below
 * INTRO_END (the list hasn't moved yet), so any partial opacity in here shows up
 * as a permanently faint first row.
 */
const INTRO_HOLD = 0.1;
const SWAP_END = 0.15;
const INTRO_END = 0.18;

const REGION_LABEL: Record<Region, string> = {
    WEST: 'West',
    CENTRAL: 'Central',
    SOUTH: 'South',
    NORTHEAST: 'Northeast',
};

/* ------------------------------------------------------------------ */
/*  Rows                                                               */
/* ------------------------------------------------------------------ */

type Row =
    | { kind: 'state'; key: string; group: StateGroup }
    | { kind: 'market'; key: string; market: Market };

/**
 * Flattens the groups into the scrolling row set.
 *
 * Every multi-market state ALWAYS carries its cities — there is no expand /
 * collapse. That is the whole point: the list is scroll-driven, so a state
 * opens simply by being scrolled to, and the cities underneath it are the next
 * few rows.
 *
 * It is also what makes the index maths safe. Row count used to change on
 * click, which meant re-mapping scroll→y mid-interaction; when that mapping was
 * a frame out of step you got a reading line saying row 27, a list showing row
 * 0 and a panel showing a third state entirely. A fixed row set cannot desync.
 *
 * Single-market states get NO child row — a state whose only market is the
 * state itself would just be the same name twice, so those rows resolve
 * straight to the market's detail.
 */
function buildRows(groups: StateGroup[]): Row[] {
    const rows: Row[] = [];
    for (const g of groups) {
        rows.push({ kind: 'state', key: g.state, group: g });
        if (g.markets.length > 1) {
            for (const m of g.markets) rows.push({ kind: 'market', key: m.id, market: m });
        }
    }
    return rows;
}

/* ------------------------------------------------------------------ */
/*  Panels                                                             */
/* ------------------------------------------------------------------ */

function PanelShell({ children, id }: { children: React.ReactNode; id: string }) {
    const ref = useRef<HTMLDivElement>(null);

    // Crossfade on subject change, so scrubbing reads as one panel updating
    // rather than a stack of panels swapping.
    useGSAP(
        () => {
            gsap.fromTo(
                ref.current,
                { autoAlpha: 0, y: 14 },
                { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' }
            );
        },
        { dependencies: [id], scope: ref }
    );

    return <div ref={ref} className="w-full">{children}</div>;
}

function ClearButton({ onClear }: { onClear: () => void }) {
    return (
        <button
            onClick={onClear}
            aria-label="Clear selection"
            className="shrink-0 rounded-full border border-black/15 p-2 text-[#6F6A60] transition-colors duration-300 hover:border-[#C8992B] hover:text-[#1A1917] dark:border-white/15 dark:text-[#9A968E] dark:hover:border-[#FCD119] dark:hover:text-white"
        >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M1 1 L11 11 M11 1 L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
        </button>
    );
}

/** The full record for one market. */
function MarketDetail({
    market,
    locked,
    onClear,
}: {
    market: Market;
    locked: boolean;
    onClear: () => void;
}) {
    const coverage = Math.round((market.adults / market.pop18) * 100);

    return (
        <PanelShell id={market.id + String(locked)}>
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="font-tommy-regular text-[10px] uppercase tracking-[3px] text-[#C8992B] dark:text-[#FCD119]">
                        {market.state} · {REGION_LABEL[market.region]} · Market #{market.rank}
                    </p>
                    <h3 className="mt-2 font-tommy-bold text-[clamp(22px,2.4vw,32px)] leading-[1.06] tracking-[-0.02em] text-[#1A1917] dark:text-white">
                        {market.name}
                    </h3>
                </div>
                {locked && <ClearButton onClear={onClear} />}
            </div>

            <div className="mt-2 md:mt-3 lg:mt-5 xl:mt-6 rounded-2xl border border-black/10 bg-black/[0.03] px-3 md:px-4 lg:px-5 py-2 md:py-3 lg:py-4 dark:border-white/10 dark:bg-white/[0.04]">
                <p className="font-tommy-bold text-[clamp(26px,3vw,40px)] leading-none tabular-nums tracking-[-0.02em] text-[#1A1917] dark:text-[#FCD119]">
                    {fmt(market.impressions)}
                </p>
                <p className="mt-2 font-tommy-regular text-[10px] uppercase tracking-[2px] text-[#6F6A60] dark:text-[#9A968E]">
                    Impressions / truck · 4-week flight
                </p>
            </div>

            <dl className="mt-5 space-y-3">
                {(
                    [
                        ['Adults 18+ reached', fmt(market.adults)],
                        ['Metro 18+ population', fmt(market.pop18)],
                        ['Coverage rate', `${coverage}% of 18+`],
                    ] as const
                ).map(([label, value]) => (
                    <div
                        key={label}
                        className="flex items-baseline justify-between gap-4 border-b border-black/10 pb-3 last:border-0 last:pb-0 dark:border-white/10"
                    >
                        <dt className="font-tommy-regular text-[10.5px] uppercase tracking-[1.5px] text-[#8A857C] dark:text-[#9A968E]">
                            {label}
                        </dt>
                        <dd className="text-right font-tommy-medium text-[14px] tabular-nums text-[#1A1917] dark:text-white">
                            {value}
                        </dd>
                    </div>
                ))}
            </dl>

            {/* Share of the metro our routes actually touch. */}
            <div className="mt-5 h-[3px] w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <span
                    className="block h-full rounded-full bg-[#C8992B] transition-[width] duration-500 ease-out dark:bg-[#FCD119]"
                    style={{ width: `${coverage}%` }}
                />
            </div>

            {market.audience && (
                <p className="mt-5 font-tommy-regular text-[12.5px] leading-[1.6] text-[#5A554C] dark:text-[#A8A399]">
                    {market.audience}
                </p>
            )}
        </PanelShell>
    );
}

/** Summary for a state you haven't drilled into yet. */
function StateSummary({
    group,
    onPick,
}: {
    group: StateGroup;
    onPick: (m: Market) => void;
}) {
    const many = group.markets.length > 1;

    return (
        <PanelShell id={group.state}>
            <p className="font-tommy-regular text-[10px] uppercase tracking-[3px] text-[#C8992B] dark:text-[#FCD119]">
                {REGION_LABEL[group.region]} · {group.markets.length}{' '}
                {many ? 'markets' : 'market'}
            </p>
            <h3 className="mt-2 font-tommy-bold text-[clamp(22px,2.4vw,32px)] leading-[1.06] tracking-[-0.02em] text-[#1A1917] dark:text-white">
                {group.label}
            </h3>

            <div className="mt-2 md:mt-4 lg:mt-6 grid grid-cols-2 gap-2 lg:gap-3">
                {[
                    { k: compact(group.adults), l: 'Adults 18+' },
                    { k: compact(group.impressions), l: 'Impressions / flight' },
                ].map((s) => (
                    <div
                        key={s.l}
                        className="rounded-2xl border border-black/10 bg-black/[0.03] px-2 md:px-3 lg:px-4 py-2 md:py-3 lg:py-3.5 dark:border-white/10 dark:bg-white/[0.04]"
                    >
                        <p className="font-tommy-bold text-[24px] leading-none tabular-nums text-[#1A1917] dark:text-[#FCD119]">
                            {s.k}
                        </p>
                        <p className="mt-1.5 font-tommy-regular text-[9.5px] uppercase tracking-[1.5px] text-[#6F6A60] dark:text-[#9A968E]">
                            {s.l}
                        </p>
                    </div>
                ))}
            </div>

            <ul className="mt-2 md:mt-4 lg:mt-6 space-y-1">
                {group.markets.map((m) => (
                    <li key={m.id}>
                        <button
                            onClick={() => onPick(m)}
                            className="group flex w-full items-baseline justify-between gap-4 border-b border-black/10 py-1 md:py-2 lg:py-3 text-left transition-colors duration-300 last:border-0 dark:border-white/10"
                        >
                            <span className="flex min-w-0 items-baseline gap-2.5">
                                <span className="text-[#C8992B] dark:text-[#FCD119]">↳</span>
                                <span className="truncate font-tommy-medium text-[14.5px] text-[#1A1917] transition-colors duration-300 group-hover:text-[#C8992B] dark:text-white dark:group-hover:text-[#FCD119]">
                                    {m.name}
                                </span>
                            </span>
                            <span className="shrink-0 font-tommy-regular text-[11.5px] tabular-nums text-[#8A857C] dark:text-[#9A968E]">
                                {compact(m.impressions)}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>

            <p className="mt-2 md:mt-4 lg:mt-6 font-tommy-regular text-[10.5px] uppercase tracking-[2px] text-[#8A857C] dark:text-[#9A968E]">
                {many ? 'Click the state to open its markets' : 'Click the state to open the detail'}
            </p>
        </PanelShell>
    );
}

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */

export default function MarketsCoverageV2() {
    const rootRef = useRef<HTMLElement>(null);
    const pinRef = useRef<HTMLDivElement>(null);
    const introRef = useRef<HTMLDivElement>(null);
    const rollRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    /** Live ScrollTrigger + timeline, so handlers can re-seat and invalidate. */
    const stRef = useRef<ScrollTrigger | null>(null);
    const tlRef = useRef<gsap.core.Timeline | null>(null);
    /**
     * Current row count, read at call time by the scroll callbacks.
     *
     * The timeline is created once and never rebuilt (see below), so it cannot
     * close over the count — it has to look it up on each tick instead.
     */
    const rowCountRef = useRef(0);
    /** Last count the refresh effect acted on — lets it skip the mount pass. */
    const lastCountRef = useRef(-1);

    const [activeIdx, setActiveIdx] = useState(0);
    const [lockedId, setLockedId] = useState<string | null>(null);
    const [regionFilter, setRegionFilter] = useState<Region | 'ALL'>('ALL');

    const groups = useMemo(
        () => (regionFilter === 'ALL' ? STATE_GROUPS : STATE_GROUPS.filter((g) => g.region === regionFilter)),
        [regionFilter]
    );
    // Only the region filter can change this now — scrolling never does.
    const rows = useMemo(() => buildRows(groups), [groups]);

    // Written during render so the scroll callbacks always see the current count.
    rowCountRef.current = rows.length;

    const activeRow = rows[Math.min(activeIdx, rows.length - 1)] ?? rows[0];
    const lockedMarket = lockedId ? MARKETS.find((m) => m.id === lockedId) : undefined;

    /**
     * The state the reading line is currently inside — a state row, or any of
     * its city rows. Used to keep the whole group visually bound together as
     * you scroll down through it.
     */
    const activeState =
        activeRow?.kind === 'state' ? activeRow.group.state : activeRow?.market.state;

    /* -------------------------------------------------------------- */
    /*  Scroll sequence                                                */
    /* -------------------------------------------------------------- */

    /**
     * Scrolls so that row `i` lands on the reading line.
     *
     * Reads the count from the ref, not from `rows`, so the callback stays
     * stable — it's a dependency of the effect below, and a new identity every
     * render would re-run that effect (and its refresh) on every state change.
     */
    const seatIndex = useCallback((i: number) => {
        const st = stRef.current;
        const count = rowCountRef.current;
        if (!st || count < 2) return;
        const p = INTRO_END + (1 - INTRO_END) * (i / (count - 1));
        window.scrollTo({ top: st.start + p * (st.end - st.start), behavior: 'auto' });
    }, []);

    /**
     * Built ONCE, on mount — note the empty dependency list.
     *
     * This trigger pins, and re-running the hook would revert the context and
     * kill the pin. Killing a pin removes its spacer, the document instantly
     * loses `SCROLL_VH` viewport heights, the browser clamps the scroll
     * position, and you land back at the top of the page with the section reset
     * to progress 0. Expanding a state changes the row count, so rebuilding on
     * that count is exactly the trap.
     *
     * Instead the row count is read through a ref at call time, and the y target
     * is a FUNCTION value. Changing the count therefore only needs an
     * `invalidate()` + `refresh()` (see the effect below) — the trigger, the pin
     * and the scroll position all survive untouched.
     */
    useGSAP(
        () => {
            const list = listRef.current;
            if (!list) return;

            const syncActive = () => {
                const count = rowCountRef.current;
                const y = Number(gsap.getProperty(list, 'y')) || 0;
                const idx = gsap.utils.clamp(0, count - 1, Math.round(-y / rowHeight()));
                setActiveIdx((prev) => (prev === idx ? prev : idx));
            };

            const tl = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'top top',
                    // Scroll depth is deliberately INDEPENDENT of the row count, so
                    // expanding a state can't change the page height. Extra rows
                    // just scroll by a little faster.
                    end: () => '+=' + window.innerHeight * SCROLL_VH,
                    pin: pinRef.current,
                    scrub: 0.6,
                    invalidateOnRefresh: true,
                    onUpdate: syncActive,
                    onRefresh: syncActive,
                },
            });

            tlRef.current = tl;
            stRef.current = tl.scrollTrigger ?? null;

            /* Act 1 — intro out and roll in, across ONE shared window.
             *
             * Both are `fromTo` with explicit start values, and that is load
             * bearing. `invalidate()` (called whenever a state expands) makes a
             * tween re-record its start from the element's CURRENT state. A
             * plain `.to()` on the intro therefore became "from autoAlpha 0 to
             * autoAlpha 0" the moment you expanded a state while scrolled past
             * the intro — and the heading never came back. `fromTo` re-records
             * the same explicit values, so it survives invalidation. */
            const swap = SWAP_END - INTRO_HOLD;

            tl.fromTo(
                introRef.current,
                { autoAlpha: 1, y: 0 },
                { autoAlpha: 0, y: -40, duration: swap },
                INTRO_HOLD
            ).fromTo(
                rollRef.current,
                { autoAlpha: 0, y: 30 },
                { autoAlpha: 1, y: 0, duration: swap },
                INTRO_HOLD
            );

            /* Act 2 — the roll call. Function value + invalidateOnRefresh so the
               travel distance is recomputed whenever the row count changes or the
               row height crosses a breakpoint. */
            tl.fromTo(
                list,
                { y: 0 },
                { y: () => -(rowCountRef.current - 1) * rowHeight(), duration: 1 - INTRO_END },
                INTRO_END
            );
        },
        { scope: rootRef }
    );

    /**
     * ONLY the region filter can change the row count now, and that is an
     * explicit reset rather than something that happens mid-scroll — so this
     * re-evaluates the y target and sends you back to the top of the new list.
     *
     * The mount pass is skipped (-1 sentinel): refreshing this trigger before
     * the sections above it have settled makes it measure the wrong start.
     */
    useEffect(() => {
        const st = stRef.current;
        if (!st) return;

        const first = lastCountRef.current === -1;
        lastCountRef.current = rows.length;
        if (first) return;

        // Scroll depth is fixed, so the document height hasn't moved and no
        // other trigger needs refreshing.
        tlRef.current?.invalidate();
        st.refresh();
        setActiveIdx(0);
        seatIndex(0);
    }, [rows, seatIndex]);

    /* -------------------------------------------------------------- */
    /*  Interaction                                                    */
    /* -------------------------------------------------------------- */

    /**
     * Clicking is now a convenience, not the way in — scrolling already opens
     * every state and walks its cities. A click just brings the row to the
     * reading line and holds its detail so the panel stops following the scroll.
     * Crucially it does NOT change the row set, so it cannot desync anything.
     */
    const onStateClick = useCallback(
        (g: StateGroup, index: number) => {
            seatIndex(index);
            // A single-market state resolves straight to its record; a
            // multi-market state has its cities on the rows below, so leave the
            // panel on the state summary.
            if (g.markets.length === 1) {
                setLockedId((prev) => (prev === g.markets[0].id ? null : g.markets[0].id));
            } else {
                setLockedId(null);
            }
        },
        [seatIndex]
    );

    const onMarketClick = useCallback((m: Market) => {
        setLockedId((prev) => (prev === m.id ? null : m.id));
    }, []);

    useEffect(() => {
        if (!lockedId) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setLockedId(null);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [lockedId]);

    /**
     * Re-measure once the page has actually finished laying out.
     *
     * The homepage stacks five pinned sections above and around this one, and
     * none of them reserve their spacer until their own trigger is built. Add
     * unsized images decoding after first paint and this section's `start` is
     * measured against a document that is still growing — so by the time you
     * scroll here, progress is already past the intro and the heading never
     * appears at all. A global refresh after `load` re-seats every trigger
     * against the settled layout.
     */
    useEffect(() => {
        const refresh = () => ScrollTrigger.refresh();

        if (document.readyState === 'complete') {
            const t = window.setTimeout(refresh, 120);
            return () => window.clearTimeout(t);
        }
        window.addEventListener('load', refresh);
        // Web fonts change the row metrics, so wait on those too.
        document.fonts?.ready.then(refresh).catch(() => { });
        return () => window.removeEventListener('load', refresh);
    }, []);

    const changeRegion = (r: Region | 'ALL') => {
        setRegionFilter(r);
        setLockedId(null);
        // The effect above handles the re-measure and the scroll reset.
    };

    /**
     * The falloff is encoded ENTIRELY in solid colour — no `opacity-*`.
     *
     * Opacity utilities multiply against whatever the ancestors are doing (the
     * roll container's own fade-in, the edge gradients), so the active row could
     * never be trusted to render at full strength. Baking the ramp into flat
     * hex values makes row zero exactly as black as it looks in the source, no
     * matter what is happening above it.
     */
    const toneFor = (i: number) => {
        const d = Math.abs(i - activeIdx);
        if (d === 0) return 'text-[#0F0E0D] dark:text-[#FCD119]';
        if (d === 1) return 'text-[#4A453D] dark:text-[#C9C4BA]';
        if (d === 2) return 'text-[#7C776D] dark:text-[#8A867E]';
        if (d === 3) return 'text-[#A5A096] dark:text-[#6A665F]';
        return 'text-[#C4BFB4] dark:text-[#3A3833]';
    };

    /* -------------------------------------------------------------- */
    /*  Panel content                                                  */
    /* -------------------------------------------------------------- */

    /**
     * The panel follows the reading line unless a row has been clicked.
     *
     * A single-market state resolves straight to that market's record — there is
     * no city row beneath it to scroll onto, so stopping at a state summary
     * would be a dead end.
     */
    const panel = lockedMarket ? (
        <MarketDetail market={lockedMarket} locked onClear={() => setLockedId(null)} />
    ) : activeRow?.kind === 'market' ? (
        <MarketDetail market={activeRow.market} locked={false} onClear={() => setLockedId(null)} />
    ) : activeRow?.group.markets.length === 1 ? (
        <MarketDetail market={activeRow.group.markets[0]} locked={false} onClear={() => setLockedId(null)} />
    ) : activeRow ? (
        <StateSummary group={activeRow.group} onPick={onMarketClick} />
    ) : null;

    return (
        <section
            ref={rootRef}
            className="relative w-full bg-[#EEE8D9] transition-colors duration-300 dark:bg-[#0A0A0A]"
        >
            <div ref={pinRef} className="relative h-screen w-full overflow-hidden">
                {/* ============ ACT 1 — intro ============ */}
                <div
                    ref={introRef}
                    className="absolute inset-x-0 top-0 z-20 mx-auto w-full max-w-[1100px] px-6 pt-[14vh] text-center md:px-12"
                >
                    <p className="font-tommy-regular text-[10px] uppercase tracking-[4px] text-[#8A857C] md:text-[13px] dark:text-[#9A968E]">
                        Markets &amp; Coverage
                    </p>
                    <h2 className="mt-3 font-tommy-bold text-[clamp(30px,4.4vw,64px)] leading-[0.96] tracking-[-0.03em] text-[#1A1917] dark:text-white">
                        Where We Roll<span className="text-[#C8992B] dark:text-[#FCD119]">.</span>
                    </h2>
                    <p className="mx-auto mt-5 max-w-[620px] font-tommy-regular text-[14px] leading-[1.7] text-[#5A554C] md:text-[17px] dark:text-[#A8A399]">
                        {TOTALS.count} metro markets across {STATE_GROUPS.length} states, reaching{' '}
                        {compact(TOTALS.adults)} adults 18+ inside our coverage areas — every mile
                        measured, every market accounted for.
                    </p>

                    <div className="mx-auto mt-9 grid max-w-[900px] grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                        {[
                            { k: String(TOTALS.count), l: 'Metro markets' },
                            { k: compact(TOTALS.adults), l: 'Adults 18+ reached' },
                            { k: compact(TOTALS.impressions), l: 'Impressions / flight' },
                            { k: '4 Wks', l: 'Standard flight' },
                        ].map((s) => (
                            <div
                                key={s.l}
                                className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-4 text-left dark:border-white/10 dark:bg-white/[0.04]"
                            >
                                <p className="font-tommy-bold text-[clamp(20px,2.4vw,34px)] leading-none tabular-nums text-[#1A1917] dark:text-white">
                                    {s.k}
                                </p>
                                <p className="mt-1.5 font-tommy-regular text-[10px] uppercase tracking-[2px] text-[#8A857C] dark:text-[#9A968E]">
                                    {s.l}
                                </p>
                            </div>
                        ))}
                    </div>

                    <p className="mt-9 font-tommy-regular text-[10px] uppercase tracking-[3px] text-[#8A857C] dark:text-[#9A968E]">
                        Scroll to explore the coverage areas ↓
                    </p>
                </div>

                {/* ============ ACTS 2 + 3 ============ */}
                <div ref={rollRef} className="absolute inset-0 z-10 flex flex-col pt-[3%]">
                    {/* Persistent section header.
                        The big intro clears out of the way, but the section still
                        needs to say what it is — losing the title entirely left the
                        roll call floating with no context. This is the same eyebrow
                        and wordmark, set small, and it stays for the whole phase. */}
                    <div className="shrink-0 px-4 md:px-8 pt-[15%] md:pt-[10%] lg:pt-[3.5vh] md:px-12">
                        <div className="mx-auto flex max-w-[1440px] flex-wrap items-end justify-between gap-x-8 gap-y-2 md:gap-y-3 lg:gap-y-4">
                            <div>
                                <p className="font-tommy-regular text-[9.5px] uppercase tracking-[3.5px] text-[#8A857C] md:text-[11px] dark:text-[#9A968E]">
                                    Markets &amp; Coverage
                                </p>
                                <h3 className="mt-1.5 font-tommy-bold text-[clamp(19px,2.1vw,30px)] leading-[1] tracking-[-0.02em] text-[#1A1917] dark:text-white">
                                    Where We Roll<span className="text-[#C8992B] dark:text-[#FCD119]">.</span>
                                </h3>
                            </div>

                            {/* Region filter */}
                            <div className="flex flex-wrap items-center gap-2">
                                {(['ALL', ...REGIONS] as const).map((r) => {
                                    const on = regionFilter === r;
                                    return (
                                        <button
                                            key={r}
                                            onClick={() => changeRegion(r)}
                                            className={`rounded-full border px-2 md:px-3 lg:px-4 py-1 lg:py-2 font-tommy-medium text-[8px] md:text-[11.5px] uppercase tracking-[1.5px] transition-colors duration-300 ${on
                                                ? 'border-transparent bg-[#1A1917] text-[#FCD119] dark:bg-[#FCD119] dark:text-black'
                                                : 'border-black/12 text-[#6F6A60] hover:border-[#C8992B]/50 hover:text-[#1A1917] dark:border-white/12 dark:text-[#9A968E] dark:hover:text-white'
                                                }`}
                                        >
                                            {r === 'ALL' ? 'All states' : REGION_LABEL[r]}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* `min-h-0` so the list column can actually shrink inside the
                        flex parent and its own `overflow-hidden` takes effect. */}
                    <div className="mx-auto grid min-h-0 w-full max-w-[1440px] flex-1 grid-cols-1 px-4 md:px-8 lg:px-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
                        {/* ---------- The rolling list ---------- */}
                        <div className="relative h-full overflow-hidden min-h-[30vh] lg:min-h-0">
                            {/* The reading line the active row sits on. */}
                            <div
                                className="pointer-events-none absolute inset-x-0 top-1/2 z-0 flex -translate-y-1/2 items-center gap-4"
                                aria-hidden="true"
                            >
                                <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                                <span className="font-tommy-regular text-[9.5px] uppercase tracking-[2.5px] text-[#8A857C] dark:text-[#9A968E]">
                                    {String(Math.min(activeIdx + 1, rows.length)).padStart(2, '0')} / {rows.length}
                                </span>
                            </div>

                            {/* Names dissolve at the edges rather than being hard-clipped.
                                The far stop is the SAME hue at zero alpha, not
                                `to-transparent` — that resolves to rgba(0,0,0,0), so the
                                gradient interpolates toward transparent black and lays a
                                grey cast over the middle of the ramp. Shortened to 20% as
                                well, to keep the fade clear of the reading line. */}
                            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[20%] bg-gradient-to-b from-[#EEE8D9] to-[#EEE8D9]/0 dark:from-[#0A0A0A] dark:to-[#0A0A0A]/0" />
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[20%] bg-gradient-to-t from-[#EEE8D9] to-[#EEE8D9]/0 dark:from-[#0A0A0A] dark:to-[#0A0A0A]/0" />

                            {/* Offset by HALF A ROW, not half the track's own height —
                                `-translate-y-1/2` would put the middle row on the line at
                                y=0, but the index maths assumes row zero starts there.
                                These values are ROW_H / 2 for EACH breakpoint (16/20/25/30/42)
                                and must stay in step with both ROW_H and rowHeight(). */}
                            <div className="absolute inset-x-0 top-1/2 z-10 -translate-y-[16px] md:-translate-y-[20px] lg:-translate-y-[25px] xl:-translate-y-[30px] 3xl:-translate-y-[42px]">
                                <ul ref={listRef} className="will-change-transform">
                                    {rows.map((row, i) => {
                                        const on = i === activeIdx;

                                        if (row.kind === 'state') {
                                            const g = row.group;
                                            const many = g.markets.length > 1;
                                            const isLocked = !many && lockedId === g.markets[0].id;
                                            // The reading line is somewhere inside this
                                            // state — either on it, or on one of its cities
                                            // below it.
                                            const inGroup = activeState === g.state;
                                            return (
                                                <li key={row.key} className="flex h-[32px] items-center md:h-[40px] lg:h-[50px] xl:h-[60px] 3xl:h-[84px]">
                                                    <button
                                                        type="button"
                                                        onClick={() => onStateClick(g, i)}
                                                        className={`flex w-full items-baseline gap-4 text-left transition-colors duration-300 md:gap-6 ${toneFor(i)}`}
                                                    >
                                                        <span className="w-[2.5ch] shrink-0 font-tommy-regular text-[10px] tabular-nums opacity-60 md:text-[12px]">
                                                            {g.state}
                                                        </span>

                                                        <span className="truncate font-tommy-bold text-[26px] uppercase leading-[1] tracking-[-0.02em] md:text-[clamp(2.3rem,3.5vw,4.25rem)]">
                                                            {g.label}
                                                        </span>

                                                        {/* Stays lit for the whole group, not just
                                                            the state's own row, so the cities below
                                                            read as belonging to it. */}
                                                        <span
                                                            className={`hidden shrink-0 items-center gap-3 font-tommy-regular text-[11px] uppercase tracking-[2px] transition-opacity duration-300 md:flex ${on || inGroup ? 'opacity-100' : 'opacity-0'
                                                                }`}
                                                        >
                                                            {many ? `${g.markets.length} markets` : g.markets[0].name}
                                                            <span className="text-[#C8992B] dark:text-[#FCD119]">
                                                                {many ? '↓' : isLocked ? '● held' : '→'}
                                                            </span>
                                                        </span>
                                                    </button>
                                                </li>
                                            );
                                        }

                                        // City row. Same box height as a state row — see
                                        // invariant 1 at the top of the file — but set
                                        // smaller and indented so the hierarchy reads.
                                        const m = row.market;
                                        const isLocked = lockedId === m.id;
                                        const inGroup = activeState === m.state;
                                        return (
                                            <li key={row.key} className="flex h-[32px] items-center md:h-[40px] lg:h-[50px] xl:h-[60px] 3xl:h-[84px]">
                                                <button
                                                    type="button"
                                                    onClick={() => onMarketClick(m)}
                                                    aria-pressed={isLocked}
                                                    className={`flex w-full items-baseline gap-3 pl-[3.5ch] text-left transition-colors duration-300 md:gap-5 md:pl-[5ch] ${toneFor(i)}`}
                                                >
                                                    {/* Connector only carries the accent while its
                                                        own state owns the reading line. */}
                                                    <span
                                                        className={`shrink-0 transition-colors duration-300 ${inGroup ? 'text-[#C8992B] dark:text-[#FCD119]' : 'text-current'
                                                            }`}
                                                    >
                                                        ↳
                                                    </span>

                                                    <span className="truncate font-tommy-bold text-[17px] uppercase leading-[1] tracking-[-0.01em] md:text-[clamp(1.4rem,1.8vw,2.25rem)]">
                                                        {m.name}
                                                    </span>

                                                    <span
                                                        className={`hidden shrink-0 items-center gap-3 font-tommy-regular text-[11px] uppercase tracking-[2px] transition-opacity duration-300 md:flex ${on ? 'opacity-100' : 'opacity-0'
                                                            }`}
                                                    >
                                                        {compact(m.impressions)} / flight
                                                        <span className="text-[#C8992B] dark:text-[#FCD119]">
                                                            {isLocked ? '● held' : '→'}
                                                        </span>
                                                    </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>

                        {/* ---------- Panel ---------- */}
                        <div className="relative h-full items-center flex">
                            <div
                                className={`w-full rounded-[16px] lg:rounded-[24px] border p-3 md:p-4 lg:p-6 xl:p-8 transition-colors duration-300 ${lockedId
                                    ? 'border-[#C8992B]/45 bg-[#E7E0CE] dark:border-[#FCD119]/35 dark:bg-[#141414]'
                                    : 'border-black/10 bg-[#E7E0CE]/60 dark:border-white/10 dark:bg-[#141414]/70'
                                    }`}
                            >
                                {panel}
                            </div>
                        </div>
                    </div>

                    {/* Small screens have no room for a side column, so the panel
                        only appears once a market has actually been chosen. */}
                    {lockedMarket && (
                        <div className="absolute inset-x-4 bottom-4 z-40 lg:hidden">
                            <div className="max-h-[52vh] overflow-y-auto rounded-[20px] border border-[#C8992B]/45 bg-[#E7E0CE] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] dark:border-[#FCD119]/35 dark:bg-[#141414]">
                                <MarketDetail market={lockedMarket} locked onClear={() => setLockedId(null)} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
