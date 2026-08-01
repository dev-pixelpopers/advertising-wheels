"use client";
import { useState } from 'react';
import Preloader from '@/components/Preloader';
import Hero from '@/components/Hero';
import CaseStudySection from '@/components/CaseStudySection';
import Campaigns from '@/components/Campaigns';
import Process from '@/components/Process';
import AdvertisingLeader from '@/components/AdvertisingLeader';
import SecondSection from '@/components/SecondSection';
import TruckExperience from '@/components/TruckExperience';
import CinematicStory from '@/components/CinematicStory';
import MarketsCoverage from '@/components/MarketsCoverage';
import WhyChooseUs from '@/components/WhyChooseUs';
import CtaSection from '@/components/CtaSection';
import Footer from '@/components/Footer';

export default function Home() {
  const [isPreloaderDone, setIsPreloaderDone] = useState(false);
  return (
    <div className='w-full bg-[#EEE8D9] dark:bg-[#0A0A0A] transition-colors duration-300 relative'>

      {/* <div className='flex flex-col justify-center items-center w-full'> */}

      {
        !isPreloaderDone && (
          <Preloader onComplete={() => setIsPreloaderDone(true)} />
        )
      }
      <Hero isReady={isPreloaderDone} />
      {/* </div > */}
      <div className='relative z-[80] w-full bg-[#EEE8D9] dark:bg-[#0A0A0A] transition-colors duration-300 pt-[100px] second-home-section -mt-[100vh]'>
        <div className='max-w-none lg:max-w-[95%] px-[16px] md:px-[25px] lg:px-[40px] xl:px-[50px] 2xl:px-[60px] w-full mx-auto'>
          {/* <Campaigns /> */}
          <SecondSection />
          {/* <Process /> */}
        </div>
        <AdvertisingLeader />
        <TruckExperience />
        <MarketsCoverage />
        <CaseStudySection />
        <WhyChooseUs />
        <CtaSection />
        {/* <Process /> */}
        {/* <CinematicStory /> */}

      </div>

    </div >
  );
}
