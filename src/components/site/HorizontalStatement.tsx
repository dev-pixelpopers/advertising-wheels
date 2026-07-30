'use client';

/**
 * HorizontalStatement — a pinned "ticker-tape" line for the Services page.
 *
 * The whole thing is ONE flex row (a single very long sentence) that scrolls
 * sideways as you scroll down: pin the section, scrub the track's x with
 * ease:'none' so scroll position maps 1:1 to horizontal position — a continuous
 * read, not a slide deck. SVG icons are dropped inline between the words,
 * acting as punctuation/conjunctions, and each word carries its own margin so
 * the gaps vary naturally the way real typography breathes.
 *
 * The sentence describes what Services actually delivers — wrap, route, prove —
 * with icons that match each clause (truck, road, spark, pin, target, arrow).
 */

import { ReactNode, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  Inline "punctuation" — icons that match the meaning of each clause */
/* ------------------------------------------------------------------ */

/** Side-profile box truck — the canvas the brand rides on. */
function Truck({ h = 70 }: { h?: number }) {
    return (
        <span className="hs-float inline-flex shrink-0 items-center" aria-hidden="true">
            <svg width={h * 1.7} height={h} viewBox="0 0 68 40" fill="none">
                <rect x="2" y="7" width="38" height="22" rx="2.5" stroke="currentColor" strokeWidth="3" />
                <path d="M40 14h9l7 8v7H40z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
                <circle cx="15" cy="32" r="5" stroke="currentColor" strokeWidth="3" />
                <circle cx="47" cy="32" r="5" stroke="currentColor" strokeWidth="3" />
            </svg>
        </span>
    );
}

/** Flowing ribbon curve — the road / route that stitches clauses together. */
function Curve({ w = 220 }: { w?: number }) {
    return (
        <span className="hs-float inline-flex shrink-0 items-center" aria-hidden="true">
            <svg className="hs-curve" width={w} height={w * 0.42} viewBox="0 0 220 92" fill="none">
                <path
                    d="M4 66 C 44 6, 78 6, 110 46 S 176 86, 216 26"
                    stroke="currentColor"
                    strokeWidth="7"
                    strokeLinecap="round"
                />
            </svg>
        </span>
    );
}

/** Four-point sparkle — the "creative" spark. */
function Spark({ s = 64 }: { s?: number }) {
    return (
        <span className="hs-float inline-flex shrink-0 items-center" aria-hidden="true">
            <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0Z" />
            </svg>
        </span>
    );
}

/** Map pin — the streets / routing. */
function Pin({ h = 74 }: { h?: number }) {
    return (
        <span className="hs-float inline-flex shrink-0 items-center" aria-hidden="true">
            <svg width={h * 0.72} height={h} viewBox="0 0 36 50" fill="none">
                <path
                    d="M18 47s14-13 14-29A14 14 0 1 0 4 18c0 16 14 29 14 29Z"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinejoin="round"
                />
                <circle cx="18" cy="18" r="5.5" stroke="currentColor" strokeWidth="3" />
            </svg>
        </span>
    );
}

/** Concentric target — measurement / verified impressions. */
function Target({ s = 72 }: { s?: number }) {
    return (
        <span className="hs-float inline-flex shrink-0 items-center" aria-hidden="true">
            <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" />
                <circle cx="24" cy="24" r="11" stroke="currentColor" strokeWidth="3" />
                <circle cx="24" cy="24" r="3.5" fill="currentColor" />
            </svg>
        </span>
    );
}

/** Forward chevrons — momentum. */
function Arrow({ w = 96 }: { w?: number }) {
    return (
        <span className="hs-float inline-flex shrink-0 items-center" aria-hidden="true">
            <svg width={w} height={w * 0.5} viewBox="0 0 48 24" fill="none">
                <path d="M6 4l8 8-8 8M20 4l8 8-8 8M34 4l8 8-8 8" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </span>
    );
}

/* ------------------------------------------------------------------ */
/*  Tokens — the sentence, in order                                    */
/* ------------------------------------------------------------------ */

type Emph = 'strong' | 'soft';
type Token =
    | { kind: 'word'; text: string; emph?: Emph; size?: 'sm' | 'md' | 'lg'; gap: number }
    | { kind: 'svg'; node: ReactNode; gap: number };

/* "We wrap your brand [truck][road] in bold Creative [spark] route it through
    real Streets [pin][road] and prove every Mile [target] with verified
    Impressions [arrow]" */
const TOKENS: Token[] = [
    { kind: 'word', text: 'We', size: 'sm', gap: 40 },
    { kind: 'word', text: 'wrap', gap: 30 },
    { kind: 'word', text: 'your', size: 'sm', gap: 34 },
    { kind: 'word', text: 'brand', gap: 34 },
    { kind: 'svg', node: <Truck />, gap: 38 },
    { kind: 'svg', node: <Curve w={200} />, gap: 44 },
    { kind: 'word', text: 'in', size: 'sm', gap: 30 },
    { kind: 'word', text: 'bold', emph: 'soft', gap: 34 },
    { kind: 'word', text: 'Creative', emph: 'strong', gap: 26 },
    { kind: 'svg', node: <Spark s={80} />, gap: 70 },
    { kind: 'word', text: 'route', gap: 34 },
    { kind: 'word', text: 'it', size: 'sm', gap: 30 },
    { kind: 'word', text: 'through', size: 'sm', gap: 36 },
    { kind: 'word', text: 'real', emph: 'soft', gap: 32 },
    { kind: 'word', text: 'Streets', emph: 'strong', gap: 26 },
    { kind: 'svg', node: <Pin />, gap: 34 },
    { kind: 'svg', node: <Curve w={240} />, gap: 44 },
    { kind: 'word', text: 'and', size: 'sm', gap: 34 },
    { kind: 'word', text: 'prove', gap: 34 },
    { kind: 'word', text: 'every', size: 'sm', gap: 34 },
    { kind: 'word', text: 'Mile', emph: 'strong', gap: 28 },
    { kind: 'svg', node: <Target s={78} />, gap: 66 },
    { kind: 'word', text: 'with', size: 'sm', gap: 32 },
    { kind: 'word', text: 'verified', emph: 'soft', gap: 40 },
    { kind: 'word', text: 'Impressions', emph: 'strong', gap: 34 },
    { kind: 'svg', node: <Arrow />, gap: 30 },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function HorizontalStatement() {
    const rootRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const track = trackRef.current;
            if (!track) return;

            // How far the row overhangs the viewport = how far it must travel.
            const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

            // Pin the section and tie horizontal position 1:1 to vertical scroll.
            // ease:'none' is essential — otherwise scroll and position drift apart
            // and it stops reading as a single continuous line.
            gsap.to(track, {
                x: () => -distance(),
                ease: 'none',
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'top top',
                    end: () => '+=' + distance(),
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        if (progressRef.current) gsap.set(progressRef.current, { scaleX: self.progress });
                    },
                },
            });
        },
        { scope: rootRef }
    );

    const sizeClass = (t: Extract<Token, { kind: 'word' }>) => {
        if (t.emph === 'strong') return 'font-tommy-bold text-[#C8992B] dark:text-[#FCD119] text-[clamp(56px,12vw,168px)]';
        if (t.emph === 'soft') return 'font-tommy-medium italic text-black/55 dark:text-white/75 text-[clamp(42px,8.5vw,116px)]';
        if (t.size === 'sm') return 'font-tommy-regular text-[#1A1917]/70 dark:text-[#EEE8D9]/80 text-[clamp(34px,6vw,88px)]';
        return 'font-tommy-medium text-[#1A1917] dark:text-[#EEE8D9] text-[clamp(42px,8.5vw,120px)]';
    };

    return (
        <section ref={rootRef} className="relative w-full overflow-hidden border-y border-black/10 bg-[#E7E0CE] text-[#C8992B] transition-colors duration-300 dark:border-white/10 dark:bg-[#141414] dark:text-[#FCD119]">
            <style>{`
                /* Flowing dashes make the road curves read like moving ticker tape. */
                .hs-curve path { stroke-dasharray: 16 12; animation: hs-flow 2.6s linear infinite; }
                @keyframes hs-flow { to { stroke-dashoffset: -224; } }
                @keyframes hs-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                .hs-float { animation: hs-bob 4.5s ease-in-out infinite; }
                .hs-float:nth-of-type(even) { animation-duration: 5.6s; animation-delay: -1.2s; }
                @media (prefers-reduced-motion: reduce) {
                    .hs-curve path { animation: none; }
                    .hs-float { animation: none; }
                }
            `}</style>

            <div className="flex h-screen w-full flex-col justify-center overflow-hidden">
                {/* Corner labels — minimal chrome so the line stays the hero. */}
                <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 pt-[92px] md:px-12 lg:pt-[13vh]">
                    <span className="font-tommy-regular text-[11px] uppercase tracking-[4px] text-black/40 dark:text-white/40">The whole service, in one line</span>
                    <span className="hidden font-tommy-regular text-[11px] uppercase tracking-[4px] text-black/40 lg:block dark:text-white/40">Keep scrolling →</span>
                </div>

                {/* THE single flex row — the whole sentence, flowing sideways. */}
                <div ref={trackRef} className="flex w-max items-center whitespace-nowrap pl-[8vw] pr-[12vw] will-change-transform">
                    {TOKENS.map((t, i) =>
                        t.kind === 'word' ? (
                            <span
                                key={i}
                                className={`inline-block shrink-0 leading-[0.82] tracking-[-0.02em] ${sizeClass(t)}`}
                                style={{ marginRight: t.gap }}
                            >
                                {t.text}
                            </span>
                        ) : (
                            <span key={i} className="inline-flex shrink-0 items-center" style={{ marginRight: t.gap }}>
                                {t.node}
                            </span>
                        )
                    )}
                </div>

                {/* Scrub progress rail */}
                <div className="absolute inset-x-6 bottom-[7vh] z-20 h-px bg-black/12 md:inset-x-12 dark:bg-white/12">
                    <div ref={progressRef} className="h-full origin-left bg-[#C8992B] dark:bg-[#FCD119]" style={{ transform: 'scaleX(0)' }} />
                </div>
            </div>
        </section>
    );
}
