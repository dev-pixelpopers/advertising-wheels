'use client';

const LOGO_DIR = '/assets/images/review/logo';

/** Most logos are a single file. Ones with a light/dark pair swap by theme:
 *  `white` shows on the light theme, `dark` shows on the dark theme. */
type LogoEntry = string | { light: string; dark: string };

const ROW_1_LOGOS: LogoEntry[] = [
    { light: 'partner-saks-white.png', dark: 'partner-saks-dark.png' },
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
    'partner-fanduel.png',
    'partner-morgan.png',
    'partner-hertz.png',
    'partner-outer.png',
    'partner-mudflap.png',
    'partner-floor-decor.png',
    'partner-xfinity.png',
    'partner-fifth-third.png',
    'partner-ohionet.png',
    'partner-titan.png',
    'partner-reliable.png',
    'partner-shocktop.png',
    'partner-raising-canes.png',
];

export default function HomeMarquee() {
    // Two copies so each track can loop seamlessly (translateX -50% lands on a boundary).
    const row1Track = [...ROW_1_LOGOS, ...ROW_1_LOGOS, ...ROW_1_LOGOS];
    const row2Track = [...ROW_2_LOGOS, ...ROW_2_LOGOS, ...ROW_2_LOGOS];

    const renderTile = (logo: LogoEntry, index: number) => {
        const imgClass = "w-[60px] md:w-[clamp(5rem,8.3vw,10rem)] h-[70px] md:h-[clamp(4rem,6.25vw,7.5rem)] object-contain opacity-[0.8] transition-all";

        if (typeof logo === 'string') {
            return (
                <div key={index} className="mr-2 shrink-0">
                    <img className={imgClass} src={`${LOGO_DIR}/${logo}`} alt="" />
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
            `}</style>

            <div className="overflow-hidden py-[20px] md:py-[40px] lg:py-[60px]">
                <p className="hm-heading text-black dark:text-white text-center font-tommy-regular leading-[133.33%] text-[clamp(1.125rem,2vw,1.875rem)] capitalize transition-colors duration-300">trusted by Fortune 500 brands across financial services</p>
            </div>

            <div className='mt-[16px] md:mt-[22px] lg:mt-[30px] pb-[60px]'>
                <div className="hm-row1 w-full overflow-hidden">
                    <div
                        className="flex flex-row gap-[20px] md:gap-[40px] lg:gap-[70px] xl:gap-[100px] 2xl:gap-[150px]"
                        style={{ animation: 'marquee-right 40s linear infinite' }}
                    >
                        {row2Track.map(renderTile)}
                    </div>
                </div>

                <div className="hm-row2 w-full overflow-hidden mt-[24px] md:mt-[35px] lg:mt-[50px]">
                    <div
                        className="flex flex-row gap-[20px] md:gap-[40px] lg:gap-[70px] xl:gap-[100px] 2xl:gap-[150px]"
                        style={{ animation: 'marquee-left 40s linear infinite' }}
                    >
                        {row1Track.map(renderTile)}
                    </div>
                </div>
            </div>
        </div>
    );
}
