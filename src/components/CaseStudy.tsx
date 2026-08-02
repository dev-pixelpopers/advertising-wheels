'use client';

// Where the closing "explore all case studies" beat sends the user. '#' matches the
// placeholder links in Header/CtaSection — swap it once the index route exists.
const CASE_STUDIES_URL = '#';

// Replicated case-study cards (the original "Fifth Third Bank" card + counters).
const caseStudies = [
    {
        title: 'Fifth Third Bank',
        sector: 'Financial Services',
        stats: [
            { value: '+96%', label: 'branded checking search clicks' },
            { value: '8%', label: 'lift in household production' },
            { value: '6,802', label: 'incremental checking households' },
            { value: '<12', label: 'month better-than-break-even ROMI' },
        ],
    },
    {
        title: 'Fifth Third Bank',
        sector: 'Financial Services',
        stats: [
            { value: '+96%', label: 'branded checking search clicks' },
            { value: '8%', label: 'lift in household production' },
            { value: '6,802', label: 'incremental checking households' },
            { value: '<12', label: 'month better-than-break-even ROMI' },
        ],
    },
    {
        title: 'Fifth Third Bank',
        sector: 'Financial Services',
        stats: [
            { value: '+96%', label: 'branded checking search clicks' },
            { value: '8%', label: 'lift in household production' },
            { value: '6,802', label: 'incremental checking households' },
            { value: '<12', label: 'month better-than-break-even ROMI' },
        ],
    },
    {
        title: 'Fifth Third Bank',
        sector: 'Financial Services',
        stats: [
            { value: '+96%', label: 'branded checking search clicks' },
            { value: '8%', label: 'lift in household production' },
            { value: '6,802', label: 'incremental checking households' },
            { value: '<12', label: 'month better-than-break-even ROMI' },
        ],
    },
];

/**
 * One shared row height for BOTH stat columns. The figures and the labels live in
 * two separate lists (the counter animation pairs them by index), so the only way
 * a label reliably sits on its own number is if every row in both lists is the
 * same fixed height and vertically centred. Gap-based spacing drifts as soon as
 * the two columns have different type sizes.
 */
const STAT_ROW = 'flex items-center h-[34px] sm:h-[42px] md:h-[50px] xl:h-[55px]';

