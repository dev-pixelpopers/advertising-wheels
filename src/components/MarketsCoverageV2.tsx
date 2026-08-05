'use client';

/**
 * MarketsCoverage V2 — the roll call.
 *
 * No map, no trucks. The section pins and plays against one scrubbed timeline:
 *
 *   ACT 1  Intro — "Where We Roll", the national totals, the invitation to open
 *          the coverage list.
 *   ACT 2  Roll call — the covered STATES scroll vertically past a fixed
 *          reading line, set oversized in the wordmark weight.
 *   ACT 3  Detail — clicking a state that holds several markets opens its
 *          cities beneath it, accordion-style: one state open at a time, and
 *          a closed state contributes NO rows, so the list stays tight. A
 *          chevron marks the states that hold more. Clicking a city — or a
 *          single-market state, which has nothing to open — brings up the
 *          full-screen record.
 *
 * TWO INVARIANTS HOLD THIS TOGETHER — break either and the highlight drifts off
 * the reading line:
 *
 *   1. EVERY rendered row is the same height, city rows included. The active
 *      index is then just `-y / rowHeight` — O(1), no layout reads.
 *      Measuring 40-odd nodes per scroll tick would be the obvious approach
 *      and the wrong one.
 *   2. The list track is offset by HALF A ROW, not half its own height, so row
 *      zero starts on the line rather than the middle of the column.
 *
 * Expand/collapse DOES change the row count, and therefore the whole
 * scroll→y mapping. That is handled explicitly rather than avoided: the
 * click records which state to land on (`pendingSeatRef`), and the effect
 * watching `rows` re-seats the scroll onto it once the new rows exist. Skip
 * that re-seat and you get the classic desync — reading line on row 27, list
 * showing row 0.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Logo from '@/components/Logo';
import {
    MARKETS,
    REGIONS,
    STATE_GROUPS,
    STATE_NAMES,
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
 * Flattens the groups into the scrolling row set — ONLY the rows that are
 * actually on screen. A closed state contributes its own row and nothing
 * else, so the next state sits immediately beneath it with no reserved gap.
 *
 * This is what makes the row COUNT change on every expand/collapse, which
 * changes the scroll→y mapping. That mapping is re-seated explicitly
 * afterwards (see `pendingSeatRef` and the effect that consumes it) so the
 * state you clicked stays exactly where you clicked it — without that
 * re-seat you get the classic desync: reading line on row 27, list showing
 * row 0.
 *
 * Single-market states get NO child row — a state whose only market is the
 * state itself would just be the same name twice, so those rows resolve
 * straight to the market's popup.
 */
function buildRows(groups: StateGroup[], expanded: string | null): Row[] {
    const rows: Row[] = [];
    for (const g of groups) {
        rows.push({ kind: 'state', key: g.state, group: g });
        if (g.markets.length > 1 && expanded === g.state) {
            for (const m of g.markets) rows.push({ kind: 'market', key: m.id, market: m });
        }
    }
    return rows;
}

/* ------------------------------------------------------------------ */
/*  Panels                                                             */
/* ------------------------------------------------------------------ */

/** Renders a mid-count-up value the same way the static markup does. */
const countText = (v: number, kind?: string) =>
    kind === 'pct' ? `${Math.round(v)}%` : kind === 'dec1' ? `${v.toFixed(1)}%` : fmt(Math.round(v));

/**
 * The largest single-market share of national reach (New York, ~12%).
 *
 * The share bar is drawn against THIS, not against 100% — no market can
 * plausibly hold a majority of a 50-market footprint, so a true-scale track
 * would render every single record as a near-empty sliver. The number beside
 * it is always the real percentage.
 */
const MAX_SHARE_OF_REACH = (Math.max(...MARKETS.map((m) => m.adults)) / TOTALS.adults) * 100;

/**
 * The market record, as a full-screen moment.
 *
 * The section it opens over is one long scrubbed timeline, so a popup that
 * merely faded in read as a different (flatter) website. This one is built
 * as its own little sequence:
 *
 *   backdrop dims and blurs → the card unfolds from a horizontal slit
 *   (clip-path) → the photo settles out of an overscaled push-in while a
 *   light sweeps across it → the copy stacks up in a stagger → the figures
 *   count from zero and the coverage bar fills.
 *
 * It also leaves on its own terms: `close()` plays the exit and only then
 * tells the parent to unmount, so dismissing never snaps.
 */
