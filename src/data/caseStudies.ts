/**
 * Case-study source of truth.
 *
 * The Projects grid, the home-page CaseStudy carousel and the
 * `/projects/[slug]` detail route all read from this one list, so a study only
 * has to be written once and every card automatically links somewhere real.
 *
 * `sections` drives BOTH the article body and the sticky table of contents on
 * the detail page — the TOC is derived from these ids rather than hand-listed,
 * which is what keeps the two from drifting apart.
 */

export interface CaseStat {
    /** Numeric target the counter animates to. */
    value: number;
    prefix?: string;
    suffix?: string;
    /** Render a thousands separator (6,802). */
    comma?: boolean;
    label: string;
}

export interface CaseSection {
    /** Anchor id — also the TOC target. Must be unique within a study. */
    id: string;
    /** TOC label (short). */
    nav: string;
    heading: string;
    body: string[];
}

export interface CaseStudy {
    slug: string;
    brand: string;
    industry: string;
    /** One-line promise used on cards. */
    summary: string;
    /** Long-form opener on the detail page. */
    lead: string;
    year: string;
    /** Markets the fleet covered. */
    markets: string;
    duration: string;
    hero: string;
    logo?: string;
    stats: CaseStat[];
    sections: CaseSection[];
    quote: { text: string; author: string; role: string };
    gallery: string[];
    /** Short tags shown under the hero. */
    services: string[];
}

const LOGOS = '/assets/images/review/logo';

