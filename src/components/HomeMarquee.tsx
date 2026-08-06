'use client';

/**
 * HomeMarquee — Floating Brand Showcase.
 *
 * Requirements:
 * 1. Spread Across Screen: Random coordinates pushed far out to create WIDE spaces.
 * 2. Floating: High buoyancy wobble, decoupled from hover scaling.
 * 3. Top Aligned Text: Heading sits at the top.
 * 4. Masking: Gradient mask fades out logos right below the text.
 * 5. Uniform Sizing: Strict bounding box for consistent aspect ratio balancing.
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
    delay?: string;
    url: string;
}

export const BUBBLES: LogoData[] = [
    // Balanced interlocking scatter pattern to ensure zero large gaps.
    { id: 'b1', logo: 'partner-nationwide.png', layer: 'mid', top: '42%', left: '15%', mobileTop: '35%', mobileLeft: '10%', delay: '0s', url: 'https://www.nationwide.com' },
    { id: 'b2', logo: 'burger-king-logo.png', layer: 'mid', top: '38%', left: '50%', mobileTop: '45%', mobileLeft: '70%', delay: '0.8s', url: 'https://www.bk.com' },
    { id: 'b3', logo: 'hertz-logo.png', layer: 'mid', top: '45%', left: '85%', mobileTop: '56%', mobileLeft: '20%', delay: '1.4s', url: 'https://www.hertz.com' },

    { id: 'b4', logo: '5th_3rd.png', layer: 'mid', top: '62%', left: '30%', mobileTop: '64%', mobileLeft: '80%', delay: '2.1s', url: 'https://www.53.com' },
    { id: 'b5', logo: 'partner-wendys.png', layer: 'mid', top: '58%', left: '70%', mobileTop: '75%', mobileLeft: '15%', delay: '0.5s', url: 'https://www.wendys.com' },
    { id: 'b6', logo: 'ab-inbev.png', layer: 'mid', top: '75%', left: '10%', mobileTop: '86%', mobileLeft: '65%', delay: '1.7s', url: 'https://www.ab-inbev.com' },

    { id: 'b7', logo: 'partner-xfinity.png', layer: 'mid', top: '82%', left: '88%', mobileTop: '95%', mobileLeft: '85%', delay: '2.5s', url: 'https://www.xfinity.com' },
    { id: 'b8', logo: 'canes.png', layer: 'mid', top: '90%', left: '48%', mobileTop: '104%', mobileLeft: '30%', delay: '1.1s', url: 'https://www.raisingcanes.com' },
    { id: 'b9', logo: 'aaa-vector-logo.png', layer: 'mid', top: '105%', left: '25%', mobileTop: '115%', mobileLeft: '75%', delay: '0.3s', url: 'https://www.aaa.com' },

    { id: 'b10', logo: 'partner-kaiser.png', layer: 'mid', top: '112%', left: '75%', mobileTop: '126%', mobileLeft: '12%', delay: '1.9s', url: 'https://healthy.kaiserpermanente.org/' },
    { id: 'b11', logo: 'titan.webp', layer: 'mid', top: '125%', left: '12%', mobileTop: '135%', mobileLeft: '68%', delay: '2.8s', url: 'https://www.titan.com/' },
    { id: 'b12', logo: 'dollar-car-rental-logo.png', layer: 'mid', top: '132%', left: '52%', mobileTop: '146%', mobileLeft: '22%', delay: '0.6s', url: 'https://www.dollar.com/' },

    { id: 'b13', logo: 'partner-saks-white.png', logoDark: 'partner-saks-dark.webp', layer: 'mid', top: '145%', left: '85%', mobileTop: '154%', mobileLeft: '82%', delay: '1.2s', url: 'https://www.saksfifthavenue.com/' },
    { id: 'b14', logo: 'partner-floor-decor.png', layer: 'mid', top: '152%', left: '35%', mobileTop: '165%', mobileLeft: '40%', delay: '2.3s', url: 'https://www.flooranddecor.com/' },
    { id: 'b15', logo: 'beringer.webp', layer: 'mid', top: '165%', left: '68%', mobileTop: '176%', mobileLeft: '18%', delay: '0.9s', url: 'https://www.beringer.com/' },

    { id: 'b16', logo: 'partner-echo.png', layer: 'mid', top: '172%', left: '15%', mobileTop: '185%', mobileLeft: '76%', delay: '1.6s', url: 'https://www.echo.com/' },
    { id: 'b17', logo: 'dc-united.png', layer: 'mid', top: '185%', left: '55%', mobileTop: '195%', mobileLeft: '28%', delay: '2.0s', url: 'https://www.dcunited.com/' },
    { id: 'b18', logo: 'partner-razorbacks.png', layer: 'mid', top: '192%', left: '90%', mobileTop: '204%', mobileLeft: '88%', delay: '0.7s', url: 'https://arkansasrazorbacks.com/' },

    { id: 'b19', logo: 'partner-mote-museum.png', layer: 'mid', top: '205%', left: '30%', mobileTop: '215%', mobileLeft: '15%', delay: '1.5s', url: 'https://mote.org/' },
    { id: 'b20', logo: 'outer.png', layer: 'mid', top: '212%', left: '72%', mobileTop: '226%', mobileLeft: '60%', delay: '2.7s', url: 'https://liveouter.com/' },
    { id: 'b21', logo: 'partner-penn811.png', layer: 'mid', top: '225%', left: '10%', mobileTop: '235%', mobileLeft: '22%', delay: '1.0s', url: 'https://www.pa1call.org/' },

    { id: 'b22', logo: 'partner-reliable.png', layer: 'mid', top: '232%', left: '50%', mobileTop: '245%', mobileLeft: '78%', delay: '0.4s', url: 'https://reliable.com/' },
    { id: 'b23', logo: 'charly-logo-png_seeklogo-436078-removebg-preview.png', layer: 'mid', top: '245%', left: '85%', mobileTop: '256%', mobileLeft: '35%', delay: '1.8s', url: 'https://www.charly.com/' },
];

export default function HomeMarquee({ scrollDriven = false }: { scrollDriven?: boolean } = {}) {
    return (
        <div className="home-marquee relative w-full h-full overflow-hidden flex flex-col justify-between py-8 md:py-16">
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
                    const uniformSize = 'h-[60px] w-[130px] md:h-[100px] md:w-[300px]';

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
        </div>
    );
}
