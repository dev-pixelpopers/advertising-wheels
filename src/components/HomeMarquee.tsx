'use client';

/**
 * HomeMarquee — the client logo field.
 *
 * A block sitting in water. The heading is the block: centred, fixed, carrying a
 * frosted shield so anything drifting behind it goes soft and dim. The logos are
 * the water: they surface from below in two waves, settle into a scatter that
 * works AROUND the heading rather than over it, and keep bobbing once they land.
 *
 * Motion is split across three elements on purpose, so nothing fights for the
 * same `transform`:
 *
 *   [data-bubble-layer]  the parent timeline's — the rise, and the blast at the end
 *   a.logo-wobble        the CSS buoyancy loop
 *   img                  the hover scale
 *
 * Resting positions live here as percentages of the stage; SecondSection reads
 * them back off the DOM to work out which way each logo flies when it detonates.
 */

const LOGO_DIR = '/assets/images/clients-logo';

/**
 * Per-logo widths in desktop px, supplied by the client. Artwork carries very
 * different amounts of whitespace, so one uniform box made some marks read tiny
 * and others enormous; these are sized by eye against each other.
 *
 * Capped against the viewport at render (see `.hm-logo-img`) so a 480px mark
 * does not eat a small laptop. Anything not listed falls back to DEFAULT_W.
 */
const LOGO_W: Record<string, number> = {
    b2: 250,   // Burger King
    b3: 450,   // Hertz
    b5: 300,   // Wendy's
    b6: 380,   // AB InBev
    b7: 430,   // Xfinity
    b8: 430,   // Raising Cane's
    b9: 400,   // AAA
    b10: 340,  // Kaiser
    b11: 260,  // Titan
    b14: 450,  // Floor & Decor
    b15: 480,  // Beringer
    b16: 450,  // Echo
    b18: 350,  // Arkansas Razorbacks
    b22: 450,  // Reliable
};
const DEFAULT_W = 330;

export interface LogoData {
    id: string;
    logo: string;
    logoDark?: string;
    /** Which surfacing wave this logo belongs to. */
    wave: 1 | 2;
    /** Resting position, as a percentage of the stage. */
    top: string;
    left: string;
    mobileTop: string;
    mobileLeft: string;
    /** Desyncs the buoyancy loop so the field never pulses in unison. */
    delay: string;
    url: string;
}

/**
 * Water flowing past a block.
 *
 * Only ONE wave is on screen at a time, so each wave has to be a complete
 * arrangement in its own right — a full scatter up both sides of the heading,
 * not half a picture waiting for the other half. (Splitting the waves by
 * height instead, so one fills the top and one the bottom, only works if both
 * are up together; with one at a time it just looks like the field forgot how
 * to finish.)
 *
 * DESKTOP — every mark sits in the channel to the left or the right of the
 * heading, or in the band below it. Nothing rests above the heading at centre
 * width, because the only way in is straight through the block: these logos
 * rise vertically, so a mark directly above the heading means a path directly
 * through it. Marks BELOW the heading at centre width are fine — they come to
 * rest before they ever reach it. That constraint is the whole reason the
 * heading is capped narrow: it buys channels wide enough to be channels.
 *
 * MOBILE — the heading spans nearly the full width, so there are no side
 * channels to flow through and the constraint cannot hold. Marks go in the
 * bands above and below instead, and the ones bound for the top cross the
 * heading on the way up, where the shield's blur takes over.
 *
 * TOP FLOOR — no mark goes above 20% (15% on mobile). These are centred on
 * their `top` value, so half the artwork sits ABOVE the number: a mark at 8%
 * on a 940px stage puts its upper edge around 45px, underneath a ~65px fixed
 * site header, and the logo gets sliced. The floor has to cover the header
 * plus half the tallest logo, with room to spare on a short laptop where the
 * same percentage buys far fewer pixels. Likewise nothing goes past 92%.
 */