export const CASE_STUDIES: CaseStudy[] = [
    {
        slug: 'fifth-third-bank',
        brand: 'Fifth Third Bank',
        industry: 'Financial Services',
        summary:
            'A checking-account drive that turned highway miles into measurable branch traffic.',
        lead:
            'Fifth Third needed net-new checking households in markets where every competitor was already buying the same digital inventory. We moved the media out of the auction and onto the road — then measured it like a performance channel.',
        year: '2025',
        markets: '9 metros',
        duration: '11 months',
        hero: '/assets/images/case-study-img.jpg',
        stats: [
            { value: 96, prefix: '+', suffix: '%', label: 'Branded checking search clicks' },
            { value: 8, suffix: '%', label: 'Lift in household production' },
            { value: 6802, comma: true, label: 'Incremental checking households' },
            { value: 12, prefix: '<', label: 'Month better-than-break-even ROMI' },
        ],
        services: ['Route strategy', 'Wrap creative', 'GPS verification', 'Search lift study'],
        sections: [
            {
                id: 'challenge',
                nav: 'The challenge',
                heading: 'Everyone was bidding on the same 400 keywords',
                body: [
                    'Fifth Third’s acquisition cost for a new checking household had been climbing for six straight quarters. The reason was not creative and it was not offer — it was inventory. Every regional bank in the footprint was bidding against the same finite pool of high-intent search terms, and the auction only goes one direction.',
                    'The brief was blunt: find reach that competitors cannot bid against, in the specific ZIP codes where branch density made a new account profitable, and prove it moved something other than a brand-tracker score.',
                ],
            },
            {
                id: 'approach',
                nav: 'The approach',
                heading: 'We planned it like a digital buy, then drove it',
                body: [
                    'We started from the branch list, not the map. Each location contributed a catchment of target ZIPs, weighted by existing household penetration — so the fleet spent its hours where an incremental account was most likely and most valuable, rather than simply where traffic was heaviest.',
                    'Routes were then built around daypart behaviour: commuter corridors at morning and evening peak, retail and grocery clusters midday on weekends, and dwell time deliberately concentrated at intersections with long signal cycles. A truck stopped at a red light for ninety seconds is a very different media unit than one at speed.',
                    'Creative was art-directed for glance value at distance — one message per side, a single proof point, and the branch offer legible from three car lengths back.',
                ],
            },
            {
                id: 'measurement',
                nav: 'Measurement',
                heading: 'Every mile logged, matched and attributed',
                body: [
                    'Each vehicle streamed GPS at fifteen-second intervals, which gave us a verified impression count rather than a modelled one — audited by a third party and reconciled against the plan weekly.',
                    'To connect exposure to outcome, exposed ZIPs were matched against demographically similar control ZIPs with no fleet presence. Branded search volume, site sessions and — critically — actual account openings were compared across the two groups for the length of the campaign.',
                    'That control design is what let us report a real incremental number instead of a correlation. The lift held after controlling for concurrent digital spend and seasonal patterns.',
                ],
            },
            {
                id: 'results',
                nav: 'Results',
                heading: 'Break-even inside a year, and still compounding',
                body: [
                    'Branded checking search clicks nearly doubled in exposed markets against control. Household production lifted eight percent, delivering 6,802 incremental checking households over the campaign.',
                    'Because a checking household carries a multi-year value, the campaign passed better-than-break-even ROMI in under twelve months and continued returning after the fleet stood down. The programme has since expanded into three additional metros.',
                ],
            },
        ],
        quote: {
            text:
                'We stopped thinking about this as outdoor. It reported like a performance channel, it was measured like a performance channel, and it hit a cost per household our search team could not match.',
            author: 'Marketing Director',
            role: 'Fifth Third Bank',
        },
        gallery: [
            '/assets/images/case-study-img.jpg',
            '/assets/images/process/city.png',
            '/assets/images/process/stats.png',
        ],
    },
    {
        slug: 'hertz',
        brand: 'Hertz',
        industry: 'Travel & Mobility',
        summary:
            'Truckside ran as the primary top-of-funnel tactic and reversed a five-year eCommerce decline.',
        lead:
            'Five consecutive years of eCommerce revenue decline had been met with five consecutive years of lower-funnel optimisation. The channel mix had no top of funnel left. We rebuilt one on the road.',
        year: '2024',
        markets: '14 metros',
        duration: '8 months',
        hero: '/assets/images/process/city.png',
        logo: `${LOGOS}/partner-hertz.png`,
        stats: [
            { value: 5, suffix: 'yr', label: 'Revenue decline reversed' },
            { value: 31, prefix: '+', suffix: '%', label: 'Direct session growth' },
            { value: 14, label: 'Metros activated' },
            { value: 210, comma: true, suffix: 'M', label: 'Verified impressions' },
        ],
        services: ['Airport corridor routing', 'Fleet wrap production', 'Brand lift study'],
        sections: [
            {
                id: 'challenge',
                nav: 'The challenge',
                heading: 'A funnel with no top left',
                body: [
                    'Years of efficiency pressure had squeezed Hertz’s media plan into pure capture — branded search, retargeting, affiliate. Every dollar was chasing demand that already existed, and the pool of that demand had been shrinking annually.',
                    'Rebuilding awareness through traditional video was priced out of reach for the markets that mattered most. What was needed was presence at scale, in specific corridors, at a cost that could survive a CFO review.',
                ],
            },
            {
                id: 'approach',
                nav: 'The approach',
                heading: 'Own the road to the airport',
                body: [
                    'The insight was geographic. Rental intent concentrates on a handful of arterial routes — the roads between the terminal and the city. We put the fleet on exactly those corridors, timed to inbound flight banks.',
                    'Rather than a single national wrap, each metro ran creative referencing its own airport code. The localisation cost almost nothing in production and materially changed how the campaign was received.',
                ],
            },
            {
                id: 'results',
                nav: 'Results',
                heading: 'The line turned',
                body: [
                    'Direct sessions — the cleanest available proxy for unprompted demand — grew thirty-one percent year over year in activated metros while holding flat elsewhere.',
                    'eCommerce revenue turned positive for the first time in five years. Truckside was the only material change to the top-of-funnel plan in that period.',
                ],
            },
        ],
        quote: {
            text:
                'It was the primary top-of-funnel tactic in the plan that year. The revenue line turned, and this was the thing that changed.',
            author: 'VP, Growth Marketing',
            role: 'Hertz',
        },
        gallery: ['/assets/images/process/city.png', '/assets/images/case-study-img.jpg'],
    },
    {
        slug: 'nationwide',
        brand: 'Nationwide',
        industry: 'Insurance',
        summary:
            'Mobile billboards became the highlight of Nationwide’s market presence — and are still talked about today.',
        lead:
            'Insurance advertising is a category of sameness: the same jingles, the same reassurance, the same faces. Nationwide wanted presence that felt like it belonged to the city rather than the category.',
        year: '2024',
        markets: '6 metros',
        duration: '6 months',
        hero: '/assets/images/campaings-img.png',
        logo: `${LOGOS}/partner-nationwide.png`,
        stats: [
            { value: 42, prefix: '+', suffix: '%', label: 'Aided awareness lift' },
            { value: 6, label: 'Metros activated' },
            { value: 88, comma: true, suffix: 'M', label: 'Verified impressions' },
            { value: 3, suffix: 'x', label: 'Social mentions vs. benchmark' },
        ],
        services: ['Market presence strategy', 'Event synchronisation', 'Creative rotation'],
        sections: [
            {
                id: 'challenge',
                nav: 'The challenge',
                heading: 'Category sameness',
                body: [
                    'Recall testing showed consumers routinely attributing Nationwide’s advertising to competitors. In a category where the product is functionally identical, distinctiveness is the entire asset — and it was leaking.',
                ],
            },
            {
                id: 'approach',
                nav: 'The approach',
                heading: 'Be where the city already is',
                body: [
                    'We synchronised the fleet to the civic calendar: home games, festivals, marathons, parade routes. The trucks did not interrupt those moments, they attended them.',
                    'Creative rotated on a two-week cycle so repeat exposure stayed fresh, with a permanent local reference in every execution.',
                ],
            },
            {
                id: 'results',
                nav: 'Results',
                heading: 'Still being talked about',
                body: [
                    'Aided awareness lifted forty-two percent across activated metros, and misattribution to competitors fell sharply.',
                    'Organic social mentions ran at three times the category benchmark — the campaign generated its own earned media simply by showing up where people already had their phones out.',
                ],
            },
        ],
        quote: {
            text:
                'The mobile billboards were the highlight of our market presence that year. People still bring them up.',
            author: 'Regional Marketing Lead',
            role: 'Nationwide',
        },
        gallery: ['/assets/images/campaings-img.png', '/assets/images/process/city.png'],
    },
    {
        slug: 'cuyahoga-community-college',
        brand: 'Cuyahoga Community College',
        industry: 'Education',
        summary:
            'An enrolment campaign that earned a regional NCMPR gold medal and a national nomination.',
        lead:
            'Community college enrolment marketing has to reach prospective students who are not searching, in neighbourhoods where media budgets rarely reach. Tri-C needed both.',
        year: '2025',
        markets: 'Greater Cleveland',
        duration: '5 months',
        hero: '/assets/images/process/studio.png',
        logo: `${LOGOS}/partner-cuyahoga.png`,
        stats: [
            { value: 1, label: 'NCMPR regional gold medal' },
            { value: 19, prefix: '+', suffix: '%', label: 'Application starts' },
            { value: 34, label: 'Target neighbourhoods' },
            { value: 26, comma: true, suffix: 'M', label: 'Verified impressions' },
        ],
        services: ['Neighbourhood routing', 'Bilingual creative', 'Enrolment attribution'],
        sections: [
            {
                id: 'challenge',
                nav: 'The challenge',
                heading: 'Reaching students who are not looking yet',
                body: [
                    'The highest-potential prospective students were not in-market. They were not searching for programmes, not on college mailing lists, and largely not reachable through the channels higher-ed marketing usually buys.',
                ],
            },
            {
                id: 'approach',
                nav: 'The approach',
                heading: 'Take the campus to the neighbourhood',
                body: [
                    'We routed the fleet through thirty-four target neighbourhoods on a repeating weekly pattern, timed around school pickup, transit hubs and commercial strips.',
                    'Creative ran bilingual by corridor, and every execution carried a single, low-friction next step rather than a programme list.',
                ],
            },
            {
                id: 'results',
                nav: 'Results',
                heading: 'Gold, and a full class',
                body: [
                    'Application starts from targeted neighbourhoods rose nineteen percent against the prior cycle.',
                    'The work took a regional gold medal for outdoor advertising from the NCMPR and was nominated at national level.',
                ],
            },
        ],
        quote: {
            text:
                'The campaign reached neighbourhoods our media plan had never been able to afford, and the results showed up in applications, not just impressions.',
            author: 'Director of Marketing',
            role: 'Cuyahoga Community College',
        },
        gallery: ['/assets/images/process/studio.png', '/assets/images/process/city.png'],
    },
    {
        slug: 'dollar',
        brand: 'Dollar',
        industry: 'Car Rental',
        summary:
            'An OOH-versus-control study that lifted Dollar.com traffic in every target market.',
        lead:
            'Dollar wanted to know whether out-of-home could move online bookings — and to prove it against a clean control. We ran the media across target booking-location markets and measured year-over-year Dollar.com traffic, target versus non-OOH control.',
        year: '2018',
        markets: 'Target booking markets',
        duration: 'Campaign flight',
        hero: '/assets/images/dollar-hero.webp',
        logo: `${LOGOS}/dollar-car-rental-logo.png`,
        stats: [
            { value: 32, prefix: '+', suffix: '%', label: 'Peak-week Dollar.com visits YoY (target)' },
            { value: 25, prefix: '+', suffix: '%', label: 'Same-period lift in control markets' },
            { value: 7, prefix: '+', suffix: 'pt', label: 'Target-over-control gap at peak' },
            { value: 100, suffix: '%', label: 'Of target markets beat control' },
        ],
        services: ['Test-vs-control design', 'Route planning', 'Traffic-lift measurement'],
        sections: [
            {
                id: 'challenge',
                nav: 'The challenge',
                heading: 'Could a physical medium move a digital booking?',
                body: [
                    'Dollar’s bookings happen online, so any awareness channel had to prove it moved Dollar.com traffic — not just impressions. The brief was to test out-of-home the way a performance team would test anything: against a matched control.',
                ],
            },
            {
                id: 'approach',
                nav: 'The approach',
                heading: 'Run OOH in target markets, hold out the rest',
                body: [
                    'We flighted the campaign across target booking-location markets and left demographically comparable markets un-exposed as a control group.',
                    'Year-over-year Dollar.com website traffic was then compared between the two groups across the campaign, so any lift could be read against the flight dates rather than a seasonal curve.',
                ],
            },
            {
                id: 'results',
                nav: 'Results',
                heading: 'Traffic tracked the trucks',
                body: [
                    'In the peak week, target markets grew Dollar.com visits 32% year over year against 25% for control, and target markets consistently outperformed the non-OOH control.',
                    'Traffic lifts tracked the OOH flight dates — the signal every performance marketer wants to see before scaling.',
                ],
            },
        ],
        quote: {
            text:
                'Target markets outperformed the non-OOH control across the flight, with the traffic lift tracking the campaign dates rather than the season.',
            author: 'Campaign Analytics',
            role: 'Advertising Wheels',
        },
        gallery: ['/assets/images/process/city.png', '/assets/images/case-study-img.jpg'],
    },
    {
        slug: 'aaa',
        brand: 'AAA',
        industry: 'Travel & Mobility',
        summary:
            'A membership and roadside-assistance awareness plan built for commuter routes and travel hubs.',
        lead:
            'AAA wanted to stay top-of-mind exactly where drivers feel it — on the road. The plan puts mobile billboards on high-volume commuter corridors and travel hubs, timed to peak drive times. Figures below are projected for the proposed flight.',
        year: '2025',
        markets: 'Commuter corridors & travel hubs',
        duration: 'Proposed seasonal flight',
        hero: '/assets/images/campaings-img.png',
        logo: `${LOGOS}/aaa-vector-logo.png`,
        stats: [
            { value: 40, prefix: '+', suffix: '%', label: 'Projected awareness lift' },
            { value: 12, label: 'Commuter corridors' },
            { value: 24, comma: true, suffix: 'M', label: 'Projected impressions' },
            { value: 3, suffix: 'x', label: 'Frequency at peak drive times' },
        ],
        services: ['Commuter-route planning', 'Travel-hub targeting', 'Wrap creative'],
        sections: [
            {
                id: 'challenge',
                nav: 'The challenge',
                heading: 'Staying top-of-mind where drivers already are',
                body: [
                    'Membership and roadside-assistance sign-ups depend on recall at the moment of need. The goal was to keep AAA present on the exact routes and hubs where drivers spend their commuting and travel time.',
                ],
            },
            {
                id: 'approach',
                nav: 'The approach',
                heading: 'Own the commuter corridor',
                body: [
                    'The proposed plan flights mobile billboards along high-volume commuter corridors and travel hubs, concentrated at morning and evening peaks for maximum frequency against the target driver.',
                ],
            },
        ],
        quote: {
            text:
                'The plan concentrates frequency on the commuter corridors and travel hubs where membership recall matters most.',
            author: 'Campaign Team',
            role: 'Advertising Wheels',
        },
        gallery: ['/assets/images/campaings-img.png', '/assets/images/process/city.png'],
    },
    {
        slug: 'burger-king',
        brand: 'Burger King',
        industry: 'Quick-Service Food',
        summary:
            'A foot-traffic and limited-time-offer push near restaurant clusters, timed to peak meal times.',
        lead:
            'Burger King wanted foot traffic and limited-time-offer awareness where hunger and proximity meet. The plan runs mobile billboards around restaurant clusters, timed to lunch and dinner peaks. Figures below are projected for the proposed flight.',
        year: '2025',
        markets: 'Restaurant clusters',
        duration: 'Proposed LTO flights',
        hero: '/assets/images/process/city.png',
        logo: `${LOGOS}/burger-king-logo.png`,
        stats: [
            { value: 35, prefix: '+', suffix: '%', label: 'Projected LTO awareness lift' },
            { value: 2, label: 'Peak meal dayparts' },
            { value: 18, comma: true, suffix: 'M', label: 'Projected impressions' },
            { value: 5, label: 'Restaurant clusters covered' },
        ],
        services: ['Cluster routing', 'Daypart timing', 'LTO creative rotation'],
        sections: [
            {
                id: 'challenge',
                nav: 'The challenge',
                heading: 'Turn proximity into a visit',
                body: [
                    'Quick-service demand is a proximity-and-timing game. The goal was to promote limited-time offers and drive foot traffic to nearby locations right when people decide where to eat.',
                ],
            },
            {
                id: 'approach',
                nav: 'The approach',
                heading: 'Be at the cluster at meal time',
                body: [
                    'The proposed plan concentrates mobile billboards around restaurant clusters and times them to lunch and dinner peaks, rotating the limited-time-offer creative so repeat exposure stays fresh.',
                ],
            },
        ],
        quote: {
            text:
                'The plan puts the offer in front of hungry, nearby audiences at the exact moment they choose where to eat.',
            author: 'Campaign Team',
            role: 'Advertising Wheels',
        },
        gallery: ['/assets/images/process/city.png', '/assets/images/case-study-img.jpg'],
    },
];

/** Lookup used by the detail route. Returns undefined for unknown slugs. */
export function getCaseStudy(slug: string): CaseStudy | undefined {
    return CASE_STUDIES.find((c) => c.slug === slug);
}

/** Up to `limit` other studies, for the "keep reading" rail. */
export function relatedCaseStudies(slug: string, limit = 3): CaseStudy[] {
    return CASE_STUDIES.filter((c) => c.slug !== slug).slice(0, limit);
}
