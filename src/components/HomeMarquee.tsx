'use client';

/**
 * HomeMarquee — the "trusted by" logo wall.
 *
 * Two layouts, one roster:
 *
 *   • `lg` and up — the original two looping rows. On desktop the parent hands
 *     the horizontal movement to a ScrollTrigger (see `scrollDriven`), so the
 *     logos track with the scroll rather than looping on a timer.
 *   • below `lg` — a marquee is the wrong shape for a phone: the marks have to
 *     shrink to fit a track, and you only ever see a slice of the roster. So
 *     the small screens get every logo at once as a static grid, three to a row,
 *     sized to stay readable and to fit inside a single screen.
 *
 * Both layouts are rendered; CSS picks one. The images are the same URLs, so
 * the hidden layout costs DOM nodes, not requests.
 */

const LOGO_DIR = '/assets/images/clients-logo';

/** Split across the two desktop rows; the mobile grid shows them all in order. */
const ROW_1_LOGOS: string[] = [
    'partner-nationwide.png',
    'burger-king-logo.webp',
    'hertz-logo.webp',
    '5th_3rd.webp',
    'partner-wendys.png',
    'ab-inbev.webp',
    'partner-xfinity.png',
    'canes.webp',
    'aaa-vector-logo.webp',
    'partner-kaiser.png',
    'titan.webp',
    'dollar-car-rental-logo.webp',
];

const ROW_2_LOGOS: string[] = [
    'partner-saks-white.webp',
    'partner-floor-decor.png',
    'beringer.webp',
    'partner-echo.png',
    'dc-united.webp',
    'partner-razorbacks.png',
    'partner-mote-museum.png',
    'outer.webp',
    'partner-penn811.png',
    'partner-reliable.png',
    'charly-logo-png_seeklogo-436078-removebg-preview.png',
];

const ALL_LOGOS = [...ROW_1_LOGOS, ...ROW_2_LOGOS];

/**
 * Dark-theme legibility WITHOUT inverting. Nearly every mark here is dark ink
 * or full colour on a transparent ground, so on the dark theme each one sits on
 * its own light chip and reads exactly as its artwork intends — inverting would
 * turn a coloured mark into a white blob. The light theme lets them float on
 * the cream ground unchipped.
 *
 * Chip classes must be `dark:`-prefixed so they only apply on the dark theme —
 * this project defines the variant as `@variant dark (&:where(.dark, .dark *))`.
 */
const DARK_CHIP = 'dark:rounded-[6px] dark:bg-[#EEE8D9] dark:p-2 md:dark:p-3';

/**
 * `scrollDriven` hands the horizontal movement to a parent ScrollTrigger on
 * desktop: the CSS auto-scroll is switched off at `lg` and up, and the parent
 * translates [data-hm-row] instead. The rows only exist at `lg` and up, so this
 * is the only mode that matters — below that the static grid takes over.
 */
