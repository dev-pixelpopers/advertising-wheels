'use client';

/**
 * HomeMarquee — Floating Brand Showcase.
 *
 * Requirements:
 * 1. Spread Across Screen: Scattered floating layout (no orbits/lines) with RANDOM coordinates.
 * 2. High Density: Tighter vertical packing so more logos are visible at once on desktop.
 * 3. Top Aligned Text: Heading sits at the top.
 * 4. Masking: A gradient mask fades out logos just below the text so they don't overlap it.
 * 5. Blacked Out Default: Logos are silhouette/black by default, full color on hover.
 * 6. Linked: Each logo is wrapped in an anchor tag leading to its site.
 */

const LOGO_DIR = '/assets/images/clients-logo';

export interface LogoData {
    id: string;
    logo: string;
    logoDark?: string;
    layer: 'fast' | 'mid' | 'anchor';
    top: string;
    left: string;
    mobileTop?: string;
    mobileLeft?: string;
    size?: 'sm' | 'md' | 'lg';
    delay?: string;
    url: string;
}

export const BUBBLES: LogoData[] = [
    { id: 'b1', logo: 'partner-nationwide.png', layer: 'mid', top: '35%', left: '15%', mobileTop: '35%', mobileLeft: '10%', size: 'lg', delay: '0s', url: 'https://www.nationwide.com' },
    { id: 'b2', logo: 'burger-king-logo.webp', layer: 'mid', top: '42%', left: '78%', mobileTop: '45%', mobileLeft: '70%', size: 'md', delay: '0.8s', url: 'https://www.bk.com' },
    { id: 'b3', logo: 'hertz-logo.webp', layer: 'mid', top: '48%', left: '34%', mobileTop: '56%', mobileLeft: '20%', size: 'lg', delay: '1.4s', url: 'https://www.hertz.com' },
    { id: 'b4', logo: '5th_3rd.webp', layer: 'mid', top: '55%', left: '88%', mobileTop: '64%', mobileLeft: '80%', size: 'md', delay: '2.1s', url: 'https://www.53.com' },
    { id: 'b5', logo: 'partner-wendys.png', layer: 'mid', top: '61%', left: '12%', mobileTop: '75%', mobileLeft: '15%', size: 'lg', delay: '0.5s', url: 'https://www.wendys.com' },
    { id: 'b6', logo: 'ab-inbev.webp', layer: 'mid', top: '66%', left: '52%', mobileTop: '86%', mobileLeft: '65%', size: 'sm', delay: '1.7s', url: 'https://www.ab-inbev.com' },
    { id: 'b7', logo: 'partner-xfinity.png', layer: 'mid', top: '74%', left: '22%', mobileTop: '95%', mobileLeft: '85%', size: 'lg', delay: '2.5s', url: 'https://www.xfinity.com' },
    { id: 'b8', logo: 'canes.webp', layer: 'mid', top: '79%', left: '71%', mobileTop: '104%', mobileLeft: '30%', size: 'md', delay: '1.1s', url: 'https://www.raisingcanes.com' },
    { id: 'b9', logo: 'aaa-vector-logo.webp', layer: 'mid', top: '85%', left: '45%', mobileTop: '115%', mobileLeft: '75%', size: 'md', delay: '0.3s', url: 'https://www.aaa.com' },
    { id: 'b10', logo: 'partner-kaiser.png', layer: 'mid', top: '92%', left: '85%', mobileTop: '126%', mobileLeft: '12%', size: 'sm', delay: '1.9s', url: 'https://healthy.kaiserpermanente.org/' },
    { id: 'b11', logo: 'titan.webp', layer: 'mid', top: '98%', left: '18%', mobileTop: '135%', mobileLeft: '68%', size: 'lg', delay: '2.8s', url: 'https://www.titan.com/' },
    { id: 'b12', logo: 'dollar-car-rental-logo.webp', layer: 'mid', top: '104%', left: '60%', mobileTop: '146%', mobileLeft: '22%', size: 'md', delay: '0.6s', url: 'https://www.dollar.com/' },
    { id: 'b13', logo: 'partner-saks-white.webp', logoDark: 'partner-saks-dark.webp', layer: 'mid', top: '111%', left: '38%', mobileTop: '154%', mobileLeft: '82%', size: 'lg', delay: '1.2s', url: 'https://www.saksfifthavenue.com/' },
    { id: 'b14', logo: 'partner-floor-decor.png', layer: 'mid', top: '118%', left: '92%', mobileTop: '165%', mobileLeft: '40%', size: 'md', delay: '2.3s', url: 'https://www.flooranddecor.com/' },
    { id: 'b15', logo: 'beringer.webp', layer: 'mid', top: '124%', left: '11%', mobileTop: '176%', mobileLeft: '18%', size: 'sm', delay: '0.9s', url: 'https://www.beringer.com/' },
    { id: 'b16', logo: 'partner-echo.png', layer: 'mid', top: '130%', left: '75%', mobileTop: '185%', mobileLeft: '76%', size: 'lg', delay: '1.6s', url: 'https://www.echo.com/' },
    { id: 'b17', logo: 'dc-united.webp', layer: 'mid', top: '136%', left: '28%', mobileTop: '195%', mobileLeft: '28%', size: 'md', delay: '2.0s', url: 'https://www.dcunited.com/' },
    { id: 'b18', logo: 'partner-razorbacks.png', layer: 'mid', top: '144%', left: '56%', mobileTop: '204%', mobileLeft: '88%', size: 'lg', delay: '0.7s', url: 'https://arkansasrazorbacks.com/' },
    { id: 'b19', logo: 'partner-mote-museum.png', layer: 'mid', top: '151%', left: '84%', mobileTop: '215%', mobileLeft: '15%', size: 'sm', delay: '1.5s', url: 'https://mote.org/' },
    { id: 'b20', logo: 'outer.webp', layer: 'mid', top: '158%', left: '20%', mobileTop: '226%', mobileLeft: '60%', size: 'lg', delay: '2.7s', url: 'https://liveouter.com/' },
    { id: 'b21', logo: 'partner-penn811.png', layer: 'mid', top: '165%', left: '48%', mobileTop: '235%', mobileLeft: '22%', size: 'md', delay: '1.0s', url: 'https://www.pa1call.org/' },
    { id: 'b22', logo: 'partner-reliable.png', layer: 'mid', top: '172%', left: '14%', mobileTop: '245%', mobileLeft: '78%', size: 'lg', delay: '0.4s', url: 'https://reliable.com/' },
    { id: 'b23', logo: 'charly-logo-png_seeklogo-436078-removebg-preview.png', layer: 'mid', top: '178%', left: '77%', mobileTop: '256%', mobileLeft: '35%', size: 'sm', delay: '1.8s', url: 'https://www.charly.com/' },
];

