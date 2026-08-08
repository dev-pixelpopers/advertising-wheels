'use client';

/**
 * HomeMarquee — the client logo field.
 *
 * This component paints NOTHING in place. Every one of the 23 marks renders at
 * `left: 0; top: 0` and is positioned entirely by GSAP `x`/`y`, which
 * SecondSection sets to `translateY(120vh)` on mount. There is deliberately no
 * CSS `left`/`top`, no grid, no flex, no per-breakpoint position rule: if the
 * timeline never ran, the stage would be empty rather than showing a static
 * arrangement. The tables below are TARGETS for tweens, not layout.
 *
 * Positions are fractions of the stage, resolved to px at tween time so they
 * survive a resize (`invalidateOnRefresh`).
 *
 * Motion is split across four nested elements on purpose, so nothing fights for
 * the same `transform`:
 *
 *   [data-bubble-layer]  the timeline's       — entrance, drift, sweep, scale
 *   [data-bubble-body]   the fluid solver's   — idle sine, pressure, colliders
 *   a                    nothing (the link box)
 *   img                  the hover scale
 */

const LOGO_DIR = '/assets/images/clients-logo';

/** A target: x and y as fractions of the stage, plus a scale multiplier. */
export type Target = { x: number; y: number; s?: number };

export interface LogoData {
    id: string;
    logo: string;
    logoDark?: string;
    /** Pool 1 (12) enters on load; pool 2 (11) enters on the first scroll. */
    wave: 1 | 2;
    /** PHASE 1 target — pool 1 only. Where the first twelve settle on load. */
    a?: Target;
    aSm?: Target;
    /** PHASE 2 target — all 23, the packed pool after the first scroll. */
    b: Target;
    bSm: Target;
    /** Seconds of offset into the idle sine's horizontal drift and roll. */
    phase: number;
    url: string;
}

/* ── PHASE 1 — twelve marks, wall to wall around the text block ───────────
   Three rows: five across the top, two either side of the block, five across
   the bottom. They tile the viewport exactly —

     rows 1 and 3   5 marks at x .10/.30/.50/.70/.90, each a fifth of the width
     row 2          2 marks at x .155/.845, scaled 1.55 so one mark bridges the
                    whole strip between a side wall and the block's edge
     vertically     y .23 / .525 / .84, which lands the top row's upper edge on
                    the header line and the bottom row's lower edge on the floor

   Row 2 is scaled rather than sized differently in CSS because CSS is not
   allowed to know anything about the arrangement here. It is also why only the
   two widest marks in the set (Hertz and Xfinity, both 482×183) can go there:
   a strip is about 2.6:1, and anything squarer hits its height ceiling before it
   reaches the block. */

/* ── PHASE 2 — twenty-three marks, the packed pool ───────────────────────
   A six-column grid. Pool 1 drifts up into the top two rows; pool 2 floods in
   below it, two marks either side of the block and nine across the lower half.
   Marks also shed scale here — 23 in a stage sized for 12 has to compress. */