export const BUBBLES: LogoData[] = [
    /* ══ WAVE 1 — a complete scatter: both channels, full height, plus two
          below the block. ═══════════════════════════════════════════════ */

    // Left channel
    { id: 'b1', logo: 'partner-nationwide.png', wave: 1, top: '20%', left: '9%', mobileTop: '15%', mobileLeft: '14%', delay: '0s', url: 'https://www.nationwide.com' },
    { id: 'b3', logo: 'partner-hertz.png', wave: 1, top: '33%', left: '17%', mobileTop: '25%', mobileLeft: '38%', delay: '1.4s', url: 'https://www.hertz.com' },
    { id: 'b5', logo: 'partner-wendys.png', wave: 1, top: '46%', left: '7%', mobileTop: '35%', mobileLeft: '12%', delay: '0.5s', url: 'https://www.wendys.com' },
    { id: 'b7', logo: 'partner-xfinity.png', wave: 1, top: '60%', left: '15%', mobileTop: '74%', mobileLeft: '20%', delay: '2.5s', url: 'https://www.xfinity.com' },
    { id: 'b9', logo: 'aaa-vector-logo.png', wave: 1, top: '74%', left: '8%', mobileTop: '84%', mobileLeft: '42%', delay: '0.3s', url: 'https://www.aaa.com' },

    // Right channel
    { id: 'b2', logo: 'burger-king-logo.png', wave: 1, top: '23%', left: '89%', mobileTop: '18%', mobileLeft: '66%', delay: '0.8s', url: 'https://www.bk.com' },
    { id: 'b4', logo: '5th_3rd.png', wave: 1, top: '35%', left: '83%', mobileTop: '27%', mobileLeft: '88%', delay: '2.1s', url: 'https://www.53.com' },
    { id: 'b6', logo: 'ab-inbev.png', wave: 1, top: '49%', left: '93%', mobileTop: '37%', mobileLeft: '62%', delay: '1.7s', url: 'https://www.ab-inbev.com' },
    { id: 'b8', logo: 'partner-raising-canes.png', wave: 1, top: '63%', left: '85%', mobileTop: '77%', mobileLeft: '72%', delay: '1.1s', url: 'https://www.raisingcanes.com' },
    { id: 'b10', logo: 'partner-kaiser.png', wave: 1, top: '77%', left: '92%', mobileTop: '87%', mobileLeft: '88%', delay: '1.9s', url: 'https://healthy.kaiserpermanente.org/' },

    // Below the block — safe at centre width, they stop short of it
    { id: 'b11', logo: 'titan.png', wave: 1, top: '88%', left: '33%', mobileTop: '92%', mobileLeft: '16%', delay: '2.8s', url: 'https://www.titan.com/' },
    { id: 'b12', logo: 'dollar-car-rental-logo.png', wave: 1, top: '90%', left: '67%', mobileTop: '90%', mobileLeft: '62%', delay: '0.6s', url: 'https://www.dollar.com/' },

    /* ══ WAVE 2 — the same again, offset into the gaps wave one left. ═══ */

    // Left channel
    { id: 'b13', logo: 'partner-saks-white.png', logoDark: 'partner-saks-dark.png', wave: 2, top: '21%', left: '15%', mobileTop: '16%', mobileLeft: '42%', delay: '1.2s', url: 'https://www.saksfifthavenue.com/' },
    { id: 'b15', logo: 'beringer.png', wave: 2, top: '33%', left: '7%', mobileTop: '25%', mobileLeft: '14%', delay: '0.9s', url: 'https://www.beringer.com/' },
    { id: 'b17', logo: 'dc-united.png', wave: 2, top: '47%', left: '17%', mobileTop: '35%', mobileLeft: '38%', delay: '2.0s', url: 'https://www.dcunited.com/' },
    { id: 'b19', logo: 'partner-mote-museum.png', wave: 2, top: '61%', left: '9%', mobileTop: '72%', mobileLeft: '46%', delay: '1.5s', url: 'https://mote.org/' },
    { id: 'b21', logo: 'partner-penn811.png', wave: 2, top: '75%', left: '14%', mobileTop: '82%', mobileLeft: '84%', delay: '1.0s', url: 'https://www.pa1call.org/' },

    // Right channel
    { id: 'b14', logo: 'partner-floor-decor.png', wave: 2, top: '24%', left: '85%', mobileTop: '19%', mobileLeft: '86%', delay: '2.3s', url: 'https://www.flooranddecor.com/' },
    { id: 'b16', logo: 'partner-echo.png', wave: 2, top: '36%', left: '93%', mobileTop: '28%', mobileLeft: '66%', delay: '1.6s', url: 'https://www.echo.com/' },
    { id: 'b18', logo: 'partner-razorbacks.png', wave: 2, top: '50%', left: '83%', mobileTop: '38%', mobileLeft: '90%', delay: '0.7s', url: 'https://arkansasrazorbacks.com/' },
    { id: 'b20', logo: 'outer.png', wave: 2, top: '64%', left: '91%', mobileTop: '75%', mobileLeft: '14%', delay: '2.7s', url: 'https://liveouter.com/' },
    { id: 'b22', logo: 'partner-reliable.png', wave: 2, top: '78%', left: '86%', mobileTop: '85%', mobileLeft: '30%', delay: '0.4s', url: 'https://reliable.com/' },

    // Below the block
    { id: 'b23', logo: 'charly-logo-png_seeklogo-436078-removebg-preview.png', wave: 2, top: '89%', left: '50%', mobileTop: '92%', mobileLeft: '68%', delay: '1.8s', url: 'https://www.charly.com/' },
];

