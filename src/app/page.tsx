"use client";
import { useState, useEffect } from 'react';
import Preloader from '@/components/Preloader';
import Hero from '@/components/Hero';
import AdvertisingLeader from '@/components/AdvertisingLeader';
import SecondSection from '@/components/SecondSection';
import TruckExperience from '@/components/TruckExperience';
import MarketsCoverageV2 from '@/components/MarketsCoverageV2';
import WhyChooseUs from '@/components/WhyChooseUs';
import CtaSection from '@/components/CtaSection';

export default function Home() {
  const [isPreloaderDone, setIsPreloaderDone] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className='w-full bg-[#EEE8D9] dark:bg-[#0A0A0A] transition-colors duration-300 relative'>
      {!isPreloaderDone && <Preloader onComplete={() => setIsPreloaderDone(true)} />}

      <Hero isReady={isPreloaderDone} />

      {/* Rides up over the Hero's final 100vh — the negative margin is what
          lets the Hero hold its finished frame while this section arrives. */}
      <div className='relative z-[80] w-full bg-[#EEE8D9] dark:bg-[#0A0A0A] transition-colors duration-300 pt-[100px] second-home-section -mt-[100vh]'>
        <div className='max-w-none w-full mx-auto'>
          <SecondSection />
        </div>
        <AdvertisingLeader />
        <TruckExperience />
        <MarketsCoverageV2 />
        <WhyChooseUs />
        <CtaSection />
      </div>
    </div>
  );
}
