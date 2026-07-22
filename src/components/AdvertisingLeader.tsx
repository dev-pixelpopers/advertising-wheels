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

    useGSAP(
        () => {
            // Split the paragraph into lines (keeps the coloured highlight spans intact).
            const split = new SplitText(paraRef.current, {
                type: 'lines',
                linesClass: 'leader-line',
            });

            // Each line sharpens from blur → readable as it scrolls up.
            gsap.fromTo(
                split.lines,
                { filter: 'blur(12px)', autoAlpha: 0.15, yPercent: 20 },
                {
                    filter: 'blur(0px)',
                    autoAlpha: 1,
                    yPercent: 0,
                    ease: 'none',
                    stagger: 0.5,
                    scrollTrigger: {
                        trigger: paraRef.current,
                        start: 'top 80%',
                        end: 'bottom 60%',
                        scrub: 1,
                    },
                }
            );

            // Button fades up after the copy.
            gsap.from(btnRef.current, {
                y: 24,
                autoAlpha: 0,
                duration: 0.6,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: btnRef.current,
                    start: 'top 88%',
                    toggleActions: 'play none none reverse',
                },
            });

            // Bottom cards clip-reveal from the bottom and rise in, staggered.
            const cardEls = cardsRef.current
                ? (Array.from(cardsRef.current.children) as HTMLElement[])
                : [];
            gsap.fromTo(
                cardEls,
                { clipPath: 'inset(0% 0% 100% 0%)', yPercent: 18, autoAlpha: 0 },
                {
                    clipPath: 'inset(0% 0% 0% 0%)',
                    yPercent: 0,
                    autoAlpha: 1,
                    duration: 0.9,
                    ease: 'power3.out',
                    stagger: 0.15,
                    scrollTrigger: {
                        trigger: cardsRef.current,
                        start: 'top 82%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );

            // Restore the original paragraph markup on cleanup/HMR.
            return () => {
                split.revert();
            };
        },
        { scope: rootRef }
    );

    return (
        <div ref={rootRef} className='max-w-[95%] rounded-[20px] py-[200px] px-[10%] w-full bg-white mx-auto mt-[20px] flex flex-col items-center relative'>
            <div className="absolute bottom-0">
                <img src="/assets/images/rings.png" alt="" className="w-full h-full object-cover" />
            </div>
            <p ref={paraRef} className="text-[#2C2C2B] text-[36px] leading-[66px] font-tommy-medium text-center capitalize">
                Advertising Wheels is the leader in truckside billboard advertising. For 25+ years
                <span className="text-[#D5CCB4]"> we’ve helped national and local brands own the street with one of the largest truckside fleets in the country —</span> pairing bold, high-impact creative with GPS-tracked routing and independently verified impressions
                <span className="text-[#D5CCB4]"> so every campaign is planned, targeted, and measurable.</span>
            </p>
            <a ref={btnRef} className="rounded-[6px] bg-[#282828] py-[12px] px-[50px] text-[24px] leading-[50px] text-[#FCD119] font-tommy-regular w-max mt-[50px]">More about us</a>
            <div ref={cardsRef} className="flex flex-row justify-between w-full mt-[20px] gap-x-[37px] max-w-[90%]">
                {
                    cards.map((card, index) => {
                        return (
                            <div key={index} className={`rounded-[10px] border border-[#EBEAEA] py-[15px] flex flex-col items-center justify-between h-[350px] bg-white ${index == 1 ? 'mt-[8%]' : ''}`} style={{
                                boxShadow: "7px 4px 15.6px -2px rgba(0, 0, 0, 0.08)",
                            }}>
                                <div className="rounded-[30px] border border-[#E4E4E4] bg-white px-[22px] py-[8px] flex justify-center w-max">
                                    <span className="text-[#ACA7A7] text-center text-[16px] leading-[26px] capitalize font-tommy-regular">{card.source}</span>
                                </div>
                                <span className="text-[#EEE8D9] text-[120px] leading-[66px] font-tommy-medium">{card.percent}%</span>
                                <p className="text-black font-tommy-regular text-[20px] leading-[26px] capitalize text-center max-w-[85%]">
                                    {card.description}
                                </p>
                            </div>
                        )
                    })
                }
            </div>

        </div>
    )
}
