'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export default function AdvertisingLeader() {
    const cards = [
        {
            source: "Source: Nielsen 2024",
            percent: 36,
            description: "Of channels drive both brand and sales impact — OOH is one"
        },
        {
            source: "Source: Nielsen 2024",
            percent: 65,
            description: "Of channels drive both brand and sales impact — OOH is one"
        },
        {
            source: "Source: Nielsen 2024",
            percent: 2,
            description: "Digital ad on-target rate in North America — the rest is wasted spend"
        },
    ];

    const rootRef = useRef<HTMLDivElement>(null);
    const paraRef = useRef<HTMLParagraphElement>(null);
    const btnRef = useRef<HTMLAnchorElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef(null);
    const textSceneRef = useRef<HTMLDivElement>(null);
    const cardsSceneRef = useRef<HTMLDivElement>(null);
    const statsHeadingRef = useRef<HTMLHeadingElement>(null);
    const statsSubRef = useRef<HTMLParagraphElement>(null);


    useGSAP(
        () => {
            // Split the paragraph into lines (keeps the coloured highlight spans intact).
            const split = new SplitText(paraRef.current, {
                type: 'lines',
                linesClass: 'leader-line',
            });

            const cardEls = cardsRef.current
                ? (Array.from(cardsRef.current.children) as HTMLElement[])
                : [];

            // Scene B waits off-stage: title and lead-in sit low, each card lower still.
            gsap.set([statsHeadingRef.current, statsSubRef.current], { y: 30, autoAlpha: 0 });
            gsap.set(cardEls, { yPercent: 45, autoAlpha: 0 });

            // Two concentric rings — set each to its own circumference, fully hidden,
            // so they draw on (to full) with the scroll.
            const q = gsap.utils.selector(rootRef);
            const ring1 = (q('.layer-1')[0] as unknown as SVGCircleElement) || null;
            const ring2 = (q('.layer-2')[0] as unknown as SVGCircleElement) || null;
            const len1 = ring1 ? ring1.getTotalLength() : 0;
            const len2 = ring2 ? ring2.getTotalLength() : 0;
            if (ring1) gsap.set(ring1, { strokeDasharray: len1, strokeDashoffset: len1 });
            if (ring2) gsap.set(ring2, { strokeDasharray: len2, strokeDashoffset: len2 });

            // One pinned stage, two scenes. The statement plays and clears out, then the
            // proof cards rise into the space it left — so neither ever has to share the
            // viewport with the other. Positions are absolute (not '+=') so each beat's
            // share of the 3800px pin stays predictable: ~585px per timeline unit.
            const tl = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'top top',
                    end: '+=3800',
                    pin: true,
                    scrub: 1,
                },
            });

            // ── SCENE A — the statement ──
            // Text reveals line by line, blur → readable, while the rings draw on behind it.
            tl.fromTo(
                split.lines,
                { filter: 'blur(12px)', autoAlpha: 0.15, yPercent: 20 },
                { filter: 'blur(0px)', autoAlpha: 1, yPercent: 0, stagger: 0.25, duration: 1.2 },
                0
            )
                // The SVG turns once across the whole section, tying both scenes together.
                .to(svgRef.current, { rotation: 360, transformOrigin: '50% 50%', duration: 6.7 }, 0);

            if (ring1) tl.to(ring1, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut' }, 0.2);
            if (ring2) tl.to(ring2, { strokeDashoffset: 0, duration: 1.7, ease: 'power2.inOut' }, 0.2);

            // Button fades up once the sentence has landed.
            tl.from(btnRef.current, { y: 24, autoAlpha: 0, duration: 0.6, ease: 'power3.out' }, 2.4);

            // ── A → B — the statement clears the stage ──
            tl.to(textSceneRef.current, { yPercent: -55, autoAlpha: 0, duration: 0.9, ease: 'power2.in' }, 3.4);

            // ── SCENE B — the proof ──
            // Title, then lead-in, then the cards — each landing before the next starts,
            // so the numbers arrive already framed. Crossfades with the text leaving.
            tl.to(statsHeadingRef.current, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' }, 3.8)
                .to(statsSubRef.current, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' }, 4.0)
                .to(cardEls, { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out', stagger: 0.18 }, 4.2);

            // ── OUT — rings erase, the proof lifts away, handing off to the truck section.
            if (ring1) tl.to(ring1, { strokeDashoffset: len1, duration: 1, ease: 'power2.inOut' }, 5.6);
            if (ring2) tl.to(ring2, { strokeDashoffset: len2, duration: 0.9, ease: 'power2.inOut' }, 5.6);
            tl.to(cardsSceneRef.current, { yPercent: -70, autoAlpha: 0, duration: 0.9, ease: 'power2.in' }, 5.8);

            // Restore the original paragraph markup on cleanup/HMR.
            return () => {
                split.revert();
            };
        },
        { scope: rootRef }
    );

    return (
        <div ref={rootRef} className='max-w-[95%] rounded-[20px] h-screen w-full bg-white dark:bg-[#141414] transition-colors duration-300 mx-auto mt-[20px] relative overflow-hidden shadow-sm dark:shadow-black/50'>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
                <svg
                    ref={svgRef}
                    width="800"
                    height="800"
                    viewBox="0 0 895 895"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ overflow: 'visible' }}
                >
                    <circle className="layer-1" opacity="0.28" cx="447.5" cy="447.5" r="442.5" stroke="#EEE8D9" strokeWidth="10" />
                    <circle className="layer-2" opacity="0.22" cx="448" cy="448" r="360" stroke="#EEE8D9" strokeWidth="10" />
                </svg>
            </div>
            {/* SCENE A — the statement. Own layer, centred on the stage. */}
            <div ref={textSceneRef} className="absolute inset-0 z-10 flex flex-col items-center justify-center px-[10%]">
                <p ref={paraRef} className="text-[#2C2C2B] dark:text-[#EAEAEA] transition-colors duration-300 text-[36px] leading-[66px] font-tommy-medium text-center capitalize">
                    Advertising Wheels is the leader in truckside billboard advertising. For 25+ years
                    <span className="text-[#D5CCB4] dark:text-[#8C8472]"> we’ve helped national and local brands own the street with one of the largest truckside fleets in the country —</span> pairing bold, high-impact creative with GPS-tracked routing and independently verified impressions
                    <span className="text-[#D5CCB4] dark:text-[#8C8472]"> so every campaign is planned, targeted, and measurable.</span>
                </p>
                <a ref={btnRef} className="rounded-[6px] bg-[#282828] dark:bg-[#FCD119] py-[12px] px-[50px] text-[24px] leading-[50px] text-[#FCD119] dark:text-black font-tommy-regular w-max mt-[50px] transition-colors duration-300 cursor-pointer">More about us</a>
            </div>

            {/* SCENE B — the proof. Same stage, revealed once the statement clears. */}
            <div ref={cardsSceneRef} className="absolute inset-0 z-10 flex flex-col items-center justify-center px-[10%]">
                <h2 ref={statsHeadingRef} className="text-[#1A1917] dark:text-white transition-colors duration-300 font-tommy-bold uppercase tracking-tight text-[clamp(28px,3vw,48px)] leading-tight text-center">
                    The Case For Out-Of-Home<span className="text-[#FCD119]">.</span>
                </h2>
                <p ref={statsSubRef} className="mt-[14px] max-w-[680px] text-center text-[#8A857C] dark:text-[#9A968E] transition-colors duration-300 font-tommy-regular text-[18px] leading-[30px]">
                    Independent measurement, not our own claims — here is how the format compares
                    against the channels chasing the same budget.
                </p>
                <div ref={cardsRef} className="flex flex-row justify-between w-full gap-x-[37px] max-w-[90%] mt-[46px]">
                    {
                        cards.map((card, index) => {
                            return (
                                <div key={index} className={`rounded-[10px] border border-[#EBEAEA] dark:border-[#2A2A2A] py-[15px] flex flex-col items-center justify-between h-[350px] bg-white dark:bg-[#1E1E1E] transition-colors duration-300 ${index == 1 ? 'mt-[8%]' : ''}`} style={{
                                    boxShadow: "7px 4px 15.6px -2px rgba(0, 0, 0, 0.08)",
                                }}>
                                    <div className="rounded-[30px] border border-[#E4E4E4] dark:border-[#333] bg-white dark:bg-[#282828] px-[22px] py-[8px] flex justify-center w-max transition-colors duration-300">
                                        <span className="text-[#ACA7A7] dark:text-[#AAA] text-center text-[16px] leading-[26px] capitalize font-tommy-regular">{card.source}</span>
                                    </div>
                                    <span className="text-[#EEE8D9] dark:text-[#383327] text-[120px] leading-[66px] font-tommy-medium transition-colors duration-300">{card.percent}%</span>
                                    <p className="text-black dark:text-white font-tommy-regular text-[20px] leading-[26px] capitalize text-center max-w-[85%] transition-colors duration-300">
                                        {card.description}
                                    </p>
                                </div>
                            )
                        })
                    }
                </div>
            </div>

        </div>
    )
}