// Animations are orchestrated by the parent SecondSection via the class hooks below.
export default function CaseStudy() {
    return (
        /* The pair is capped and centred, so on a wide screen the copy and the
           card stay a deliberate distance apart instead of being flung to
           opposite edges of the viewport. */
        <div className="case-study relative mx-auto w-full max-w-[1500px] 2xl:px-[40px] 3xl:px-[60px] pt-[60px] md:pt-[120px] lg:pt-0 h-screen flex flex-col lg:flex-row lg:items-center lg:gap-[4%] overflow-hidden">
            <div className="w-full lg:w-[38%] shrink-0 flex justify-start">
                <div className="cs-left flex flex-col justify-center items-start">
                    {/* Eyebrow — the rule now leads the label rather than the
                        headline, so the headline can start hard against the margin
                        instead of being indented by a 126px dash. */}
                    <div className="flex items-center gap-4">
                        <span className="h-px w-[44px] bg-black/30 transition-colors duration-300 xl:w-[64px] dark:bg-white/30" />
                        <span className="font-tommy-regular text-[10.5px] uppercase tracking-[0.3em] text-[#8A857C] transition-colors duration-300 md:text-[12px] dark:text-[#9A968E]">
                            Case Studies
                        </span>
                    </div>

                    {/* Headline — bold and tightly tracked at display size. The line
                        break is explicit so it always breaks after "our" rather than
                        leaving a single orphaned word. */}
                    <h2 className="mt-5 font-tommy-bold text-[clamp(2rem,4vw,4.25rem)] leading-[0.96] tracking-[-0.025em] text-[#1A1917] transition-colors duration-300 md:mt-7 dark:text-white">
                        Explore our
                        <br />
                        case study<span className="text-[#C8992B] dark:text-[#FCD119]">.</span>
                    </h2>

                    {/* Body copy in sentence case. It was `capitalize`, which
                        title-cases every word ("Our Client, A Growing Consumer
                        Brand…") — that is what made the block read as unstyled.
                        Measure is capped in ch so the line length stays readable. */}
                    <p className="mt-5 max-w-[44ch] font-tommy-regular text-[15px] leading-[1.72] text-[#5A554C] transition-colors duration-300 md:mt-7 md:text-[17px] dark:text-[#A8A399]">
                        Our client, a growing consumer brand, wanted to increase brand awareness and
                        reach a wider audience in key urban markets.
                    </p>
                </div>
            </div>

            {/* Right column — the pass-through card carousel. */}
            <div className="cs-carousel flex-1 relative md:mt-[40px] lg:mt-0 lg:h-[85vh] overflow-hidden">
                {caseStudies.map((cs, index) => (
                    <div key={index} className="cs-card absolute inset-0 flex flex-col items-center lg:items-end justify-center top-0 lg:pt-[10%]">
                        {/* Card and stats panel share ONE width wrapper. Previously they
                            were independent siblings, so the panel's own margins were
                            measured against the carousel column rather than the card —
                            which is why `ml-[3%]` under `items-end` pushed it out past
                            the card's right edge instead of insetting it. */}
                        <div className="relative w-[89vw] sm:w-[85vw] md:w-[65%] lg:w-[480px] xl:w-[530px] 2xl:w-[550px] 3xl:w-[600px] mx-auto lg:mx-0">
                            <div className="w-full rounded-[8px] border border-[#F0F0F0] dark:border-[#2D2D2D] bg-[#FFF] dark:bg-[#181818] py-[10px] px-[10px] flex flex-col gap-2 md:gap-4 xl:gap-6 2xl:gap-8 transition-colors duration-300 shadow-sm dark:shadow-black/40">
                                <div className="flex flex-row justify-between pt-[10px] md:pt-[12px] lg:pt-[16px] xl:pt-[22px] 2xl:pt-[30px] pl-[15px]">
                                    <div>
                                        {/* Sector line sets the client up before the name
                                            lands, so the card opens with context rather
                                            than a bare uppercase wordmark. */}
                                        <span className="block font-tommy-regular text-[9.5px] uppercase tracking-[0.26em] text-[#8A857C] transition-colors duration-300 md:text-[10.5px] dark:text-[#9A968E]">
                                            {cs.sector}
                                        </span>
                                        <div className="mt-2 overflow-hidden md:mt-3">
                                            <h2 className="cs-title text-[18px] sm:text-[clamp(1.75rem,2.5vw,2.625rem)] font-tommy-bold leading-[1.02] tracking-[-0.02em] uppercase text-black dark:text-white transition-colors duration-300">{cs.title}</h2>
                                        </div>
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
                            <div className="cs-stats relative z-[2] w-[92%] mx-auto rounded-[8px] border border-[#F0F0F0] dark:border-[#2D2D2D] bg-[#FFF] dark:bg-[#181818] flex flex-row gap-[10px] md:gap-[16px] xl:gap-[20px] -mt-[60px] p-[6px] md:p-[8px] transition-colors duration-300 shadow-sm dark:shadow-black/40">
                                {/* Figures panel. NO border here on purpose — a 1px edge
                                    would push the values down relative to the labels and
                                    break the row-to-row alignment below. */}
                                <div className="w-[30%] shrink-0 rounded-[8px] bg-[#202020] dark:bg-[#101010] px-[8px] md:px-[14px] transition-colors duration-300">
                                    {/* Tabular so the counters don't jitter as they tick up,
                                        tightly tracked so they read as data, right-aligned so
                                        the figures form a clean edge against the labels. */}
                                    <ul className="cs-values flex flex-col py-[8px] md:py-[10px] text-[#EEE8D9] font-tommy-bold tabular-nums tracking-[-0.02em] text-[20px] sm:text-[26px] md:text-[clamp(1.75rem,2.4vw,2.375rem)] leading-none">
                                        {cs.stats.map((s, i) => (
                                            <li key={i} data-value={s.value} className={STAT_ROW + ' justify-end'}>{s.value}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="min-w-0 flex-1">
                                    {/* Labels sit on the same fixed row height as the figures,
                                        which is what keeps each label locked to its number
                                        regardless of type size or wrapping. */}
                                    <ul className="cs-labels flex flex-col py-[8px] md:py-[10px] text-[#1A1917] dark:text-[#E8E4DA] text-[10px] sm:text-[12px] md:text-[clamp(0.8rem,1.02vw,1rem)] leading-[1.25] capitalize font-tommy-medium transition-colors duration-300">
                                        {cs.stats.map((s, i) => (
                                            <li key={i} className={STAT_ROW}>{s.label}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Closing beat — once the last card clears, the story points at the rest of
                the work. Revealed by SecondSection via the .cs-outro / .cs-outro-item hooks. */}
            <div className="cs-outro absolute inset-0 z-20 flex flex-col items-center justify-center text-center sm:px-[20px] md:px-[60px]">
                <span className="cs-outro-item font-tommy-regular text-[10.5px] md:text-[12px] tracking-[0.3em] uppercase text-[#8A857C] dark:text-[#9A968E] transition-colors duration-300">
                    More work
                </span>
                {/* Matches the section opener: bold, tight tracking, sentence case —
                    `capitalize` here was title-casing the whole line. */}
                <h2 className="cs-outro-item mt-4 md:mt-5 font-tommy-bold text-[24px] sm:text-[clamp(38px,4.4vw,72px)] leading-[0.98] tracking-[-0.025em] text-[#1A1917] dark:text-white max-w-[16ch] text-balance transition-colors duration-300">
                    See how other brands own the street<span className="text-[#C8992B] dark:text-[#FCD119]">.</span>
                </h2>
                <p className="cs-outro-item mt-5 md:mt-6 font-tommy-regular text-[15px] md:text-[17px] leading-[1.72] text-[#5A554C] dark:text-[#A8A399] max-w-[56ch] transition-colors duration-300">
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