export const BUBBLES: LogoData[] = [
    // ══ POOL 1 (12) — phase 1 row 1, drifting to phase 2 row 1 ══
    { id: 'b1', logo: 'partner-nationwide.png', wave: 1, phase: 0, url: 'https://www.nationwide.com', a: { x: 0.10, y: 0.23 }, b: { x: 0.08, y: 0.10 }, aSm: { x: 0.18, y: 0.12 }, bSm: { x: 0.18, y: 0.06 } },
    { id: 'b5', logo: 'partner-wendys.png', wave: 1, phase: 0.5, url: 'https://www.wendys.com', a: { x: 0.30, y: 0.23 }, b: { x: 0.245, y: 0.10 }, aSm: { x: 0.50, y: 0.12 }, bSm: { x: 0.50, y: 0.06 } },
    { id: 'b2', logo: 'burger-king-logo.png', wave: 1, phase: 0.8, url: 'https://www.bk.com', a: { x: 0.50, y: 0.23 }, b: { x: 0.41, y: 0.10 }, aSm: { x: 0.82, y: 0.12 }, bSm: { x: 0.82, y: 0.06 } },
    { id: 'b4', logo: '5th_3rd.png', wave: 1, phase: 2.1, url: 'https://www.53.com', a: { x: 0.70, y: 0.23 }, b: { x: 0.59, y: 0.10 }, aSm: { x: 0.18, y: 0.30 }, bSm: { x: 0.18, y: 0.19 } },
    { id: 'b12', logo: 'dollar-car-rental-logo.png', wave: 1, phase: 0.6, url: 'https://www.dollar.com/', a: { x: 0.90, y: 0.23 }, b: { x: 0.755, y: 0.10 }, aSm: { x: 0.50, y: 0.30 }, bSm: { x: 0.50, y: 0.19 } },

    // Phase 1 row 2 — the two widest marks, one per side strip, scaled to bridge it
    { id: 'b7', logo: 'partner-xfinity.png', wave: 1, phase: 2.5, url: 'https://www.xfinity.com', a: { x: 0.845, y: 0.525, s: 1.55 }, b: { x: 0.92, y: 0.10 }, aSm: { x: 0.82, y: 0.30 }, bSm: { x: 0.82, y: 0.19 } },
    { id: 'b3', logo: 'partner-hertz.png', wave: 1, phase: 1.4, url: 'https://www.hertz.com', a: { x: 0.155, y: 0.525, s: 1.55 }, b: { x: 0.08, y: 0.30 }, aSm: { x: 0.18, y: 0.70 }, bSm: { x: 0.18, y: 0.32 } },

    // Phase 1 row 3 — the bottom wall
    { id: 'b9', logo: 'aaa-vector-logo.png', wave: 1, phase: 0.3, url: 'https://www.aaa.com', a: { x: 0.10, y: 0.84 }, b: { x: 0.245, y: 0.30 }, aSm: { x: 0.50, y: 0.70 }, bSm: { x: 0.50, y: 0.32 } },
    { id: 'b10', logo: 'partner-kaiser.png', wave: 1, phase: 1.9, url: 'https://healthy.kaiserpermanente.org/', a: { x: 0.30, y: 0.84 }, b: { x: 0.41, y: 0.30 }, aSm: { x: 0.82, y: 0.70 }, bSm: { x: 0.82, y: 0.32 } },
    { id: 'b8', logo: 'partner-raising-canes.png', wave: 1, phase: 1.1, url: 'https://www.raisingcanes.com', a: { x: 0.50, y: 0.84 }, b: { x: 0.59, y: 0.30 }, aSm: { x: 0.18, y: 0.88 }, bSm: { x: 0.18, y: 0.45 } },
    { id: 'b6', logo: 'ab-inbev.png', wave: 1, phase: 1.7, url: 'https://www.ab-inbev.com', a: { x: 0.70, y: 0.84 }, b: { x: 0.755, y: 0.30 }, aSm: { x: 0.50, y: 0.88 }, bSm: { x: 0.50, y: 0.45 } },
    { id: 'b15', logo: 'beringer.png', wave: 1, phase: 0.9, url: 'https://www.beringer.com/', a: { x: 0.90, y: 0.84 }, b: { x: 0.92, y: 0.30 }, aSm: { x: 0.82, y: 0.88 }, bSm: { x: 0.82, y: 0.45 } },

    // ══ POOL 2 (11) — no phase 1 target; these are still below the fold then ══

    // Either side of the block
    { id: 'b13', logo: 'partner-saks-white.png', logoDark: 'partner-saks-dark.png', wave: 2, phase: 1.2, url: 'https://www.saksfifthavenue.com/', b: { x: 0.08, y: 0.50 }, bSm: { x: 0.18, y: 0.58 } },
    { id: 'b16', logo: 'partner-echo.png', wave: 2, phase: 1.6, url: 'https://www.echo.com/', b: { x: 0.92, y: 0.50 }, bSm: { x: 0.50, y: 0.58 } },

    // The lower half
    { id: 'b14', logo: 'partner-floor-decor.png', wave: 2, phase: 2.3, url: 'https://www.flooranddecor.com/', b: { x: 0.08, y: 0.70 }, bSm: { x: 0.82, y: 0.58 } },
    { id: 'b22', logo: 'partner-reliable.png', wave: 2, phase: 0.4, url: 'https://reliable.com/', b: { x: 0.24, y: 0.50 }, bSm: { x: 0.18, y: 0.71 } },
    { id: 'b11', logo: 'titan.png', wave: 2, phase: 2.8, url: 'https://www.titan.com/', b: { x: 0.50, y: 0.70 }, bSm: { x: 0.50, y: 0.71 } },
    { id: 'b17', logo: 'dc-united.png', wave: 2, phase: 2.0, url: 'https://www.dcunited.com/', b: { x: 0.655, y: 0.70 }, bSm: { x: 0.82, y: 0.71 } },
    { id: 'b18', logo: 'partner-razorbacks.png', wave: 2, phase: 0.7, url: 'https://arkansasrazorbacks.com/', b: { x: 0.92, y: 0.70 }, bSm: { x: 0.18, y: 0.84 } },

    // The floor
    { id: 'b20', logo: 'outer.png', wave: 2, phase: 2.7, url: 'https://liveouter.com/', b: { x: 0.08, y: 0.86 }, bSm: { x: 0.50, y: 0.84 } },
    { id: 'b19', logo: 'partner-mote-museum.png', wave: 2, phase: 1.5, url: 'https://mote.org/', b: { x: 0.41, y: 0.86 }, bSm: { x: 0.82, y: 0.84 } },
    { id: 'b21', logo: 'partner-penn811.png', wave: 2, phase: 1.0, url: 'https://www.pa1call.org/', b: { x: 0.59, y: 0.86 }, bSm: { x: 0.32, y: 0.90 } },
    { id: 'b23', logo: 'charly-logo-png_seeklogo-436078-removebg-preview.png', wave: 2, phase: 1.8, url: 'https://www.charly.com/', b: { x: 0.82, y: 0.86 }, bSm: { x: 0.68, y: 0.90 } },
];

