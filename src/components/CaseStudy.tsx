'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function CaseStudy() {
    const rootRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const paraRef = useRef<HTMLParagraphElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const statItems = statsRef.current
                ? statsRef.current.querySelectorAll('li')
                : [];

            const tl = gsap.timeline({
                defaults: { ease: 'power3.out' },
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'top 72%',
                    // Replay on re-entry: play when it scrolls in, reverse when it
                    // scrolls back up past the start, so coming back plays it again.
                    toggleActions: 'play none none reverse',
                },
            });

            tl
                // Divider draws out from the left...
                .from(lineRef.current, {
                    scaleX: 0,
                    transformOrigin: 'left center',
                    duration: 0.6,
                })
                // ...heading wipes up from behind its mask...
                .from(headingRef.current, {
                    yPercent: 110,
                    duration: 0.8,
                }, '-=0.3')
                // ...blurb fades up...
                .from(paraRef.current, {
                    y: 24,
                    autoAlpha: 0,
                    duration: 0.6,
                }, '-=0.4')
                // ...the case-study card lifts in with a subtle scale...
                .from(cardRef.current, {
                    y: 64,
                    autoAlpha: 0,
                    scale: 0.97,
                    transformOrigin: 'center bottom',
                    duration: 0.9,
                }, '-=0.5')
                // ...the stats panel follows...
                .from(statsRef.current, {
                    y: 44,
                    autoAlpha: 0,
                    duration: 0.7,
                }, '-=0.5')
                // ...and its rows cascade in.
                .from(statItems, {
                    y: 16,
                    autoAlpha: 0,
                    duration: 0.5,
                    stagger: 0.07,
                }, '-=0.4');
        },
        { scope: rootRef }
    );

    return (
        <div ref={rootRef} className="mt-[150px] w-full max-w-[90%] mx-auto flex flex-row">
            <div className="w-[50%] flex justify-end">
                <div className="flex flex-col gap-10 justify-center items-end">
                    <div className="flex flex-row gap-10 w-fit justify-end">
                        <div ref={lineRef} className="border border-t-black h-[2px] w-[126px] my-auto"></div>
                        <div className="overflow-hidden max-w-[50%]">
                            <h2 ref={headingRef} className="font-tommy-medium text-[66px] capitalize text-black leading-[100%]">explore our case study</h2>
                        </div>
                    </div>
                    <p ref={paraRef} className="font-tommy-regular text-[21px] leading-[30px] text-black max-w-[68%] capitalize">Our client, a growing consumer brand, wanted to increase brand awareness and reach a wider audience in key urban markets.</p>
                </div>
            </div>
            <div className="w-[55%]">
                <div ref={cardRef} className="w-[650px] rounded-[8px] border border-[#F0F0F0] bg-[#FFF] py-[10px] px-[10px] flex flex-col gap-10">
                    <div className="flex flex-row justify-between pt-[30px] px-[15px]">
                        <h2 className="text-[42px] font-tommy-medium leading-[45px] uppercase text-black">Fifth Third Bank</h2>
                        <svg xmlns="http://www.w3.org/2000/svg" width="119" height="119" viewBox="0 0 119 119" fill="none" className="mt-[-10%]">
                            <circle cx="59.5" cy="59.5" r="59.5" fill="black" />
                            <path d="M43.4436 42.4436C42.8913 42.4436 42.4436 42.8913 42.4436 43.4436L42.4436 52.4436C42.4436 52.9959 42.8913 53.4436 43.4436 53.4436C43.9959 53.4436 44.4436 52.9959 44.4436 52.4436L44.4436 44.4436L52.4436 44.4436C52.9959 44.4436 53.4436 43.9959 53.4436 43.4436C53.4436 42.8913 52.9959 42.4436 52.4436 42.4436L43.4436 42.4436ZM75.5547 75.5547L76.2618 74.8476L44.1507 42.7365L43.4436 43.4436L42.7365 44.1507L74.8476 76.2618L75.5547 75.5547Z" fill="#FCD119" />
                        </svg>
                    </div>
                    <img className="w-full h-full rounded-[10px]" src="/assets/images/case-study-img.jpg" alt="" />
                </div>
                <div ref={statsRef} className="relative w-[90%] rounded-[8px] border border-[#F0F0F0] bg-[#FFF] py-[5px] flex flex-row gap-[10px] mx-auto -mt-[15%] px-[5px]">
                    <div className="bg-[#202020] border border-[#F0F0F0] rounded-[8px] py-[10px] text-center">
                        <ul className="flex flex-col  text-[#EEE8D9] font-tommy-medium text-[40px] leading-[30px] capitalize gap-y-6 px-[12px] py-[10px]">
                            <li>+96%</li>
                            <li>8%</li>
                            <li>6,802</li>
                            <li>12</li>
                        </ul>
                    </div>
                    <div>
                        <ul className="flex flex-col gap-y-6 py-[20px] text-[#000] text-[21px] leading-[30px] font-tommy-regular capitalize px-[5px]">
                            <li> branded checking search clicks</li>
                            <li> lift in household production</li>
                            <li> incremental checking households,</li>
                            <li>month better-than-break-even ROMI </li>
                        </ul>
                    </div>
                </div>
            </div>

        </div>
    );
}
