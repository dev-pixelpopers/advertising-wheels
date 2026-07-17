'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Header from '@/components/Header';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const FRAME_COUNT = 208;

const getFrameSrc = (index: number): string => {
  const frameNumber = (index + 1).toString().padStart(4, '0');
  return `/assets/images/hero_7/frame_${frameNumber}.png`;
};

interface HeroProps {
  isReady: boolean;
}

export default function Hero({ isReady }: HeroProps) {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const divRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLDivElement>(null);

  // 1. CANVAS PRELOADING & SCROLL SCRUBBING
  useGSAP(
    () => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      if (!canvas || !context) return;

      const drawCover = (image: HTMLImageElement, index: number): void => {
        let height = image.naturalHeight;
        let width = image.naturalWidth;
        if (index < 50) {
          const scale = (height - 100) / height;
          height = height - (height * scale);
          width = width - (width * scale);
        }
        const cw = canvas.width;
        const ch = canvas.height;
        const imageRatio = width / height;
        const canvasRatio = cw / ch;

        let dw: number, dh: number, dx: number, dy: number;

        if (imageRatio > canvasRatio) {
          dh = ch;
          dw = ch * imageRatio;
          dx = (cw - dw) / 2;
          dy = 0;
        } else {
          dw = cw;
          dh = cw / imageRatio;
          dx = 0;
          dy = (ch - dh) / 2;
        }

        context.clearRect(0, 0, cw, ch);
        context.drawImage(image, dx, dy, dw, dh);
      };

      const renderFrame = (index: number): void => {
        const image = imagesRef.current[index];
        if (image && image.complete && image.naturalWidth > 0) {
          drawCover(image, index);
        }
      };

      const resizeCanvas = (): void => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(window.innerWidth * dpr);
        canvas.height = Math.round(window.innerHeight * dpr);
        renderFrame(currentFrameRef.current);
      };

      // Preload image sequence
      const images: HTMLImageElement[] = [];
      for (let i = 0; i < FRAME_COUNT; i += 1) {
        const image = new Image();
        image.src = getFrameSrc(i);
        if (i === 0) {
          image.onload = () => renderFrame(0);
        }
        images.push(image);
      }
      imagesRef.current = images;

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      // Scroll scrubbing for the 208 frames
      const frameState = { frame: 0 };
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
        },
        onUpdate: () => {
          const frame = Math.round(frameState.frame);
          if (frame !== currentFrameRef.current) {
            currentFrameRef.current = frame;
            renderFrame(frame);
          }
        },
      });
      tl.to(frameState, {
        frame: FRAME_COUNT - 1,
        ease: 'none'
      });
      tl.to(divRef.current, {
        opacity: 1,
        duration: 0.1
      })
      tl.to(canvasRef.current, {
        opacity: 0,
        duration: 0.5
      })
      tl.to(".header", {
        transform: "translateY(0)",
        duration: 0.5
      }, ">")
        .to(headingRef.current, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.5
        }, ">")
        .to(descRef.current, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.5
        }, ">")

      return () => window.removeEventListener('resize', resizeCanvas);
    },
    { scope: containerRef }
  );

  useEffect(() => {
    if (isReady) {
      const tl = gsap.timeline();
      tl.to(
        '.hero-logo',
        {
          yPercent: -15,
          width: '1864px',
          height: '777px',
          duration: 1
        }
      )
        .to(canvasRef.current, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.5
        })
    }
  }, [isReady])

  return (
    <section ref={containerRef} className="relative h-[400vh] w-[100vw] z-70">
      <div className="sticky top-0 h-screen w-full overflow-hidden">

        <canvas
          ref={canvasRef}
          className="block relative h-full w-full object-cover opacity-100"
          style={{
            width: '100%',
            clipPath: "inset(100% 0% 0% 0%)"
          }}
        />
        <div ref={divRef} className='absolute inset-0 bg-[#EEE8D9] opacity-0 flex flex-col justify-between items-center px-25 py-[72px] overflow-hidden'>
          <Header />
          <div className='w-full flex flex-col justify-center items-start relative'>
            <h2 ref={headingRef} className='text-[#1A1917] uppercase text-[240.774px] font-tommy-bold flex flex-col justify-center items-start gap-2 leading-[211.881px]'
              style={{
                clipPath: "inset(0% 100% 0% 0%)"
              }}>
              We
              <span className='text-[#B1AA98]'>Make Them</span>
              <span className='text-primary'>Look Up</span>
            </h2>
            <div ref={descRef} className='absolute right-0 bottom-0 max-w-[600px] flex flex-col justify-center items-start gap-[28px]'
              style={{
                clipPath: "inset(0% 100% 0% 0%)"
              }}>
              <h3 className='font-tommy-medium font-medium text-[#1A1917] text-[42px] leading-[50px]'>
                25 Years of Moving Brands. Offline Targeting, Redefined.
              </h3>
              <button className='bg-[#FCD119] text-[24px] leading-[25px] font-tommy-regular text-[#1A1917] rounded-[6px] px-[54px] py-[20px]'>
                Start a Campaign
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}