export default function HomeMarquee() {
    return (
        <div className="home-marquee relative w-full h-full overflow-hidden">
            <style>{`
                /* The block in the water.

                   Two things make it read that way. The first is the barrier in
                   src/lib/logoFluid: this box is registered as a solid rectangle,
                   so on desktop no logo can enter it and marks flooding up from
                   below are turned aside around it. The second is
                   backdrop-filter, which samples whatever is painted beneath —
                   the logo stage is a sibling below it in paint order — so on
                   mobile, where the heading spans the full width and there is no
                   way around it, anything crossing goes soft and dim instead.

                   The radial mask keeps the shield from reading as a hard card:
                   it is opaque under the text and dissolves before its edge,
                   which is why the barrier is registered with a negative pad —
                   the collider has to match the visible mass, not the box. */
                .hm-text-shield {
                    backdrop-filter: blur(16px) saturate(1.08);
                    -webkit-backdrop-filter: blur(16px) saturate(1.08);
                    background: rgba(238, 232, 217, 0.55);
                    -webkit-mask-image: radial-gradient(ellipse 78% 62% at 50% 50%, #000 58%, transparent 82%);
                    mask-image: radial-gradient(ellipse 78% 62% at 50% 50%, #000 58%, transparent 82%);
                }
                .dark .hm-text-shield {
                    background: rgba(10, 10, 10, 0.5);
                }

                /* One cell for every mark: a fifth of the width, a third of the
                   height. This is SIZE only — it says nothing about where a mark
                   goes, which is the timeline's business. Marks that need to be
                   bigger than a cell get there on a tween scale, not here.

                   Sized off the viewport rather than in authored pixels because
                   a cell is a fraction of the screen: any pixel width that filled
                   one at 1920 would overflow at 1280. object-fit then does the
                   per-logo work inside the cell, holding each mark's own aspect
                   ratio, so nothing is stretched or cropped. */
                .hm-logo-img {
                    width: 20vw;
                    height: auto;
                    max-height: 32vh;
                    object-fit: contain;
                }
                @media (max-width: 767px) {
                    /* Three columns instead of five, so a third of the width. */
                    .hm-logo-img { width: 33vw; max-height: 22vh; }
                }
            `}</style>

            {/* The logo field — beneath the heading, so the shield can blur it. */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                {BUBBLES.map((b, i) => (
                    <div
                        key={b.id}
                        data-bubble-id={b.id}
                        data-bubble-layer
                        data-wave={b.wave}
                        data-idx={i}
                        data-phase={b.phase}
                        /* `left-0 top-0` and nothing else. Position comes from the
                           timeline's x/y, and the timeline parks these at 120vh on
                           mount, so an unrun timeline leaves an empty stage rather
                           than a static arrangement.

                           `w-max` is not cosmetic: an absolutely positioned box
                           that shrinks to fit is limited by the space between its
                           offset and the far edge, and Tailwind's
                           `img { max-width: 100% }` then squashes the artwork.
                           max-content takes the offset out of the sizing.

                           No `-translate-x-1/2` either — GSAP writes
                           `translate: none` on anything it animates, which would
                           silently throw that centring away. xPercent/yPercent do
                           it instead, inside the transform GSAP owns. */
                        className="absolute left-0 top-0 w-max pointer-events-auto"
                    >
                        {/* The fluid solver's element, and only its element. Its
                            transform is rewritten every frame, so nothing else may
                            claim it — not a Tailwind class, not a CSS animation. */}
                        <div data-bubble-body className="will-change-transform">
                            <a
                                href={b.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block"
                            >
                                {b.logoDark ? (
                                    <>
                                        <img
                                            src={`${LOGO_DIR}/${b.logo}`}
                                            alt="Brand logo"
                                            className="hm-logo-img object-contain transition-all duration-400 opacity-90 group-hover:scale-[1.15] group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100 block dark:hidden"
                                            loading="lazy"
                                        />
                                        <img
                                            src={`${LOGO_DIR}/${b.logoDark}`}
                                            alt="Brand logo"
                                            className="hm-logo-img object-contain transition-all duration-400 opacity-90 group-hover:scale-[1.15] group-hover:invert-0 group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100 hidden dark:block"
                                            loading="lazy"
                                        />
                                    </>
                                ) : (
                                    <img
                                        src={`${LOGO_DIR}/${b.logo}`}
                                        alt="Brand logo"
                                        className="hm-logo-img object-contain transition-all duration-400 opacity-90 dark:invert group-hover:scale-[1.15] group-hover:dark:invert-0 group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100"
                                        loading="lazy"
                                    />
                                )}
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* The block — vertically centred, above the field. The only thing on
                this stage that IS positioned by CSS, because it never moves. */}
            <div className="absolute inset-0 z-20 flex items-center justify-center px-5 md:px-6 pointer-events-none">
                <div className="hm-text-shield rounded-[999px] px-8 py-7 md:px-16 md:py-12">
                    {/* Capped narrow on purpose: the block has to leave a real
                        strip down each side for the water to fill. */}
                    <p className="hm-heading max-w-[620px] text-center font-tommy-regular text-[clamp(1.125rem,2.2vw,2.1rem)] leading-[1.3] text-[#1A1917] dark:text-white transition-colors duration-300">
                        Trusted by Fortune 500 brands — from financial services to QSR, retail, and automotive.
                    </p>
                </div>
            </div>
        </div>
    );
}