export default function HomeMarquee() {
    return (
        <div className="home-marquee relative w-full h-full overflow-hidden">
            <style>{`
                @keyframes float-wobble {
                    0% { transform: translate(0px, 0px) rotate(0deg); }
                    33% { transform: translate(16px, -30px) rotate(4deg); }
                    66% { transform: translate(-18px, -15px) rotate(-4deg); }
                    100% { transform: translate(6px, 20px) rotate(2deg); }
                }
                .logo-wobble {
                    animation: float-wobble 5.5s ease-in-out infinite alternate;
                }

                /* The block in the water. backdrop-filter samples whatever is
                   painted beneath this element, and the logo stage is a sibling
                   below it in paint order — so a logo drifting behind the
                   heading goes soft and dim, and sharpens again on the way out.
                   That, rather than any collision logic, is what makes the field
                   read as flowing AROUND the heading.

                   The radial mask keeps the shield from reading as a hard card:
                   it is opaque under the text and dissolves before its edge. */
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

                @media (prefers-reduced-motion: reduce) {
                    .logo-wobble { animation: none; }
                }

                /* Authored width, but never more of the screen than it can
                   afford. The vw cap is what keeps a 480px mark from swallowing
                   a small laptop, and mobile takes a fraction of the desktop
                   figure before its own cap applies. */
                .hm-logo-img {
                    width: min(var(--logo-w, 330px), 22vw);
                    height: auto;
                    object-fit: contain;
                }
                @media (max-width: 767px) {
                    .hm-logo-img { width: min(calc(var(--logo-w, 330px) * 0.42), 34vw); }
                }

                /* Mobile resting positions. The heading spans nearly the full
                   width on a phone, so the keep-out zone is a horizontal band
                   and the scatter works above and below it, not beside it. */
                ${BUBBLES.map(b => `
                    @media (max-width: 767px) {
                        [data-bubble-id="${b.id}"] {
                            top: ${b.mobileTop} !important;
                            left: ${b.mobileLeft} !important;
                        }
                    }
                `).join('')}
            `}</style>

            {/* The logo field — beneath the heading, so the shield can blur it. */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                {BUBBLES.map((b) => {
                    // Per-logo width, capped against the viewport by `.hm-logo-img`.
                    const uniformSize = 'hm-logo-img';

                    return (
                        <div
                            key={b.id}
                            data-bubble-id={b.id}
                            data-bubble-layer
                            data-wave={b.wave}
                            style={{ top: b.top, left: b.left }}
                            /* No `-translate-x-1/2` here: GSAP writes `translate: none`
                               on anything it animates, which would silently throw that
                               centring away and leave every logo hanging off its mark by
                               half its own size. The parent does the centring with
                               xPercent/yPercent instead, inside the transform it owns. */
                            className="absolute pointer-events-auto"
                        >
                            <a
                                href={b.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    animationDelay: b.delay,
                                    ['--logo-w' as string]: `${LOGO_W[b.id] ?? DEFAULT_W}px`,
                                }}
                                className="group logo-wobble block"
                            >
                                {b.logoDark ? (
                                    <>
                                        <img
                                            src={`${LOGO_DIR}/${b.logo}`}
                                            alt="Brand logo"
                                            className={`${uniformSize} object-contain transition-all duration-400 opacity-90 group-hover:scale-[1.15] group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100 block dark:hidden`}
                                            loading="lazy"
                                        />
                                        <img
                                            src={`${LOGO_DIR}/${b.logoDark}`}
                                            alt="Brand logo"
                                            className={`${uniformSize} object-contain transition-all duration-400 opacity-90 group-hover:scale-[1.15] group-hover:invert-0 group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100 hidden dark:block`}
                                            loading="lazy"
                                        />
                                    </>
                                ) : (
                                    <img
                                        src={`${LOGO_DIR}/${b.logo}`}
                                        alt="Brand logo"
                                        className={`${uniformSize} object-contain transition-all duration-400 opacity-90 dark:invert group-hover:scale-[1.15] group-hover:dark:invert-0 group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100`}
                                        loading="lazy"
                                    />
                                )}
                            </a>
                        </div>
                    );
                })}
            </div>

            {/* The block — vertically centred, above the field. */}
            <div className="absolute inset-0 z-20 flex items-center justify-center px-5 md:px-6 pointer-events-none">
                <div className="hm-text-shield rounded-[999px] px-8 py-7 md:px-16 md:py-12">
                    {/* Capped narrow on purpose: the block has to leave a real
                        channel down each side for the logos to flow through. */}
                    <p className="hm-heading max-w-[620px] text-center font-tommy-regular text-[clamp(1.125rem,2.2vw,2.1rem)] leading-[1.3] text-[#1A1917] dark:text-white transition-colors duration-300">
                        Trusted by Fortune 500 brands — from financial services to QSR, retail, and automotive.
                    </p>
                </div>
            </div>
        </div>
    );
}
