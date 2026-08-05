'use client';

const LOGO_DIR = '/assets/images/review/logo';

/** Most logos are a single file. Ones with a light/dark pair swap by theme:
 *  `white` shows on the light theme, `dark` shows on the dark theme. */
type LogoEntry = string | { light: string; dark: string };

const ROW_1_LOGOS: LogoEntry[] = [
    { light: 'partner-saks-white.webp', dark: 'partner-saks-dark.webp' },
    'partner-staywell.png',
    'partner-vw.png',
    'partner-wendys.png',
    'partner-cuyahoga.png',
    'partner-kaiser.png',
    'partner-mote-museum.png',
    'partner-nationwide.png',
    'partner-penn811.png',
    'partner-razorbacks.png',
];

const ROW_2_LOGOS: LogoEntry[] = [
    'partner-echo.png',
    'partner-outer.png',
    'partner-floor-decor.png',
    'partner-titan.png',
    'partner-saks-white.webp'
];

/**
 * Dark-theme legibility WITHOUT inverting. Monochrome/dark-ink marks vanish
 * against a dark ground, and inverting a colored mark just turns it into a
 * white blob. Instead, on the dark theme each single-file mark sits on its own
 * light "chip" (a rounded white panel), so dark-ink AND full-colour logos read
 * exactly as their artwork intends. The light theme keeps them floating on the
 * cream ground as before.
 *
 * Chip classes must be `dark:`-prefixed so they only apply on the dark theme —
 * this project defines the variant as `@variant dark (&:where(.dark, .dark *))`.
 */
const DARK_CHIP = 'dark:rounded-[6px] dark:bg-[#383327] dark:p-2 md:dark:p-3';

/**
 * `scrollDriven` hands the horizontal movement to a parent ScrollTrigger on
 * desktop: the CSS auto-scroll is switched off at `lg` and up, and the parent
 * translates [data-hm-row] instead. Below `lg` the rows keep looping on their
 * own, so touch users still see motion without any scroll dependency.
 */
export default function HomeMarquee({ scrollDriven = false }: { scrollDriven?: boolean } = {}) {
    // Two copies so each track can loop seamlessly (translateX -50% lands on a boundary).
    const row1Track = [...ROW_1_LOGOS, ...ROW_1_LOGOS, ...ROW_1_LOGOS];
    const row2Track = [...ROW_2_LOGOS, ...ROW_2_LOGOS, ...ROW_2_LOGOS];

    const renderTile = (logo: LogoEntry, index: number) => {
        const imgClass = "w-[60px] md:w-[clamp(5rem,8.3vw,10rem)] h-[70px] md:h-[clamp(4rem,6.25vw,7.5rem)] object-contain opacity-[0.8] transition-all";

        if (typeof logo === 'string') {
            return (
                <div key={index} className={`mr-2 shrink-0 ${DARK_CHIP}`}>
                    <img className={`${imgClass} dark:opacity-100`} src={`${LOGO_DIR}/${logo}`} alt="" />
                </div>
            );
        }

        return (
            <div key={index} className="mr-2 shrink-0">
                <img className={`${imgClass} block dark:hidden`} src={`${LOGO_DIR}/${logo.light}`} alt="" />
                <img className={`${imgClass} hidden dark:block`} src={`${LOGO_DIR}/${logo.dark}`} alt="" />
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
            `}</style>

            <div className="overflow-hidden py-[20px] md:py-[40px] lg:py-[60px]">
                <p className="hm-heading text-black dark:text-white text-center font-tommy-regular leading-[133.33%] 
                text-[clamp(1.125rem,2vw,1.875rem)] capitalize transition-colors duration-300">Trusted by Fortune 500 brands —
                    from financial services to QSR, retail, and automotive.</p>
            </div>

            <div className='mt-[16px] md:mt-[22px] lg:mt-[30px] pb-[60px]'>
                <div className="hm-row1 w-full overflow-hidden">
                    <div
                        data-hm-row="1"
                        className="hm-anim-right flex flex-row gap-[20px] md:gap-[40px] lg:gap-[70px] xl:gap-[100px] 2xl:gap-[150px]"
                    >
                        {row2Track.map(renderTile)}
                    </div>
                </div>

                <div className="hm-row2 w-full overflow-hidden mt-[24px] md:mt-[35px] lg:mt-[50px]">
                    <div
                        data-hm-row="2"
                        className="hm-anim-left flex flex-row gap-[20px] md:gap-[40px] lg:gap-[70px] xl:gap-[100px] 2xl:gap-[150px]"
                    >
                        {row1Track.map(renderTile)}
                    </div>
                </div>
            </div>
        </div>
    );
}
