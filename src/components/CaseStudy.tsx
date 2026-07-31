'use client';

// Where the closing "explore all case studies" beat sends the user. '#' matches the
// placeholder links in Header/CtaSection — swap it once the index route exists.
const CASE_STUDIES_URL = '#';

// Replicated case-study cards (the original "Fifth Third Bank" card + counters).
const caseStudies = [
    {
        title: 'Fifth Third Bank',
        stats: [
            { value: '+96%', label: 'branded checking search clicks' },
            { value: '8%', label: 'lift in household production' },
            { value: '6,802', label: 'incremental checking households,' },
            { value: '<12', label: 'month better-than-break-even ROMI' },
        ],
    },
    {
        title: 'Fifth Third Bank',
        stats: [
            { value: '+96%', label: 'branded checking search clicks' },
            { value: '8%', label: 'lift in household production' },
            { value: '6,802', label: 'incremental checking households,' },
            { value: '<12', label: 'month better-than-break-even ROMI' },
        ],
    },
    {
        title: 'Fifth Third Bank',
        stats: [
            { value: '+96%', label: 'branded checking search clicks' },
            { value: '8%', label: 'lift in household production' },
            { value: '6,802', label: 'incremental checking households,' },
            { value: '<12', label: 'month better-than-break-even ROMI' },
        ],
    },
    {
        title: 'Fifth Third Bank',
        stats: [
            { value: '+96%', label: 'branded checking search clicks' },
            { value: '8%', label: 'lift in household production' },
            { value: '6,802', label: 'incremental checking households,' },
            { value: '<12', label: 'month better-than-break-even ROMI' },
        ],
    },
];