export default function HomeMarquee({ scrollDriven = false }: { scrollDriven?: boolean } = {}) {
    // Three copies so each track can loop seamlessly (travelling one third lands on a boundary).
    const row1Track = [...ROW_1_LOGOS, ...ROW_1_LOGOS, ...ROW_1_LOGOS];
    const row2Track = [...ROW_2_LOGOS, ...ROW_2_LOGOS, ...ROW_2_LOGOS];

    const renderTile = (logo: string, index: number) => {
        const imgClass =
            'w-[60px] md:w-[clamp(5rem,8.3vw,10rem)] h-[70px] md:h-[clamp(4rem,6.25vw,7.5rem)] object-contain opacity-[0.8] transition-all';

        return (
            <div key={index} className={`mr-2 shrink-0 ${DARK_CHIP}`}>
                <img className={`${imgClass} dark:opacity-100`} src={`${LOGO_DIR}/${logo}`} alt="" />
            </div>
        );
    };

    // Animations are orchestrated by the parent SecondSection via the class hooks below.
    return (
        <div className="home-marquee flex flex-col items-center overflow-hidden">
            <style>{`
                @keyframes marquee-right {
                    from { transform: translateX(-50%); }
                    to { transform: translateX(0); }
                }
                @keyframes marquee-left {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                .hm-anim-right { animation: marquee-right 40s linear infinite; }
                .hm-anim-left  { animation: marquee-left 40s linear infinite; }
                ${scrollDriven
                ? `/* Desktop hands the movement to the parent's ScrollTrigger. */
                       @media (min-width: 1024px) {
                           .hm-anim-right, .hm-anim-left { animation: none !important; }
                       }`
                : ''}
                @media (prefers-reduced-motion: reduce) {
                    .hm-anim-right, .hm-anim-left { animation: none !important; }
                }

                /* ── The small-screen wall ──────────────────────────────────
                   Column widths are calc()'d against the row's own gap, which
                   reads far better here than as escaped arbitrary values. The
                   base rules are the phone ones; each media query widens them. */
                .hm-grid {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: center;
                    /* Row gap is deliberately tight on phones: eight rows of
                       cards, the heading, AND the reserved header strip all
                       have to clear a single screen. */
                    gap: 9px 12px;
                }
                /* Only geometry lives here — the frosted look itself is the same
                   utility recipe the CTA credential tiles use, applied on the
                   element, so the two surfaces stay in step. */
                .hm-tile {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: calc((100% - 2 * 12px) / 3);
                    padding: 9px 10px;
                }
                /* Fixed mark height is what keeps every card in a row the same
                   size, so the wall reads as a grid rather than a ragged stack. */
                .hm-logo {
                    max-width: 100%;
                    height: clamp(38px, 6vh, 56px);
                    object-fit: contain;
                    opacity: 0.85;
                }
                .dark .hm-logo { opacity: 1; }

                @media (min-width: 640px) {
                    .hm-grid { gap: 18px 16px; }
                    .hm-tile {
                        width: calc((100% - 3 * 16px) / 4);
                        padding: 12px 14px;
                    }
                    .hm-logo { height: clamp(46px, 6.6vh, 68px); }
                }
                @media (min-width: 768px) {
                    .hm-grid { gap: 22px 20px; }
                    .hm-tile {
                        width: calc((100% - 4 * 20px) / 5);
                        padding: 14px 16px;
                    }
                    .hm-logo { height: clamp(50px, 7vh, 78px); }
                }
                /* Short phones (SE-class, and anything in landscape-ish crops):
                   eight rows plus a heading simply cannot hold the taller card
                   on a ~667px screen, so the whole wall steps down a size
                   rather than overflowing the pinned panel and getting cut. */
                @media (max-width: 1023px) and (max-height: 740px) {
                    .hm-grid { gap: 8px 10px; }
                    .hm-tile { padding: 6px 8px; }
                    .hm-logo { height: clamp(26px, 5.2vh, 44px); }
                }

                /* The site header is FIXED to the top of the viewport, and this
                   panel is pinned to fill that same viewport — so a wall tall
                   enough to nearly fill the screen puts its heading straight
                   under the header. Reserve the header's height here, and note
                   the sizes above are tuned so the wall still clears the screen
                   WITH this padding added. Desktop needs none of it: the two
                   marquee rows are far shorter and never reach the top. */
                @media (max-width: 1023px) {
                    .home-marquee { padding-top: 64px; }
                }
                @media (max-width: 1023px) and (max-height: 740px) {
                    .home-marquee { padding-top: 52px; }
                }

                /* The grid hides itself here rather than with a \`lg:hidden\`
                   utility: this sheet ships after Tailwind's, so at equal
                   specificity \`.hm-grid { display: flex }\` would win and the
                   wall would sit under the marquee on desktop. */
                @media (min-width: 1024px) {
                    .hm-grid { display: none; }
                }
            `}</style>

            <div className="overflow-hidden py-[12px] md:py-[40px] lg:py-[60px]">
                <p className="hm-heading text-black dark:text-white text-center font-tommy-regular leading-[133.33%]
                text-[clamp(1.125rem,2vw,1.875rem)] capitalize transition-colors duration-300">Trusted by Fortune 500 brands —
                    from financial services to QSR, retail, and automotive.</p>
            </div>

            {/* ── Desktop: the two looping rows ─────────────────────────── */}
            <div className='hidden lg:block mt-[16px] md:mt-[22px] lg:mt-[30px] pb-[60px]'>
                <div className="hm-row1 w-full overflow-hidden">
                    <div
                        data-hm-row="1"
                        className="hm-anim-right flex flex-row gap-[20px] md:gap-[40px] lg:gap-[70px] xl:gap-[100px] 2xl:gap-[150px]"
                    >
                        {row1Track.map(renderTile)}
                    </div>
                </div>

                <div className="hm-row2 w-full overflow-hidden mt-[24px] md:mt-[35px] lg:mt-[50px]">
                    <div
                        data-hm-row="2"
                        className="hm-anim-left flex flex-row gap-[20px] md:gap-[40px] lg:gap-[70px] xl:gap-[100px] 2xl:gap-[150px]"
                    >
                        {row2Track.map(renderTile)}
                    </div>
                </div>
            </div>

            {/* ── Phone / tablet: the whole roster, one screen ───────────── */}
            <div className="hm-grid mt-[14px] w-full px-4 pb-[10px] md:mt-[22px] md:px-8 md:pb-[24px]">
                {/* The frosted tile from the CTA credential row, reused verbatim:
                    translucent fill, bright edge, and an inner top highlight —
                    the lift on hover is dropped because GSAP owns this element's
                    transform for the reveal and would overwrite it.

                    On the dark theme the fill flips to near-opaque light instead
                    of staying translucent. Over the CTA's yellow band a 25% white
                    works; over near-black it would leave this roster — mostly
                    black ink on transparent — unreadable. */}
                {ALL_LOGOS.map((file) => (
                    <div
                        key={file}
                        data-hm-tile
                        className="hm-tile group rounded-2xl border border-white/45 bg-white/25 shadow-[0_4px_20px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md transition-all duration-300 hover:border-white/70 hover:bg-white/40 hover:shadow-[0_10px_28px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.85)] dark:border-white/25 dark:bg-white/[0.85]"
                    >
                        <img
                            className="hm-logo transition-transform duration-300 group-hover:scale-[1.04]"
                            src={`${LOGO_DIR}/${file}`}
                            alt=""
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
