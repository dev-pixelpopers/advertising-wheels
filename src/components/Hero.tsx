'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const FRAME_COUNT = 18;

/** Images are `image-1.png` .. `image-18.png` under /public. */
const getFrameSrc = (index: number): string =>
  `/assets/images/hero/image-${index + 1}.png`;

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);

  useGSAP(
    () => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      if (!canvas || !context) return;

      // Draw an image so it fully covers the canvas (object-fit: cover).
      const drawCover = (image: HTMLImageElement): void => {
        const cw = canvas.width;
        const ch = canvas.height;
        const imageRatio = image.naturalWidth / image.naturalHeight;
        const canvasRatio = cw / ch;

        let dw: number;
        let dh: number;
        let dx: number;
        let dy: number;

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
          drawCover(image);
        }
      };

      const resizeCanvas = (): void => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(window.innerWidth * dpr);
        canvas.height = Math.round(window.innerHeight * dpr);
        renderFrame(currentFrameRef.current);
      };

      // Preload the full sequence; paint frame 0 as soon as it's ready.
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

      // Scrub the frame index across the tall parent's scroll progress (no pin).
      const frameState = { frame: 0 };
      gsap.to(frameState, {
        frame: FRAME_COUNT - 1,
        ease: 'none',
        snap: { frame: 1 },
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
        },
        onUpdate: () => {
          const frame = Math.round(frameState.frame);
          currentFrameRef.current = frame;
          renderFrame(frame);
        },
      });

      // Reveal the headline as the sequence lands on its final frame.
      gsap.fromTo(
        textRef.current,
        { autoAlpha: 0, x: -60 },
        {
          autoAlpha: 1,
          x: 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: '85% bottom',
            end: 'bottom bottom',
            scrub: true,
          },
        },
      );

      return () => window.removeEventListener('resize', resizeCanvas);
    },
    { scope: containerRef },
  );

  return (
    <section ref={containerRef} className="relative h-[300vh] w-[100vw]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} className="block h-full w-full" style={{
          width: "100%"
        }} />

        <div className="pointer-events-none absolute left-6 top-1/2 max-w-[85%] -translate-y-1/2 md:left-16 md:max-w-[50%]">
          <h2
            ref={textRef}
            className="font-tommy-bold text-4xl uppercase leading-[0.95] text-white opacity-0 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:text-5xl md:text-7xl lg:text-8xl"
          >
            We make them look up
          </h2>
        </div>
      </div>
    </section>
  );
}
