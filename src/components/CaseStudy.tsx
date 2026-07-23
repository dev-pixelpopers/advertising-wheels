'use client';

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
        <div className="case-study w-full px-[60px] h-screen flex flex-row items-center overflow-hidden">
            <div className="w-[40%] shrink-0 flex justify-start">
                <div className="cs-left flex flex-col gap-10 justify-center items-start">
                    <div className="flex flex-row gap-10 w-fit justify-start">
                        <div className="border border-t-black dark:border-t-white h-[2px] w-[126px] my-auto transition-colors duration-300"></div>
                        <div className="overflow-hidden max-w-[60%]">
                            <h2 className="font-tommy-medium text-[66px] capitalize text-black dark:text-white leading-[100%] transition-colors duration-300">explore our case study</h2>
                        </div>
                    </div>
                    <p className="font-tommy-regular text-[21px] leading-[30px] text-black dark:text-gray-300 max-w-[80%] capitalize transition-colors duration-300">Our client, a growing consumer brand, wanted to increase brand awareness and reach a wider audience in key urban markets.</p>
                </div>
            </div>

            {/* Right column — the pass-through card carousel. */}
            <div className="cs-carousel flex-1 relative h-[85vh] overflow-hidden">
                {caseStudies.map((cs, index) => (
                    <div key={index} className="cs-card absolute inset-0 flex flex-col items-end justify-center">
                        <div className="w-[600px] rounded-[8px] border border-[#F0F0F0] dark:border-[#2D2D2D] bg-[#FFF] dark:bg-[#181818] py-[10px] px-[10px] flex flex-col gap-8 transition-colors duration-300 shadow-sm dark:shadow-black/40">
                            <div className="flex flex-row justify-between pt-[30px] pl-[15px]">
                                <h2 className="text-[42px] font-tommy-medium leading-[45px] uppercase text-black dark:text-white transition-colors duration-300">{cs.title}</h2>
                                <a className="group mt-[-10%] shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="119" height="119" viewBox="0 0 119 119" fill="none" className="rotate-[90deg]">
                                        <circle cx="59.5" cy="59.5" r="59.5" className="fill-black dark:fill-white transition-colors duration-300" />
                                        <path d="M43.4436 42.4436C42.8913 42.4436 42.4436 42.8913 42.4436 43.4436L42.4436 52.4436C42.4436 52.9959 42.8913 53.4436 43.4436 53.4436C43.9959 53.4436 44.4436 52.9959 44.4436 52.4436L44.4436 44.4436L52.4436 44.4436C52.9959 44.4436 53.4436 43.9959 53.4436 43.4436C53.4436 42.8913 52.9959 42.4436 52.4436 42.4436L43.4436 42.4436ZM75.5547 75.5547L76.2618 74.8476L44.1507 42.7365L43.4436 43.4436L42.7365 44.1507L74.8476 76.2618L75.5547 75.5547Z" fill="#FCD119"
                                            className="transition-all duration-300 ease-out [transform-box:fill-box] origin-center group-hover:scale-300" />
                                    </svg>
                                </a>
                            </div>
                            <img className="w-full h-[360px] object-cover rounded-[10px]" src="/assets/images/case-study-img.jpg" alt="" />
                        </div>

                        {/* Counter panel — appears once the card stops at centre. */}
                        <div className="cs-stats relative w-[550px] rounded-[8px] border border-[#F0F0F0] dark:border-[#2D2D2D] bg-[#FFF] dark:bg-[#181818] py-[5px] flex flex-row gap-[10px] -mt-[60px] px-[5px] mr-[2%] transition-colors duration-300 shadow-sm dark:shadow-black/40">
                            <div className="bg-[#202020] dark:bg-[#101010] border border-[#F0F0F0] dark:border-[#2D2D2D] rounded-[8px] py-[10px] text-center min-w-[150px] transition-colors duration-300">
                                <ul className="cs-values flex flex-col text-[#EEE8D9] font-tommy-medium text-[40px] leading-[30px] capitalize gap-y-6 px-[12px] py-[10px]">
                                    {cs.stats.map((s, i) => (
                                        <li key={i} data-value={s.value}>{s.value}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <ul className="cs-labels flex flex-col gap-y-6 py-[20px] text-[#000] dark:text-white text-[21px] leading-[30px] font-tommy-regular capitalize px-[5px] transition-colors duration-300">
                                    {cs.stats.map((s, i) => (
                                        <li key={i}>{s.label}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