// Animations are orchestrated by the parent SecondSection via the class hooks below.
export default function CaseStudy() {
    return (
        <div className="case-study relative w-full 2xl:px-[40px] 3xl:px-[60px] pt-[60px] md:pt-[120px] lg:pt-0 h-screen flex flex-col lg:flex-row lg:items-center overflow-hidden">
            <div className="w-full lg:w-[40%] shrink-0 flex justify-start">
                <div className="cs-left flex flex-col gap-4 md:gap-6 lg:gap-8 xl:gap-10 justify-center items-start">
                    <div className="flex flex-row gap-4 xl:gap-6 2xl:gap-[8] 3xl:gap-10 w-fit justify-start">
                        <div className="border border-t-black dark:border-t-white h-[2px] w-[80px] xl:w-[126px] my-auto transition-colors duration-300"></div>
                        <div className="overflow-hidden lg:max-w-[80%] xl:max-w-[60%]">
                            <h2 className="font-tommy-medium text-[30px] md:text-[clamp(2.5rem,3.5vw,4.125rem)] capitalize text-black dark:text-white leading-[100%] transition-colors duration-300">explore our case study</h2>
                        </div>
                    </div>
                    <p className="font-tommy-regular text-[14px] sm:text-[16px] md:text-[clamp(1rem,1.5vw,1.3125rem)] leading-[143%] text-black dark:text-gray-300 lg:max-w-[90%] xl:max-w-[80%] capitalize transition-colors duration-300">Our client, a growing consumer brand, wanted to increase brand awareness and reach a wider audience in key urban markets.</p>
                </div>
            </div>

            {/* Right column — the pass-through card carousel. */}
            <div className="cs-carousel flex-1 relative md:mt-[40px] lg:mt-0 lg:h-[85vh] overflow-hidden">
                {caseStudies.map((cs, index) => (
                    <div key={index} className="cs-card absolute inset-0 flex flex-col items-end justify-center top-0 lg:pt-[10%]">
                        <div className="w-[89vw] sm:w-[85vw] md:w-[65%] lg:w-[480px] xl:w-[530px] 2xl:w-[550px] 3xl:w-[600px] rounded-[8px] border border-[#F0F0F0] dark:border-[#2D2D2D] bg-[#FFF] dark:bg-[#181818] py-[10px] px-[10px] flex flex-col gap-2 md:gap-4 xl:gap-6 2xl:gap-8 transition-colors duration-300 shadow-sm dark:shadow-black/40 mx-auto lg:mx-0">
                            <div className="flex flex-row justify-between pt-[10px] md:pt-[12px] lg:pt-[16px] xl:pt-[22px] 2xl:pt-[30px] pl-[15px]">
                                <div className="overflow-hidden">
                                    <h2 className="cs-title text-[18px] sm:text-[clamp(1.75rem,2.5vw,2.625rem)] font-tommy-medium leading-[107.14%] uppercase text-black dark:text-white transition-colors duration-300">{cs.title}</h2>
                                </div>
                                <a className="group mt-[-10%] shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-[60px] md:w-[70px] lg:w-[90px] xl:w-[119px] h-[60px] md:h-[70px] lg:h-[90px] xl:h-[119px] rotate-[90deg]" width="119" height="119" viewBox="0 0 119 119" fill="none">
                                        <circle cx="59.5" cy="59.5" r="59.5" className="fill-black dark:fill-white transition-colors duration-300" />
                                        <path d="M43.4436 42.4436C42.8913 42.4436 42.4436 42.8913 42.4436 43.4436L42.4436 52.4436C42.4436 52.9959 42.8913 53.4436 43.4436 53.4436C43.9959 53.4436 44.4436 52.9959 44.4436 52.4436L44.4436 44.4436L52.4436 44.4436C52.9959 44.4436 53.4436 43.9959 53.4436 43.4436C53.4436 42.8913 52.9959 42.4436 52.4436 42.4436L43.4436 42.4436ZM75.5547 75.5547L76.2618 74.8476L44.1507 42.7365L43.4436 43.4436L42.7365 44.1507L74.8476 76.2618L75.5547 75.5547Z" fill="#FCD119"
                                            className="transition-all duration-300 ease-out [transform-box:fill-box] origin-center group-hover:scale-300" />
                                    </svg>
                                </a>
                            </div>
                            {/* Wrapper contains the media's over-scale while it wipes open. */}
                            <div className="overflow-hidden rounded-[10px]">
                                <img className="cs-media w-full h-[240px] md:h-[280px] lg:h-[360px] object-cover" src="/assets/images/case-study-img.jpg" alt="" />
                            </div>
                        </div>

                        {/* Counter panel — appears once the card stops at centre. */}
                        <div className="cs-stats relative w-[80vw] md:w-[430px] lg:w-[450px] xl:w-[500px] 2xl:w-[515px] 3xl:w-[550px] rounded-[8px] border border-[#F0F0F0] dark:border-[#2D2D2D] bg-[#FFF] dark:bg-[#181818] py-[5px] flex flex-row gap-[6px] md:gap-[10px] -mt-[60px] px-[2px] md:px-[4px] lg:px-[5px] ml-auto lg:ml-0 mr-auto lg:mr-[4%] xl:mr-[2%] transition-colors duration-300 shadow-sm dark:shadow-black/40">
                            <div className="bg-[#202020] dark:bg-[#101010] border border-[#F0F0F0] dark:border-[#2D2D2D] rounded-[8px] py-[6px] sm:py-[10px] text-center w-[30%] transition-colors duration-300">
                                <ul className="cs-values flex flex-col text-[#EEE8D9] font-tommy-medium text-[20px] sm:text-[25px] md:text-[clamp(1.75rem,2.5vw,2.5rem)] leading-[110%] md:leading-[75%] capitalize gap-y-2 sm:gap-y-4 md:gap-y-6  md:px-[12px] py-[10px]">
                                    {cs.stats.map((s, i) => (
                                        <li key={i} data-value={s.value}>{s.value}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="w-[70%]">
                                <ul className="cs-labels flex flex-col gap-y-5 sm:gap-y-4 md:gap-y-6 py-[12px] sm:py-[16px] md:py-[20px] text-[#000] dark:text-white text-[10px] sm:text-[14px] md:text-[clamp(1rem,1.3vw,1.3125rem)] leading-[143%] font-tommy-regular capitalize md:px-[5px] transition-colors duration-300">
                                    {cs.stats.map((s, i) => (
                                        <li key={i}>{s.label}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Closing beat — once the last card clears, the story points at the rest of
                the work. Revealed by SecondSection via the .cs-outro / .cs-outro-item hooks. */}
            <div className="cs-outro absolute inset-0 z-20 flex flex-col items-center justify-center text-center sm:px-[20px] md:px-[60px]">
                <span className="cs-outro-item font-tommy-medium text-[12px] md:text-[14px] lg:text-[16px] tracking-[0.28em] uppercase text-[#8A857C] dark:text-[#9A968E] transition-colors duration-300">
                    More work
                </span>
                <h2 className="cs-outro-item mt-[13px] md:mt-[15px] lg:mt-[18px] font-tommy-medium text-[20px] sm:text-[clamp(38px,4.4vw,72px)] leading-[1.05] capitalize text-black dark:text-white max-w-[900px] text-balance transition-colors duration-300">
                    See how other brands own the street<span className="text-[#FCD119]">.</span>
                </h2>
                <p className="cs-outro-item mt-[14px] md:mt-[16px] lg:mt-[22px] font-tommy-regular text-[14px] sm:text-[clamp(1rem,1.5vw,1.3125rem)] leading-[30px] capitalize text-black dark:text-gray-300 max-w-[620px] transition-colors duration-300">
                    More campaigns, measured the same way — routes, impressions, and the results they moved.
                </p>
                <a
                    href={CASE_STUDIES_URL}
                    className="cs-outro-item group mt-[16px] md:mt-[24px] lg:mt-[32px] xl:mt-[44px] flex items-center gap-3 rounded-full bg-black dark:bg-[#FCD119] px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 font-tommy-medium text-[13px] md:text-[15px] text-[#FCD119] dark:text-black transition-transform duration-300 hover:scale-[1.04]"
                >
                    Explore All Case Studies
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
                        <path d="M1 8 H14 M9 3 L14 8 L9 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </a>
            </div>
        </div>
    );
}
