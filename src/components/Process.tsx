'use client';

import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Process() {
    const circles = [
        {
            tag: "01",
            title: "Target Markets",
            description: "We identify the best locations and routes for your campaign."
        },
        {
            tag: "02",
            title: "Artwork Design",
            description: "Our team helps create visuals that stand out on the road."
        },
        {
            tag: "03",
            title: "Target Markets",
            description: "We identify the best locations and routes for your campaign."
        },
        {
            tag: "04",
            title: "Track Performance",
            description: "Receive reports and insights to measure success."
        },
    ]

    const rootRef = useRef<HTMLDivElement>(null);
    const eyebrowRef = useRef<HTMLParagraphElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const circlesRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const circleEls = circlesRef.current
                ? (Array.from(circlesRef.current.children) as HTMLElement[])
                : [];

            // Measure how far each circle must travel to sit stacked at the
            // cluster's centre — so they can start as a deck and fan out.
            const dx: number[] = [];
            const dy: number[] = [];
            const container = circlesRef.current;
            if (container) {
                const cRect = container.getBoundingClientRect();
                const cx = cRect.left + cRect.width / 2;
                const cy = cRect.top + cRect.height / 2;
                circleEls.forEach((el) => {
                    const r = el.getBoundingClientRect();
                    dx.push(cx - (r.left + r.width / 2));
                    dy.push(cy - (r.top + r.height / 2));
                });
            }

            const tl = gsap.timeline({
                defaults: { ease: 'power3.out' },
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'top top',
                    end: '+=1800',
                    pin: true,
                    scrub: 1,
                },
            });

            tl
                // 1. Heading reveals on scroll in.
                .from(eyebrowRef.current, {
                    y: 20,
                    autoAlpha: 0,
                    duration: 0.5,
                })
                .from(headingRef.current, {
                    y: 70,
                    autoAlpha: 0,
                    duration: 1,
                }, '-=0.2')
                // 2 + 3. Circles start stacked (a deck) at the centre with a slight
                //         tilt, then shuffle out to the full expanded spread.
                .from(circleEls, {
                    x: (i: number) => dx[i],
                    y: (i: number) => dy[i],
                    rotation: () => gsap.utils.random(-8, 8),
                    scale: 0.9,
                    autoAlpha: 0,
                    transformOrigin: 'center center',
                    duration: 0.9,
                    ease: 'power3.out',
                    stagger: { each: 0.1, from: 'center' },
                }, '+=0.1');
        },
        { scope: rootRef }
    );

    return (
        <div ref={rootRef} className="py-[150px]">
            <p ref={eyebrowRef} className="font-tommy-regular text-[30px] leading-[100%] text-black text-center w-full">Our Process</p>
            <h2 ref={headingRef} className="text-[230px] leading-[226px] text-white font-tommy-bold tracking-[-11px] text-center w-full capitalize">How it Works<span className="text-[#FCD119]">.</span></h2>
            <div ref={circlesRef} className="flex flex-row mt-[20px]">
                {
                    circles.map((item, index) => {
                        return (
                            <div key={index} className={`w-[550px] h-[550px] flex flex-col border border-dotted border-[#2D2D2D] rounded-[100%] pl-[52px] ${index > 0 ? "ml-[-17%]" : ""}
                            ${index % 2 != 0 ? "mt-[-7%] justify-start bg-white pt-[87px]" : "bg-[#EEE8D9] justify-end pb-[87px]"} `}>
                                <div className="flex flex-col">
                                    <span className={`text-black text-[100.8px] leading-[100%] font-tommy-bold capitalize opacity-[0.03] ${index % 2 != 0 ? "order-3" : "order: 1"}`}>
                                        {item.tag}
                                    </span>
                                    <span className={`text-black text-center text-[30px] leading-[66px] capitalize font-tommy-medium ${index % 2 != 0 ? "max-w-[80%]" : " max-w-[55%]"}`}>{item.title}</span>
                                    <p className={`text-black text-[21px] leading-[30px] font-tommy-regular capitalize  ${index % 2 != 0 ? "max-w-[50%]" : "pl-[70px] max-w-[65%]"}`}>{item.description}</p>
                                </div>
                            </div>
                        )
                    })
                }
                <div className={`w-[550px] h-[550px] flex flex-col border border-dotted border-[#2D2D2D] rounded-[100%] ml-[-17%] bg-[#EEE8D9] justify-end relative`}>
                    <div className="absolute top-[10%] left-[10%]">
                        <Image
                            src="/assets/images/process-inner-rings.png"
                            alt=""
                            width={500}
                            height={500}
                            loading="lazy"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-row relative z-10 w-full h-full justify-center items-center">
                        <a className="text-black text-[26px] leading-[30px] underline font-tommy-regular flex justify-center items-center gap-[30px]">
                            Get Started
                            <svg xmlns="http://www.w3.org/2000/svg" width="119" height="119" viewBox="0 0 119 119" fill="none">
                                <circle cx="59.5" cy="59.5" r="59.5" fill="black" />
                                <path d="M43.4436 42.4436C42.8913 42.4436 42.4436 42.8913 42.4436 43.4436L42.4436 52.4436C42.4436 52.9959 42.8913 53.4436 43.4436 53.4436C43.9959 53.4436 44.4436 52.9959 44.4436 52.4436L44.4436 44.4436L52.4436 44.4436C52.9959 44.4436 53.4436 43.9959 53.4436 43.4436C53.4436 42.8913 52.9959 42.4436 52.4436 42.4436L43.4436 42.4436ZM75.5547 75.5547L76.2618 74.8476L44.1507 42.7365L43.4436 43.4436L42.7365 44.1507L74.8476 76.2618L75.5547 75.5547Z" fill="#FCD119" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

        </div >
    );
}