function MarketPopup({
    market,
    onClose,
    onSelect,
}: {
    market: Market;
    onClose: () => void;
    onSelect: (id: string) => void;
}) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const sweepRef = useRef<HTMLSpanElement>(null);
    const barRef = useRef<HTMLSpanElement>(null);
    const rankBarRef = useRef<HTMLSpanElement>(null);
    /** The transition curtain and the mark that zooms inside it. */
    const curtainRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    /** Guards against a second close (backdrop + Escape) re-running the exit. */
    const closingRef = useRef(false);
    /** Lets the swap effect below skip its mount pass. */
    const mountedRef = useRef(false);

    /**
     * NOTE ON WHAT IS *NOT* SHOWN HERE.
     *
     * `adults` is defined as exactly 60% of `pop18` for all 50 markets (see
     * the header of data/markets.ts), so a "coverage rate" reads 60% on every
     * single record — it looks like a statistic and carries no information.
     * The figures below were picked for the opposite reason: they actually
     * separate one market from another.
     */
    /** Where this market sits in the 50 — 100% for #1, ~2% for #50. */
    const rankPct = ((TOTALS.count - market.rank + 1) / TOTALS.count) * 100;
    /** This market's share of the national 18+ reach: ~12% (NYC) → ~0.5%. */
    const shareOfReach = (market.adults / TOTALS.adults) * 100;
    /** The same share as a bar width — see MAX_SHARE_OF_REACH. */
    const sharePct = (shareOfReach / MAX_SHARE_OF_REACH) * 100;
    /** Delivery against audience size — a ~4x spread across the footprint. */
    const impsPer1k = Math.round((market.impressions / market.adults) * 1000);

    /**
     * Where to go next. Other markets in the same state if there are any;
     * otherwise the closest-ranked markets in the same region, so a
     * single-market state is still a door rather than a dead end.
     */
    const siblings = MARKETS.filter((m) => m.state === market.state && m.id !== market.id);
    const related = siblings.length
        ? siblings
        : MARKETS.filter((m) => m.region === market.region && m.id !== market.id)
            .sort((a, b) => Math.abs(a.rank - market.rank) - Math.abs(b.rank - market.rank))
            .slice(0, 4);
    const relatedLabel = siblings.length
        ? `More in ${STATE_NAMES[market.state] ?? market.state}`
        : `Nearby in the ${REGION_LABEL[market.region]}`;

    const close = useCallback(() => {
        if (closingRef.current) return;
        closingRef.current = true;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            onClose();
            return;
        }

        gsap.timeline({ onComplete: onClose })
            .to(cardRef.current, {
                y: 18,
                scale: 0.965,
                autoAlpha: 0,
                duration: 0.28,
                ease: 'power2.in',
            })
            .to(backdropRef.current, { autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, '<0.04');
    }, [onClose]);

    // Escape lives here rather than in the section, so it goes through the
    // same animated exit as every other dismissal.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [close]);

    useGSAP(
        () => {
            const card = cardRef.current;
            const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            /* Figures are authored at their FINAL value in the markup (so the
               record is correct without JS) and zeroed here, before paint,
               for the count-up to run from.
               Queried off the ref, NOT via a bare selector — useGSAP scopes
               selector strings passed to tweens, but `gsap.utils.toArray`
               would search the whole document. */
            const counters = Array.from(
                overlayRef.current?.querySelectorAll<HTMLElement>('[data-count]') ?? []
            );

            if (reduced) {
                gsap.set([backdropRef.current, card], { autoAlpha: 1 });
                gsap.set(curtainRef.current, { autoAlpha: 0 });
                gsap.set(barRef.current, { width: `${sharePct}%` });
                gsap.set(rankBarRef.current, { width: `${rankPct}%` });
                return;
            }

            counters.forEach((el) => {
                el.textContent = countText(0, el.dataset.countFormat);
            });

            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            tl.fromTo(backdropRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 }, 0)
                /* ACT 1 — the mark.
                   A disc blooms out of the middle of the screen and the
                   wordmark punches up inside it, so opening a market is a
                   branded beat rather than a card that faded in. The card is
                   assembled behind this the whole time. */
                .fromTo(
                    curtainRef.current,
                    { clipPath: 'circle(0% at 50% 50%)' },
                    { clipPath: 'circle(78% at 50% 50%)', duration: 0.4, ease: 'power3.inOut' },
                    0
                )
                .fromTo(
                    logoRef.current,
                    { scale: 0.4, autoAlpha: 0 },
                    { scale: 1, autoAlpha: 1, duration: 0.35, ease: 'back.out(1.7)' },
                    0.1
                )
                // The mark keeps zooming as it dissolves — the card is
                // revealed THROUGH it, rather than after it.
                .to(logoRef.current, { scale: 2.4, autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, 0.42)

                /* ACT 2 — the record.
                   The card unfolds from a slit rather than scaling up: the
                   list behind it is all horizontal rules, so opening ALONG
                   one reads as the section's own vocabulary. */
                .fromTo(
                    card,
                    { clipPath: 'inset(46% 0% 46% 0%)', autoAlpha: 0, y: 24 },
                    { clipPath: 'inset(0% 0% 0% 0%)', autoAlpha: 1, y: 0, duration: 0.55, ease: 'power4.out' },
                    0.5
                )
                .to(curtainRef.current, { autoAlpha: 0, duration: 0.3, ease: 'power2.out' }, 0.5)
                /* Photo settles out of a push-in, so the banner has depth
                   instead of being a flat plate that appeared. It rests at
                   1.06, NOT 1 — that overscan is the headroom the pointer
                   parallax below drifts within, and landing on 1 would let
                   the drift pull the photo's edges into frame. Matches the
                   `scale-[1.06]` class, which is the no-JS resting state. */
                .fromTo(imgRef.current, { scale: 1.32 }, { scale: 1.06, duration: 0.9, ease: 'power3.out' }, 0.54)
                // A single specular sweep across the photo as it lands.
                .fromTo(
                    sweepRef.current,
                    { xPercent: -130, autoAlpha: 0.9 },
                    { xPercent: 240, autoAlpha: 0, duration: 0.75, ease: 'power2.inOut' },
                    0.62
                )
                .fromTo(
                    '[data-pop-item]',
                    { y: 26, autoAlpha: 0 },
                    { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.06 },
                    0.68
                )
                .fromTo(barRef.current, { width: '0%' }, { width: `${sharePct}%`, duration: 0.8, ease: 'power2.out' }, 0.8)
                .fromTo(rankBarRef.current, { width: '0%' }, { width: `${rankPct}%`, duration: 0.9, ease: 'power2.out' }, 0.84);

            counters.forEach((el) => {
                const end = Number(el.dataset.count);
                const kind = el.dataset.countFormat;
                const proxy = { v: 0 };
                tl.to(
                    proxy,
                    {
                        v: end,
                        duration: 1,
                        ease: 'power2.out',
                        onUpdate: () => {
                            el.textContent = countText(proxy.v, kind);
                        },
                    },
                    0.75
                );
            });

            /* Pointer parallax — the photo drifts against the card, so the
               popup keeps responding after it has finished arriving. */
            if (!card || window.matchMedia('(hover: none)').matches) return;
            const px = gsap.quickTo(imgRef.current, 'xPercent', { duration: 0.7, ease: 'power3' });
            const py = gsap.quickTo(imgRef.current, 'yPercent', { duration: 0.7, ease: 'power3' });
            const onMove = (e: PointerEvent) => {
                const r = card.getBoundingClientRect();
                px(((e.clientX - r.left) / r.width - 0.5) * -4);
                py(((e.clientY - r.top) / r.height - 0.5) * -4);
            };
            const onLeave = () => {
                px(0);
                py(0);
            };
            card.addEventListener('pointermove', onMove);
            card.addEventListener('pointerleave', onLeave);
            return () => {
                card.removeEventListener('pointermove', onMove);
                card.removeEventListener('pointerleave', onLeave);
            };
        },
        { scope: overlayRef }
    );

    /**
     * Switching to a related market re-plays the RECORD, not the whole
     * opening — no curtain, no logo, the card never leaves. Mount is skipped
     * (the intro above already covers it) and `revertOnUpdate` stays off so
     * this never claws back the intro's end state.
     *
     * React has already swapped the text by the time this runs, so there is
     * deliberately no "out" phase: animating the new copy out and back in
     * would just be a flinch.
     */
    useGSAP(
        () => {
            if (!mountedRef.current) {
                mountedRef.current = true;
                return;
            }
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

            const counters = Array.from(
                overlayRef.current?.querySelectorAll<HTMLElement>('[data-count]') ?? []
            );
            counters.forEach((el) => {
                el.textContent = countText(0, el.dataset.countFormat);
            });

            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            tl.fromTo(imgRef.current, { scale: 1.18 }, { scale: 1.06, duration: 0.8 }, 0)
                .fromTo(
                    sweepRef.current,
                    { xPercent: -130, autoAlpha: 0.9 },
                    { xPercent: 240, autoAlpha: 0, duration: 0.7, ease: 'power2.inOut' },
                    0
                )
                .fromTo('[data-pop-item]', { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.05 }, 0.06)
                .fromTo(barRef.current, { width: '0%' }, { width: `${sharePct}%`, duration: 0.7, ease: 'power2.out' }, 0.15)
                .fromTo(rankBarRef.current, { width: '0%' }, { width: `${rankPct}%`, duration: 0.8, ease: 'power2.out' }, 0.18);

            counters.forEach((el) => {
                const end = Number(el.dataset.count);
                const kind = el.dataset.countFormat;
                const proxy = { v: 0 };
                tl.to(
                    proxy,
                    {
                        v: end,
                        duration: 0.9,
                        ease: 'power2.out',
                        onUpdate: () => {
                            el.textContent = countText(proxy.v, kind);
                        },
                    },
                    0.12
                );
            });
        },
        { dependencies: [market.id], scope: overlayRef, revertOnUpdate: false }
    );

    return (
        <div ref={overlayRef} className="absolute inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
            <div
                ref={backdropRef}
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
                onClick={close}
                aria-hidden="true"
            />

            {/* Transition curtain — blooms over everything, carries the mark,
                then dissolves to hand off to the card. Above the card (z-20)
                so the card can assemble behind it. */}
            <div
                ref={curtainRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[#1A1917]"
            >
                <div ref={logoRef}>
                    <Logo width={168} height={70} tone="light" />
                </div>
            </div>

            <div
                ref={cardRef}
                role="dialog"
                aria-modal="true"
                aria-label={market.name}
                className="relative z-10 w-full max-w-[1080px] overflow-hidden rounded-[16px] md:rounded-[20px] lg:rounded-[28px] bg-[#E7E0CE] shadow-[0_45px_130px_rgba(0,0,0,0.5)] dark:bg-[#141414]"
            >
                {/* Close sits on the CARD, not the photo — on desktop the photo
                    is only the left half, so anchoring it to the card keeps it
                    in the corner at every breakpoint. Solid dark disc so it
                    reads over both the photo and the light content panel. */}
                <button
                    type="button"
                    onClick={close}
                    aria-label="Close"
                    className="absolute right-2 md:right-3 lg:right-4 top-2 md:top-3 lg:top-4 z-30 flex h-6 md:h-8 lg:h-10 w-6 md:w-8 lg:w-10 items-center justify-center rounded-full border border-white/20 bg-[#1A1917]/85 text-white backdrop-blur-md transition-all duration-300 hover:rotate-90 hover:border-[#FCD119] hover:bg-[#FCD119] hover:text-black"
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className='w-[8px] md:w-[10px] lg:w-[12px] h-[8px] md:h-[10px] lg:h-[12px]'>
                        <path d="M1 1 L11 11 M11 1 L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                </button>

                {/* Photo left, record right. The photo column has no height of
                    its own past mobile — it stretches to whatever the content
                    column settles at, and THAT is what's capped and scrolled.
                    Sizing it directly instead would either overflow short
                    viewports or leave the columns mismatched. */}
                <div className="grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <div className="relative h-[210px] overflow-hidden md:h-auto">
                        <img
                            ref={imgRef}
                            src="/assets/images/dollar-hero.webp"
                            alt=""
                            className="absolute inset-0 h-full w-full scale-[1.06] object-cover will-change-transform"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/30" />

                        {/* Specular sweep — see the timeline above. */}
                        <span
                            ref={sweepRef}
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-gradient-to-r from-white/0 via-white/35 to-white/0"
                        />

                        <span
                            data-pop-item
                            className="absolute left-2 md:left-5 top-2 md:top-5 rounded-full border border-white/25 bg-black/40 px-3 py-1.5 font-tommy-regular text-[10px] uppercase tracking-[2px] text-white backdrop-blur-md lg:left-7 lg:top-7"
                        >
                            Market #{market.rank}
                        </span>

                        {/* Title sits ON the photo — the record then opens on the
                            name rather than repeating a header beside it. */}
                        <div data-pop-item className="absolute inset-x-3 md:inset-x-5 bottom-3 md:bottom-5 lg:inset-x-7 lg:bottom-7">
                            <span className="font-tommy-regular text-[10px] uppercase tracking-[3px] text-[#FCD119]">
                                {market.state} · {REGION_LABEL[market.region]}
                            </span>
                            <h3 className="lg:mt-2 font-tommy-bold text-[24px] md:text-[clamp(28px,3.6vw,46px)] leading-[1] tracking-[-0.02em] text-white">
                                {market.name}
                            </h3>
                        </div>
                    </div>

                    {/* The floor stops a market with no audience note from
                        collapsing the card into a letterbox — it drives the
                        row height, and the photo column stretches to match.
                        min() so it can never fight the 86vh cap on a short
                        viewport (min-height would win and overflow). */}
                    <div className="relative lg:max-h-[86vh] min-h-0 overflow-y-auto p-3 md:p-6 md:min-h-[min(430px,74vh)] lg:p-9">
                        {/* The rank, set as a watermark — gives the data column
                            its own piece of typography instead of leaving it a
                            plain stack of boxes. */}
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute -top-6 right-2 select-none font-tommy-bold text-[170px] leading-none tracking-[-0.04em] text-black/[0.04] dark:text-white/[0.05]"
                        >
                            {market.rank}
                        </span>

                        <div className="relative">
                            <div data-pop-item>
                                <p
                                    data-count={market.impressions}
                                    className="font-tommy-bold text-[26px] md:text-[clamp(38px,4.6vw,60px)] leading-none tabular-nums tracking-[-0.03em] text-[#1A1917] dark:text-[#FCD119]"
                                >
                                    {fmt(market.impressions)}
                                </p>
                                <p className="mt-2.5 font-tommy-regular text-[10px] uppercase tracking-[2.5px] text-[#6F6A60] dark:text-[#9A968E]">
                                    Impressions / truck · 4-week flight
                                </p>
                            </div>

                            <div className="mt-3 md:mt-5 lg:mt-7 grid grid-cols-3 gap-1.5 md:gap-2.5 lg:gap-3">
                                {(
                                    [
                                        [market.adults, 'num', 'Adults 18+ reached'],
                                        [market.pop18, 'num', 'Metro 18+ pop.'],
                                        [impsPer1k, 'num', 'Imps / 1K adults'],
                                    ] as const
                                ).map(([value, format, label]) => (
                                    <div
                                        key={label}
                                        data-pop-item
                                        className="rounded-2xl border border-black/10 bg-black/[0.03] px-2.5 py-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#C8992B]/45 hover:bg-black/[0.05] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-[#FCD119]/40 dark:hover:bg-white/[0.07]"
                                    >
                                        <p
                                            data-count={value}
                                            data-count-format={format}
                                            className="font-tommy-bold text-[13px] md:text-[17px] leading-none tabular-nums text-[#1A1917] lg:text-[22px] dark:text-white"
                                        >
                                            {fmt(value)}
                                        </p>
                                        <p className="mt-1 md:mt-2 font-tommy-regular text-[8.5px] uppercase leading-tight tracking-[1px] text-[#8A857C] md:text-[9.5px] dark:text-[#9A968E]">
                                            {label}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Two measures that actually move market to market —
                                see the note on the derived values above. */}
                            <div data-pop-item className="mt-3 md:mt-5 lg:mt-7 flex flex-col gap-y-2 md:gap-y-3 lg:gap-y-4">
                                <div>
                                    <div className="flex items-baseline justify-between">
                                        <span className="font-tommy-regular text-[9.5px] uppercase tracking-[2px] text-[#8A857C] dark:text-[#9A968E]">
                                            National rank
                                        </span>
                                        <span className="font-tommy-medium text-[11px] tabular-nums text-[#C8992B] dark:text-[#FCD119]">
                                            #{market.rank} of {TOTALS.count}
                                        </span>
                                    </div>
                                    <div className="mt-2.5 h-[5px] w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                                        <span
                                            ref={rankBarRef}
                                            className="block h-full rounded-full bg-gradient-to-r from-[#C8992B] to-[#FCD119]"
                                            style={{ width: `${rankPct}%` }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-baseline justify-between">
                                        <span className="font-tommy-regular text-[9.5px] uppercase tracking-[2px] text-[#8A857C] dark:text-[#9A968E]">
                                            Share of national reach
                                        </span>
                                        <span
                                            data-count={shareOfReach}
                                            data-count-format="dec1"
                                            className="font-tommy-medium text-[11px] tabular-nums text-[#C8992B] dark:text-[#FCD119]"
                                        >
                                            {shareOfReach.toFixed(1)}%
                                        </span>
                                    </div>
                                    {/* Shares top out around 12%, so the track is
                                        scaled to that rather than to 100% — at true
                                        scale every market would read as an empty bar. */}
                                    <div className="mt-2.5 h-[5px] w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                                        <span
                                            ref={barRef}
                                            className="block h-full rounded-full bg-gradient-to-r from-[#C8992B] to-[#FCD119]"
                                            style={{ width: `${sharePct}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {market.audience && (
                                <p
                                    data-pop-item
                                    className="mt-6 border-l-2 border-[#C8992B]/40 pl-4 font-tommy-regular text-[13px] leading-[1.65] text-[#5A554C] dark:border-[#FCD119]/35 dark:text-[#A8A399]"
                                >
                                    {market.audience}
                                </p>
                            )}

                            {/* Somewhere to go next — see `related` above. Set as
                                its own accented panel rather than a footnote:
                                it is the only interactive thing in the column,
                                so it has to look like the invitation it is. */}
                            {related.length > 0 && (
                                <div
                                    data-pop-item
                                    className="mt-3 md:mt-5 lg:mt-7 rounded-2xl border border-[#C8992B]/30 bg-[#C8992B]/[0.07] p-2 md:p-3 lg:p-5 text-center dark:border-[#FCD119]/25 dark:bg-[#FCD119]/[0.06]"
                                >
                                    <p className="font-tommy-medium text-[11px] uppercase tracking-[3px] text-[#8A6E1F] dark:text-[#FCD119]">
                                        {relatedLabel}
                                    </p>
                                    <div className="mt-2 md:mt-3 lg:mt-4 flex flex-wrap justify-center gap-2.5">
                                        {related.map((r) => (
                                            <button
                                                key={r.id}
                                                type="button"
                                                onClick={() => onSelect(r.id)}
                                                className="group flex items-center gap-1.5 md:gap-2 lg:gap-2.5 rounded-full border border-black/10 bg-[#EEE8D9] px-2 md:px-3 lg:px-4 py-1.5 md:py-2 lg:py-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C8992B] hover:bg-white dark:border-white/12 dark:bg-white/[0.07] dark:hover:border-[#FCD119] dark:hover:bg-white/[0.12]"
                                            >
                                                <span className="font-tommy-medium text-[10px] md:text-[13.5px] text-[#1A1917] dark:text-white">
                                                    {r.name}
                                                </span>
                                                <span className="font-tommy-regular text-[9px] md:text-[11px] tabular-nums text-[#8A857C] dark:text-[#9A968E]">
                                                    {compact(r.impressions)}
                                                </span>
                                                <span className="text-[10px] md:text-[13px] lg:text-[15px] text-[#C8992B] transition-transform duration-300 group-hover:translate-x-1 dark:text-[#FCD119]">
                                                    →
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
    /** The hover zone the custom cursor lives in, and the cursor itself. */
    const listZoneRef = useRef<HTMLDivElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);
    /**
     * Lets the click handlers dismiss the custom cursor.
     *
     * The cursor hides the NATIVE one while it is up. Opening the popup drops
     * an overlay over the list, and the pointer may never fire `pointerout`
     * on the row it was over — so without this the disc would sit behind the
     * popup with the real cursor still suppressed underneath it.
     */
    const hideCursorRef = useRef<(() => void) | null>(null);

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
    /**
     * Where the clicked state was sitting when it was clicked.
     *
     * Expanding/collapsing changes the row count, and therefore the whole
     * scroll→y mapping. Set this on the click, consume it in the effect that
     * watches `rows`, which restores the SAME on-screen position afterwards.
     *
     * Position, not index — that distinction is the whole point. Seating the
     * clicked state on the reading line (screen centre) instead meant row 0,
     * which is always at or above that line, dragged the list downwards on
     * every open. An accordion must not move the header you just clicked.
     *
     * `y` is the list's target offset, `index` the row's position in the
     * OLD row set — the two together survive the rows shifting underneath.
     * Null means "no target": a region change, which resets to the top on
     * purpose.
     */
    const pendingSeatRef = useRef<{ key: string; index: number; y: number } | null>(null);

    const [activeIdx, setActiveIdx] = useState(0);
    /** Which market's full-screen popup is open, if any. */
    const [popupMarketId, setPopupMarketId] = useState<string | null>(null);
    /**
     * The ONE state whose city dropdown is open, if any — accordion, not a
     * set: opening a state closes whichever was open before it. Closed by
     * default, so the list opens as a clean roll call of state names.
     */
    const [expandedState, setExpandedState] = useState<string | null>(null);
    const [regionFilter, setRegionFilter] = useState<Region | 'ALL'>('ALL');

    const groups = useMemo(
        () => (regionFilter === 'ALL' ? STATE_GROUPS : STATE_GROUPS.filter((g) => g.region === regionFilter)),
        [regionFilter]
    );
    // Changes on region filter AND on expand/collapse — the effect below
    // re-seats the scroll so neither one throws the reading line off.
    const rows = useMemo(() => buildRows(groups, expandedState), [groups, expandedState]);

    // Written during render so the scroll callbacks always see the current count.
    rowCountRef.current = rows.length;

    const activeRow = rows[Math.min(activeIdx, rows.length - 1)] ?? rows[0];
    const popupMarket = popupMarketId ? MARKETS.find((m) => m.id === popupMarketId) : undefined;

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
     * The list offset the CURRENT scroll position maps to.
     *
     * Derived from `st.progress` rather than read off the element, because
     * `scrub` means the rendered transform lags the scroll by up to 0.6s.
     * Reading the live transform mid-scroll would capture a value the list is
     * still travelling away from, and freeze it there on the next seat.
     */
    const targetY = useCallback(() => {
        const st = stRef.current;
        const count = rowCountRef.current;
        if (!st || count < 2) return 0;
        const t = gsap.utils.clamp(0, 1, (st.progress - INTRO_END) / (1 - INTRO_END));
        return -(count - 1) * rowHeight() * t;
    }, []);

    /**
     * Inverse of `targetY` — scrolls to whatever position puts the list at
     * offset `y`. Used to hold a row still across a row-count change, where
     * the same y corresponds to a different scroll position before and after.
     */
    const seatY = useCallback((y: number) => {
        const st = stRef.current;
        const count = rowCountRef.current;
        if (!st || count < 2) return;
        const t = gsap.utils.clamp(0, 1, -y / ((count - 1) * rowHeight()));
        const p = INTRO_END + (1 - INTRO_END) * t;
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
     * The row count changed — from an expand/collapse, or a region filter.
     * Either way the scroll→y mapping is now stale, so re-evaluate it and
     * put the scroll back where it belongs.
     *
     * Expand/collapse seats on the state that was clicked (`pendingSeatRef`),
     * so it stays put under the reading line. A region change has no such
     * target and resets to the top of the new list.
     *
     * The mount pass is skipped (-1 sentinel): refreshing this trigger before
     * the sections above it have settled makes it measure the wrong start.
     */
    useEffect(() => {
        const st = stRef.current;
        if (!st) return;

        const first = lastCountRef.current === -1;
        lastCountRef.current = rows.length;
        if (first) {
            pendingSeatRef.current = null;
            return;
        }

        // Scroll depth is fixed, so the document height hasn't moved and no
        // other trigger needs refreshing.
        tlRef.current?.invalidate();
        st.refresh();

        const seat = pendingSeatRef.current;
        pendingSeatRef.current = null;

        // No target — a region change. That one DOES reset to the top, since
        // the list it was reading has been replaced wholesale.
        const idxAfter = seat
            ? rows.findIndex((r) => r.kind === 'state' && r.key === seat.key)
            : -1;

        if (!seat || idxAfter < 0) {
            setActiveIdx(0);
            seatIndex(0);
            return;
        }

        /* Hold the clicked state exactly where it was.

           Its index can still shift even though it was not itself removed:
           collapsing a state that sat ABOVE it takes that state's cities out
           of the list and pulls everything below up. Correcting y by the index
           delta cancels that out, so the row stays on the same pixel row of
           the screen whichever direction the set changed. */
        const y = seat.y + (seat.index - idxAfter) * rowHeight();

        setActiveIdx(gsap.utils.clamp(0, rows.length - 1, Math.round(-y / rowHeight())));
        seatY(y);
    }, [rows, seatIndex, seatY]);

    /* -------------------------------------------------------------- */
    /*  Interaction                                                    */
    /* -------------------------------------------------------------- */

    /**
     * Opens a multi-market state's city dropdown, closing whichever was open.
     *
     * This DOES change the row set, so it flags the state as the seat target
     * first — the effect above then re-anchors the scroll to it once the new
     * rows have rendered.
     */
    const toggleExpand = useCallback(
        (state: string, index: number) => {
            // Captured BEFORE the state update, so it records the list as the
            // user actually saw it at the moment of the click.
            pendingSeatRef.current = { key: state, index, y: targetY() };
            setExpandedState((prev) => (prev === state ? null : state));
        },
        [targetY]
    );

    /**
     * A state click either opens its dropdown (multi-market) or its popup
     * directly (single-market — there are no cities beneath it to reveal).
     *
     * Neither path scrolls the list. Clicking a row used to drag it to the
     * reading line first, which meant the thing you clicked jumped out from
     * under the pointer — worst for the top rows, which could only ever be
     * dragged downwards.
     */
    const onStateClick = useCallback(
        (g: StateGroup, index: number) => {
            if (g.markets.length === 1) {
                hideCursorRef.current?.();
                setPopupMarketId(g.markets[0].id);
            } else {
                // The row set is about to change, so the effect watching `rows`
                // restores the position instead. Seating on the OLD index here
                // would scroll to a row that is about to stop existing.
                toggleExpand(g.state, index);
            }
        },
        [toggleExpand]
    );

    const onMarketClick = useCallback((m: Market) => {
        hideCursorRef.current?.();
        setPopupMarketId(m.id);
    }, []);

    /**
     * The custom cursor: a disc that trails the pointer across the list and
     * names what the row beneath it does — Open / Close / View.
     *
     * Built once and driven imperatively (quickTo + attribute reads) rather
     * than through React state, so pointer movement never triggers a render
     * on a section that is already re-rendering on every scroll tick.
     */
    useGSAP(
        () => {
            const zone = listZoneRef.current;
            const disc = cursorRef.current;
            if (!zone || !disc) return;
            // Coarse pointers have no hover to follow — leave them the native cursor.
            if (window.matchMedia('(hover: none)').matches) return;

            const text = disc.querySelector<HTMLElement>('[data-cursor-text]');
            gsap.set(disc, { xPercent: -50, yPercent: -50, scale: 0.3, autoAlpha: 0 });

            const qx = gsap.quickTo(disc, 'x', { duration: 0.4, ease: 'power3' });
            const qy = gsap.quickTo(disc, 'y', { duration: 0.4, ease: 'power3' });

            const rowUnder = (t: EventTarget | null) =>
                t instanceof Element ? t.closest<HTMLElement>('[data-cursor-label]') : null;

            let hovered: HTMLElement | null = null;

            const show = (el: HTMLElement) => {
                hovered = el;
                zone.style.cursor = 'none';
                gsap.to(disc, { scale: 1, autoAlpha: 1, duration: 0.4, ease: 'power3.out' });
            };
            const hide = () => {
                hovered = null;
                zone.style.cursor = '';
                gsap.to(disc, { scale: 0.3, autoAlpha: 0, duration: 0.25, ease: 'power2.in' });
            };
            hideCursorRef.current = hide;

            const onMove = (e: PointerEvent) => {
                const r = zone.getBoundingClientRect();
                qx(e.clientX - r.left);
                qy(e.clientY - r.top);
                // Re-read every move so the label follows Open→Close the
                // instant a row is toggled, without another listener.
                if (hovered && text) {
                    const label = hovered.getAttribute('data-cursor-label') ?? '';
                    if (text.textContent !== label) text.textContent = label;
                }
            };
            const onOver = (e: PointerEvent) => {
                const el = rowUnder(e.target);
                if (!el) return;
                if (text) text.textContent = el.getAttribute('data-cursor-label') ?? '';
                show(el);
            };
            const onOut = (e: PointerEvent) => {
                if (rowUnder(e.target) && !rowUnder(e.relatedTarget)) hide();
            };

            zone.addEventListener('pointermove', onMove);
            zone.addEventListener('pointerover', onOver);
            zone.addEventListener('pointerout', onOut);
            return () => {
                hideCursorRef.current = null;
                zone.style.cursor = '';
                zone.removeEventListener('pointermove', onMove);
                zone.removeEventListener('pointerover', onOver);
                zone.removeEventListener('pointerout', onOut);
            };
        },
        { scope: rootRef }
    );

    // Escape is handled inside MarketPopup, so it runs the exit animation
    // rather than yanking the card out of the tree.

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
        setPopupMarketId(null);
        setExpandedState(null);
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
                                <p className="mt-1 font-tommy-regular text-[9px] uppercase tracking-[2px] text-[#8A857C] md:text-[10px] dark:text-[#9A968E]">
                                    Click any state or city to explore its record
                                </p>
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
                        flex parent and its own `overflow-hidden` takes effect.
                        No side panel anymore — a market's record opens in the
                        full-screen popup instead, so the list gets the whole width. */}
                    <div className="mx-auto grid min-h-0 w-full max-w-[1440px] flex-1 grid-cols-1 px-4 md:px-8 lg:px-12">
                        {/* ---------- The rolling list ---------- */}
                        <div ref={listZoneRef} className="relative h-full overflow-hidden min-h-[30vh] lg:min-h-0">
                            {/* Custom cursor — a disc that trails the pointer and names
                                what the row under it will do. The native cursor is
                                hidden (in JS, so it only ever goes away once this is
                                actually running) while the pointer is over a row. */}
                            <div
                                ref={cursorRef}
                                aria-hidden="true"
                                className="pointer-events-none absolute left-0 top-0 z-30 flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#1A1917] opacity-0 dark:bg-[#FCD119]"
                            >
                                <span
                                    data-cursor-text
                                    className="font-tommy-medium text-[10px] uppercase tracking-[2px] text-[#FCD119] dark:text-[#1A1917]"
                                />
                            </div>

                            {/* The reading line the active row sits on. */}
                            <div
                                className="pointer-events-none absolute inset-x-0 top-1/2 z-0 h-px -translate-y-1/2 bg-black/10 dark:bg-white/10"
                                aria-hidden="true"
                            />

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
                                            const isExpanded = many && expandedState === g.state;
                                            const isPopupOpen = !many && popupMarketId === g.markets[0].id;
                                            // The reading line is somewhere inside this
                                            // state — either on it, or on one of its cities
                                            // below it.
                                            const inGroup = activeState === g.state;
                                            return (
                                                <li key={row.key} className="flex h-[32px] items-center md:h-[40px] lg:h-[50px] xl:h-[60px] 3xl:h-[84px]">
                                                    <button
                                                        type="button"
                                                        onClick={() => onStateClick(g, i)}
                                                        aria-expanded={many ? isExpanded : undefined}
                                                        data-cursor-label={many ? (isExpanded ? 'Close' : 'Open') : 'View'}
                                                        className={`group flex w-full cursor-pointer items-baseline gap-4 rounded-lg -mx-2 px-2 text-left transition-colors duration-300 hover:bg-black/[0.04] md:gap-6 dark:hover:bg-white/[0.06] ${toneFor(i)}`}
                                                    >
                                                        <span className="w-[2.5ch] shrink-0 font-tommy-regular text-[10px] tabular-nums opacity-60 md:text-[12px]">
                                                            {g.state}
                                                        </span>

                                                        <span className="truncate font-tommy-bold text-[26px] uppercase leading-[1] tracking-[-0.02em] transition-colors duration-300 group-hover:text-[#C8992B] dark:group-hover:text-[#FCD119] md:text-[clamp(2.3rem,3.5vw,4.25rem)]">
                                                            {g.label}
                                                        </span>

                                                        {/* Multi-market states always carry this chevron —
                                                            it's the "there's more inside, click to open"
                                                            cue for the (closed-by-default) city dropdown
                                                            below. It rotates rather than swapping glyphs,
                                                            so the affordance reads as one thing opening. */}
                                                        {many && (
                                                            <span
                                                                aria-hidden="true"
                                                                className={`shrink-0 text-[14px] text-[#C8992B] transition-transform duration-300 dark:text-[#FCD119] md:text-[18px] ${isExpanded ? 'rotate-180' : ''
                                                                    }`}
                                                            >
                                                                ↓
                                                            </span>
                                                        )}

                                                        {/* Single-market states have no dropdown — this is
                                                            the hint that the row opens the popup directly.
                                                            Shown on hover for EVERY row, not just the active
                                                            one, so clickability doesn't depend on scroll
                                                            position to be discoverable. */}
                                                        {!many && (
                                                            <span
                                                                className={`hidden shrink-0 items-center gap-3 font-tommy-regular text-[11px] uppercase tracking-[2px] transition-opacity duration-300 group-hover:opacity-100 md:flex ${on || inGroup ? 'opacity-100' : 'opacity-0'
                                                                    }`}
                                                            >
                                                                {g.markets[0].name}
                                                                <span className="text-[#C8992B] dark:text-[#FCD119]">
                                                                    {isPopupOpen ? '● open' : 'Explore →'}
                                                                </span>
                                                            </span>
                                                        )}
                                                        {many && (
                                                            <span
                                                                className={`hidden shrink-0 font-tommy-regular text-[11px] uppercase tracking-[2px] transition-opacity duration-300 group-hover:opacity-100 md:inline ${on || inGroup ? 'opacity-100' : 'opacity-0'
                                                                    }`}
                                                            >
                                                                {g.markets.length} markets · {isExpanded ? 'close' : 'open'}
                                                            </span>
                                                        )}
                                                    </button>
                                                </li>
                                            );
                                        }

                                        // City row — only ever rendered while its state is
                                        // open (see `buildRows`), so there is no collapsed
                                        // variant to style. Same box height as a state row
                                        // so the index maths stays a single division.
                                        const m = row.market;
                                        const isPopupOpen = popupMarketId === m.id;
                                        const inGroup = activeState === m.state;
                                        return (
                                            <li key={row.key} className="flex h-[32px] items-center md:h-[40px] lg:h-[50px] xl:h-[60px] 3xl:h-[84px]">
                                                <button
                                                    type="button"
                                                    onClick={() => onMarketClick(m)}
                                                    aria-pressed={isPopupOpen}
                                                    data-cursor-label="View"
                                                    className={`group flex w-full items-baseline gap-3 rounded-lg -mx-2 pl-[3.5ch] pr-2 text-left transition-colors duration-300 hover:bg-black/[0.04] md:gap-5 md:pl-[5ch] dark:hover:bg-white/[0.06] ${toneFor(i)}`}
                                                >
                                                    {/* Connector only carries the accent while its
                                                        own state owns the reading line. */}
                                                    <span
                                                        className={`shrink-0 transition-colors duration-300 ${inGroup ? 'text-[#C8992B] dark:text-[#FCD119]' : 'text-current'
                                                            }`}
                                                    >
                                                        ↳
                                                    </span>

                                                    <span className="truncate font-tommy-bold text-[17px] uppercase leading-[1] tracking-[-0.01em] transition-colors duration-300 group-hover:text-[#C8992B] md:text-[clamp(1.4rem,1.8vw,2.25rem)] dark:group-hover:text-[#FCD119]">
                                                        {m.name}
                                                    </span>

                                                    <span
                                                        className={`hidden shrink-0 items-center gap-3 font-tommy-regular text-[11px] uppercase tracking-[2px] transition-opacity duration-300 group-hover:opacity-100 md:flex ${on ? 'opacity-100' : 'opacity-0'
                                                            }`}
                                                    >
                                                        {compact(m.impressions)} / flight
                                                        <span className="text-[#C8992B] dark:text-[#FCD119]">
                                                            {isPopupOpen ? '● open' : 'Explore →'}
                                                        </span>
                                                    </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>

                    </div>

                    {/* Full-screen popup — replaces the old side panel entirely.
                        Same component at every breakpoint, since it already covers
                        the whole pinned area. */}
                    {popupMarket && (
                        <MarketPopup
                            market={popupMarket}
                            onClose={() => setPopupMarketId(null)}
                            onSelect={setPopupMarketId}
                        />
                    )}
                </div>
            </div>
        </section>
    );
}