export default function HomeMarquee({ scrollDriven = false }: { scrollDriven?: boolean } = {}) {
    return (
        <div className="home-marquee relative w-full h-full overflow-hidden flex flex-col justify-between py-8 md:py-16">
            <style>{`
                @keyframes float-wobble {
                    0% { transform: translate(0px, 0px) rotate(0deg); }
                    33% { transform: translate(12px, -24px) rotate(3deg); }
                    66% { transform: translate(-14px, -10px) rotate(-3deg); }
                    100% { transform: translate(4px, 15px) rotate(1.5deg); }
                }

                .logo-wobble {
                    animation: float-wobble 5s ease-in-out infinite alternate;
                }

                /* Mobile-specific position overrides */
                ${BUBBLES.filter(b => b.mobileLeft).map(b => `
                    @media (max-width: 767px) {
                        [data-bubble-id="${b.id}"] {
                            top: ${b.mobileTop || b.top} !important;
                            left: ${b.mobileLeft || b.left} !important;
                        }
                    }
                `).join('')}
            `}</style>

            {/* Section Heading - Top Aligned */}
            <div className="relative z-20 mx-auto max-w-[840px] px-6 text-center pt-8 md:pt-16 pointer-events-none">
                <p className="hm-heading text-center font-tommy-regular text-[clamp(1.125rem,2.2vw,2.1rem)] leading-[1.3] text-[#1A1917] dark:text-white transition-colors duration-300">
                    Trusted by Fortune 500 brands — from financial services to QSR, retail, and automotive.
                </p>
            </div>

            {/* Pure Floating Unboxed Logos Stage with Top Mask */}
            <div
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{
                    // This mask ensures logos fade out elegantly right below the text
                    maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 22%, black 35%, black 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 22%, black 35%, black 100%)'
                }}
            >
                {BUBBLES.map((b) => {
                    // A strict, uniform bounding box ensures all logos 
                    // scale to a consistent maximum height or width.
                    const uniformSize = 'h-[50px] w-[130px] md:h-[70px] md:w-[200px]';

                    return (
                        <div
                            key={b.id}
                            data-bubble-id={b.id}
                            data-bubble-layer={b.layer}
                            style={{
                                top: b.top,
                                left: b.left,
                            }}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                        >
                            <a
                                href={b.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ animationDelay: b.delay }}
                                className="group logo-wobble block transition-transform duration-300 hover:scale-[1.15]"
                            >
                                {b.logoDark ? (
                                    <>
                                        <img
                                            src={`${LOGO_DIR}/${b.logo}`}
                                            alt="Brand logo"
                                            className={`${uniformSize} object-contain transition-all duration-400 opacity-40 group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100 block dark:hidden`}
                                            loading="lazy"
                                        />
                                        <img
                                            src={`${LOGO_DIR}/${b.logoDark}`}
                                            alt="Brand logo"
                                            className={`${uniformSize} object-contain transition-all duration-400 opacity-40 group-hover:invert-0 group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100 hidden dark:block`}
                                            loading="lazy"
                                        />
                                    </>
                                ) : (
                                    <img
                                        src={`${LOGO_DIR}/${b.logo}`}
                                        alt="Brand logo"
                                        className={`${uniformSize} object-contain transition-all duration-400 opacity-40 dark:invert group-hover:dark:invert-0 group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100`}
                                        loading="lazy"
                                    />
                                )}
                            </a>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
