'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function HomeMarquee() {
    const logos: string[] = [
        'marquee-1.png',
        'marquee-1.png',
        'marquee-1.png',
        'marquee-1.png',
        'marquee-1.png',
        'marquee-1.png',
        'marquee-1.png',
        'marquee-1.png',
        'marquee-1.png',
        'marquee-1.png',
    ];

    // Two copies so the track can loop seamlessly (translateX -50% lands on a boundary).
    const track = [...logos, ...logos];

    const sectionRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLParagraphElement>(null);
    const row1Ref = useRef<HTMLDivElement>(null);
    const row2Ref = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            // Reveal as the section scrolls up into view.
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    // Start later (once the section has risen well into view) and finish
                    // higher up, so the reveal plays out while the content is visible
                    // rather than completing during the rise-over.
                    start: 'top 55%',
                    end: 'top 5%',
                    scrub: 1,
                },
            });

            // Heading rises up from behind its mask...
            tl.from(headingRef.current, {
                yPercent: 120,
                autoAlpha: 0,
                ease: 'power2.out',
            }, 0)
                // ...row 1 (scrolls right) slides in from the left...
                .from(row1Ref.current, {
                    xPercent: -40,
                    autoAlpha: 0,
                    ease: 'power2.out',
                }, 0.15)
                // ...row 2 (scrolls left) slides in from the right.
                .from(row2Ref.current, {
                    xPercent: 40,
                    autoAlpha: 0,
                    ease: 'power2.out',
                }, 0.25);
        },
        { scope: sectionRef }
    );

    const renderTile = (logo: string, index: number) => (
        <div
            key={index}
            className="mr-2 shrink-0 rounded-[2px] border border-[#E3E3E3] bg-white py-[24px] px-[84px]"
        >
            <img
                className="w-[72px] h-[76px] object-cover opacity-[0.3]"
                src={`/assets/images/${logo}`}
                alt=""
            />
        </div>
    );

    return (
        <div ref={sectionRef} className="flex flex-col items-center overflow-hidden">
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

            <div className="overflow-hidden">
                <p ref={headingRef} className="text-black text-center font-tommy-regular leading-[40px] text-[30px] capitalize">trusted by Fortune 500 brands across financial services</p>
            </div>

            {/* Row 1 — moves right, enters from the left */}
            <div ref={row1Ref} className="w-full overflow-hidden mt-[100px]">
                <div
                    className="flex flex-row w-max"
                    style={{ animation: 'marquee-right 40s linear infinite' }}
                >
                    {track.map(renderTile)}
                </div>
            </div>

            {/* Row 2 — moves left, enters from the right */}
            <div ref={row2Ref} className="w-full overflow-hidden mt-[10px]">
                <div
                    className="flex flex-row w-max"
                    style={{ animation: 'marquee-left 40s linear infinite' }}
                >
                    {track.map(renderTile)}
                </div>
            </div>
        </div>
    );
}
