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

import { CLIENT_SHOTS } from './clientShots';

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

/**
 * Real client photography, where we have it.
 *
 * Ten clients have shoot folders under `public/assets/images/clients` (see
 * `clientShots.ts`) — studies without one keep their existing stand-in art
 * rather than borrowing another client's truck, which would put the wrong
 * wrap next to the wrong brand's results.
 */
const heroOf = (slug: string, fallback: string) => CLIENT_SHOTS[slug]?.hero[0] ?? fallback;
const platesOf = (slug: string, fallback: string[]) =>
    CLIENT_SHOTS[slug] ? CLIENT_SHOTS[slug].hero.slice(1, 4) : fallback;

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
                    'Each vehicle streamed GPS at fifteen-second intervals, which gave us a verified impression count rather than a modeled one — audited by a third party and reconciled against the plan weekly.',
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
        hero: heroOf('hertz', '/assets/images/process/city.png'),
        logo: `${LOGOS}/partner-hertz.webp`,
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
        gallery: platesOf('hertz', ['/assets/images/process/city.png', '/assets/images/process/studio.png']),
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
        hero: heroOf('nationwide', '/assets/images/campaings-img.png'),
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
        gallery: platesOf('nationwide', ['/assets/images/campaings-img.png', '/assets/images/process/city.png']),
    },
    {
        slug: 'cuyahoga-community-college',
        brand: 'Cuyahoga Community College',
        industry: 'Education',
        summary:
            'An enrolment campaign that earned a regional NCMPR gold medal and a national nomination.',
        lead:
            'Community college enrolment marketing has to reach prospective students who are not searching, in neighborhoods where media budgets rarely reach. Tri-C needed both.',
        year: '2025',
        markets: 'Greater Cleveland',
        duration: '5 months',
        hero: '/assets/images/process/studio.png',
        logo: `${LOGOS}/partner-cuyahoga.png`,
        stats: [
            { value: 1, label: 'NCMPR regional gold medal' },
            { value: 19, prefix: '+', suffix: '%', label: 'Application starts' },
            { value: 34, label: 'Target neighborhoods' },
            { value: 26, comma: true, suffix: 'M', label: 'Verified impressions' },
        ],
        services: ['Neighborhood routing', 'Bilingual creative', 'Enrolment attribution'],
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
                heading: 'Take the campus to the neighborhood',
                body: [
                    'We routed the fleet through thirty-four target neighborhoods on a repeating weekly pattern, timed around school pickup, transit hubs and commercial strips.',
                    'Creative ran bilingual by corridor, and every execution carried a single, low-friction next step rather than a programme list.',
                ],
            },
            {
                id: 'results',
                nav: 'Results',
                heading: 'Gold, and a full class',
                body: [
                    'Application starts from targeted neighborhoods rose nineteen percent against the prior cycle.',
                    'The work took a regional gold medal for outdoor advertising from the NCMPR and was nominated at national level.',
                ],
            },
        ],
        quote: {
            text:
                'The campaign reached neighborhoods our media plan had never been able to afford, and the results showed up in applications, not just impressions.',
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
        hero: heroOf('dollar', '/assets/images/Blog-Featured.webp'),
        logo: `${LOGOS}/dollar-car-rental-logo.webp`,
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
        gallery: platesOf('dollar', ['/assets/images/process/city.png', '/assets/images/process/studio.png']),
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
        logo: `${LOGOS}/aaa-vector-logo.webp`,
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
        logo: `${LOGOS}/burger-king-logo.webp`,
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
        gallery: ['/assets/images/process/city.png', '/assets/images/process/studio.png'],
    },
    {
        slug: 'wendys',
        brand: "Wendy's",
        industry: 'Quick-Service Food',
        summary:
            'A drive-time frequency play that kept new menu news in front of commuters every single day.',
        lead:
            'Fast-food decisions are made in the car. Wendy’s put its menu news on the roads its customers were already driving — morning and evening commutes, retail corridors at lunch — so the brand was the last one seen before the exit ramp.',
        year: '2023',
        markets: 'Multi-metro',
        duration: '6 months',
        hero: heroOf('wendys', '/assets/images/process/city.png'),
        logo: `${LOGOS}/partner-wendys.png`,
        stats: [
            { value: 2, label: 'Peak dayparts owned daily' },
            { value: 3, suffix: 'x', label: 'Weekly frequency vs. static OOH plan' },
            { value: 20, comma: true, suffix: 'M', label: 'Verified impressions' },
            { value: 92, suffix: '%', label: 'Routes completed as planned' },
        ],
        services: ['Commuter routing', 'Daypart timing', 'Menu-news creative rotation'],
        sections: [
            {
                id: 'challenge',
                nav: 'The challenge',
                heading: 'Menu news has a shelf life',
                body: [
                    'Limited-time menu items live or die in their first weeks. Wendy’s needed awareness that built immediately in the right trade areas — not a static board bought on a four-week cycle that peaks after the promotion window has moved on.',
                ],
            },
            {
                id: 'approach',
                nav: 'The approach',
                heading: 'Meet the commute where it eats',
                body: [
                    'The fleet ran morning and evening commuter corridors and shifted to retail and lunch clusters midday, so the same driver saw the creative on the way to work and again when deciding where to eat.',
                    'Creative rotated with the menu calendar, keeping every impression current — a flexibility a printed billboard cannot match.',
                ],
            },
            {
                id: 'results',
                nav: 'Results',
                heading: 'Frequency where it converts',
                body: [
                    'GPS logs verified the plan was delivered nearly in full, with repeat exposure against the same commuter audience running at roughly three times what an equivalent static placement would have achieved.',
                    'The campaign photography on this page is from live routes — the same vehicles the logs were counting.',
                ],
            },
        ],
        quote: {
            text:
                'The plan put the menu in front of the same commuters day after day, and rotated the creative as fast as the menu itself changed.',
            author: 'Campaign Team',
            role: 'Advertising Wheels',
        },
        gallery: platesOf('wendys', ['/assets/images/process/city.png', '/assets/images/process/studio.png']),
    },
    {
        slug: 'xfinity',
        brand: 'Xfinity',
        industry: 'Telecommunications',
        summary:
            'Neighborhood-level presence that put the brand on the streets its network upgrade was reaching.',
        lead:
            'A network is sold neighborhood by neighborhood. As Xfinity’s footprint and offers rolled out street by street, the fleet carried the message down those exact streets — a media buy with the same geography as the product.',
        year: '2023',
        markets: 'Upgrade-footprint neighborhoods',
        duration: '4 months',
        hero: heroOf('xfinity', '/assets/images/xfinity-img.webp'),
        logo: `${LOGOS}/partner-xfinity.png`,
        stats: [
            { value: 28, comma: true, suffix: 'M', label: 'Verified impressions' },
            { value: 40, label: 'Target neighborhoods routed' },
            { value: 15, suffix: 's', label: 'GPS logging interval' },
            { value: 100, suffix: '%', label: 'Of routes inside the service footprint' },
        ],
        services: ['Footprint routing', 'Retail-store support', 'Offer creative'],
        sections: [
            {
                id: 'challenge',
                nav: 'The challenge',
                heading: 'Broad media, street-level product',
                body: [
                    'Television and digital buy audiences; a broadband offer is only relevant on the streets the network actually serves. Xfinity needed reach that could be drawn to the boundary of the serviceable footprint — and proof the media stayed inside it.',
                ],
            },
            {
                id: 'approach',
                nav: 'The approach',
                heading: 'Route the media like the network',
                body: [
                    'Routes were built directly from the serviceable-address map: residential arterials, retail strips near Xfinity stores, and commuter corridors that feed the target neighborhoods.',
                    'Fifteen-second GPS logging meant every mile could be audited against the footprint — no impression was spent where the product could not be bought.',
                ],
            },
            {
                id: 'results',
                nav: 'Results',
                heading: 'Presence with proof',
                body: [
                    'The flight delivered its impressions entirely inside the serviceable footprint, verified by the GPS record rather than modeled.',
                    'Store-adjacent routing tied the awareness push to the retail locations where the offer converts.',
                ],
            },
        ],
        quote: {
            text:
                'Every mile was logged inside the service footprint. It is the only medium we can draw to the boundary of the network itself.',
            author: 'Campaign Team',
            role: 'Advertising Wheels',
        },
        gallery: platesOf('xfinity', ['/assets/images/xfinity-img.webp', '/assets/images/process/city.png']),
    },
    {
        slug: 'raising-canes',
        brand: "Raising Cane's",
        industry: 'Quick-Service Food',
        summary:
            'Market-entry awareness that introduced the brand before the first drive-thru line formed.',
        lead:
            'When Raising Cane’s enters a market, the product does the retention — the campaign’s job is the introduction. The fleet seeded the trade area around new restaurants for weeks ahead of opening, so launch day arrived with the name already familiar.',
        year: '2024',
        markets: 'New-restaurant trade areas',
        duration: 'Pre-opening flights',
        hero: heroOf('raising-canes', '/assets/images/process/city.png'),
        logo: `${LOGOS}/partner-raising-canes.png`,
        stats: [
            { value: 3, label: 'Weeks of pre-opening presence' },
            { value: 5, label: 'Mile trade-area radius covered' },
            { value: 12, comma: true, suffix: 'M', label: 'Verified impressions' },
            { value: 2, label: 'Dayparts targeted daily' },
        ],
        services: ['Market-entry strategy', 'Trade-area routing', 'Opening-day support'],
        sections: [
            {
                id: 'challenge',
                nav: 'The challenge',
                heading: 'New market, no memory',
                body: [
                    'In a new metro, Raising Cane’s starts from zero awareness against entrenched chicken competitors. The opening weeks set the trajectory of the restaurant — the brand needed to be a known name before the doors opened, within a tight trade-area radius.',
                ],
            },
            {
                id: 'approach',
                nav: 'The approach',
                heading: 'Seed the trade area first',
                body: [
                    'The fleet ran the five-mile trade area around each new restaurant for three weeks before opening — commuter arterials at peak, retail and campus clusters at lunch — then anchored the opening itself.',
                    'Creative kept it simple: the name, the box combo, the opening date. Introduction, not persuasion.',
                ],
            },
            {
                id: 'results',
                nav: 'Results',
                heading: 'Opening day with a queue',
                body: [
                    'By opening, the wrap had put the brand in front of the trade area at frequency for weeks — the photography on this page is from those live routes.',
                    'The pre-opening playbook has since been repeated for subsequent restaurant launches.',
                ],
            },
        ],
        quote: {
            text:
                'The trade area had seen the brand for three straight weeks before the first order was taken.',
            author: 'Campaign Team',
            role: 'Advertising Wheels',
        },
        gallery: platesOf('raising-canes', ['/assets/images/process/city.png', '/assets/images/process/studio.png']),
    },
    {
        slug: 'floor-and-decor',
        brand: 'Floor & Decor',
        industry: 'Specialty Retail',
        summary:
            'A store-opening blitz that told Greater Boston two new locations were open — corridor by corridor.',
        lead:
            'Floor & Decor opened in Dorchester and Waltham at the same time, and needed Greater Boston to know it. A multi-truck fleet ran the retail and home-improvement corridors between the two stores with one message: now open, free design services, low-price leader.',
        year: '2022',
        markets: 'Greater Boston',
        duration: 'Opening flight',
        hero: heroOf('floor-and-decor', '/assets/images/process/city.png'),
        logo: `${LOGOS}/partner-floor-decor.png`,
        stats: [
            { value: 2, label: 'Store openings launched' },
            { value: 6, label: 'Trucks in the Boston fleet' },
            { value: 16, comma: true, suffix: 'M', label: 'Verified impressions' },
            { value: 2, label: 'Sides of the metro covered daily' },
        ],
        services: ['Store-opening strategy', 'Multi-truck fleet', 'Retail-corridor routing'],
        sections: [
            {
                id: 'challenge',
                nav: 'The challenge',
                heading: 'Two openings, one metro, zero waste',
                body: [
                    'A store opening is a deadline media problem: awareness has to exist in the trade area on a specific date, and a flooring purchase only happens when a project is live. The buy had to blanket homeowner and contractor corridors on both sides of the metro at once.',
                ],
            },
            {
                id: 'approach',
                nav: 'The approach',
                heading: 'Run the corridors between the stores',
                body: [
                    'Six wrapped trucks split the metro: Dorchester routes south and east, Waltham routes west along the home-improvement retail strips, converging on shared commuter arterials at peak.',
                    'Creative carried the category promise — tile, wood and stone at the low price — with the opening message and both locations on every side.',
                ],
            },
            {
                id: 'results',
                nav: 'Results',
                heading: 'The market knew by opening week',
                body: [
                    'The fleet delivered saturation frequency across the target corridors through the opening period — the row of wrapped trucks in the photography above is the actual Boston fleet staged for launch.',
                ],
            },
        ],
        quote: {
            text:
                'Both trade areas saw the opening message daily for the entire flight — a launch you could not miss on the road.',
            author: 'Campaign Team',
            role: 'Advertising Wheels',
        },
        gallery: platesOf('floor-and-decor', ['/assets/images/process/city.png', '/assets/images/process/studio.png']),
    },
    {
        slug: 'reliable-heating-cooling',
        brand: 'Reliable Heating & Air',
        industry: 'Home Services',
        summary:
            'Offer-led truckside that put a hard price on the street in the exact neighborhoods the techs serve.',
        lead:
            'Home-services demand is hyper-local and offer-driven. Reliable’s wraps led with the number — a monthly-payment system price and a next-day installation guarantee — and ran the residential arterials of its Atlanta service area where the decision gets made.',
        year: '2024',
        markets: 'Metro Atlanta service area',
        duration: 'Seasonal flights',
        hero: heroOf('reliable-heating-cooling', '/assets/images/process/city.png'),
        logo: `${LOGOS}/partner-reliable.png`,
        stats: [
            { value: 2, label: 'Peak seasons flighted' },
            { value: 30, comma: true, suffix: 'M', label: 'Verified impressions' },
            { value: 100, suffix: '%', label: 'Of routes inside the service area' },
            { value: 1, label: 'Price point on every panel' },
        ],
        services: ['Service-area routing', 'Offer creative', 'Seasonal flighting'],
        sections: [
            {
                id: 'challenge',
                nav: 'The challenge',
                heading: 'Be the name when the AC quits',
                body: [
                    'Nobody shops HVAC until the day they need it — then they call a name they already know. Reliable needed continuous neighborhood presence across its service area so that, at the moment of failure, the brand and the price were already in the household’s memory.',
                ],
            },
            {
                id: 'approach',
                nav: 'The approach',
                heading: 'Lead with the offer, stay in the footprint',
                body: [
                    'Creative put the system price and the next-day guarantee in letters readable from across an intersection — an ad that does the estimate before the phone call.',
                    'Routes tracked the residential service area through the summer and winter peaks, when a wrapped truck on a neighborhood street reads exactly like what it is: proof the company is already working nearby.',
                ],
            },
            {
                id: 'results',
                nav: 'Results',
                heading: 'Presence that compounds seasonally',
                body: [
                    'Every mile ran inside the serviceable footprint, GPS-verified, concentrated in the seasons when systems fail and decisions happen fast.',
                ],
            },
        ],
        quote: {
            text:
                'The wrap does the estimate before the phone rings — the price is on the street all season.',
            author: 'Campaign Team',
            role: 'Advertising Wheels',
        },
        gallery: platesOf('reliable-heating-cooling', ['/assets/images/process/city.png', '/assets/images/process/studio.png']),
    },
    {
        slug: 'outer',
        brand: 'Outer',
        industry: 'DTC Home & Outdoor',
        summary:
            'A digitally-native furniture brand made physical, on the design-district streets its customers walk.',
        lead:
            'Outer sells premium outdoor furniture online, with neighborhood showrooms instead of stores. The fleet gave the brand a physical presence on the Westside LA streets — Venice, Abbot Kinney, Santa Monica — where its design-conscious audience actually spends its weekends.',
        year: '2021',
        markets: 'Los Angeles — Westside',
        duration: '3 months',
        hero: heroOf('outer', '/assets/images/process/city.png'),
        logo: `${LOGOS}/partner-outer.png`,
        stats: [
            { value: 8, comma: true, suffix: 'M', label: 'Verified impressions' },
            { value: 12, label: 'Design-district streets routed' },
            { value: 7, label: 'Days-a-week presence' },
            { value: 1, label: 'Metro, owned deeply' },
        ],
        services: ['Neighborhood targeting', 'Brand-launch creative', 'Weekend routing'],
        sections: [
            {
                id: 'challenge',
                nav: 'The challenge',
                heading: 'A digital brand needs a physical footprint',
                body: [
                    'A DTC brand can saturate Instagram and still not exist in the physical world its product lives in. Outer needed credibility and presence in a compact, affluent geography — without the retail footprint it had deliberately chosen not to build.',
                ],
            },
            {
                id: 'approach',
                nav: 'The approach',
                heading: 'Drive the design districts',
                body: [
                    'Rather than chasing freeway impressions, the fleet worked a dozen Westside streets at walking pace — the boutique and café corridors where the audience is out, unhurried, and looking around.',
                    'The creative matched the brand: clean, product-forward, no offer. The truck was the billboard the neighborhood does not allow.',
                ],
            },
            {
                id: 'results',
                nav: 'Results',
                heading: 'Physical presence, digital brand',
                body: [
                    'For three months the brand was physically present in its core neighborhoods seven days a week — the street photography above is from those routes, palm trees and all.',
                ],
            },
        ],
        quote: {
            text:
                'The truck put a digitally-native brand on the exact streets its customers walk — a footprint without a storefront.',
            author: 'Campaign Team',
            role: 'Advertising Wheels',
        },
        gallery: platesOf('outer', ['/assets/images/process/city.png', '/assets/images/process/studio.png']),
    },
    {
        slug: 'titan',
        brand: 'Titan Insurance Sales',
        industry: 'Insurance',
        summary:
            'Retail-plaza routing that put super-low rates in front of value shoppers where they park.',
        lead:
            'Titan sells on price, to drivers. The fleet took that message to big-box retail plazas and the commercial arterials that connect them — high-dwell environments full of exactly the value-conscious motorists the brand converts.',
        year: '2022',
        markets: 'California metros',
        duration: '5 months',
        hero: heroOf('titan', '/assets/images/process/city.png'),
        logo: `${LOGOS}/partner-titan.png`,
        stats: [
            { value: 10, comma: true, suffix: 'M', label: 'Verified impressions' },
            { value: 25, label: 'Retail plazas on rotation' },
            { value: 90, suffix: 's', label: 'Average dwell at anchor stops' },
            { value: 1, label: 'Phone number, everywhere' },
        ],
        services: ['Retail-plaza routing', 'Dwell-time strategy', 'Direct-response creative'],
        sections: [
            {
                id: 'challenge',
                nav: 'The challenge',
                heading: 'Reach the rate shopper, skip the rest',
                body: [
                    'Non-standard auto insurance has a specific customer, and broad media wastes most of its weight missing them. Titan needed its rate message concentrated where value-focused drivers demonstrably are — and every one of them arrives by car.',
                ],
            },
            {
                id: 'approach',
                nav: 'The approach',
                heading: 'Park the message where they park',
                body: [
                    'Routes rotated through discount-retail plazas and the arterials between them, with deliberate dwell at anchor-store entrances and long-cycle intersections — a stopped truck is a read message.',
                    'Creative was pure direct response: the rate promise, the number, nothing else to slow the read.',
                ],
            },
            {
                id: 'results',
                nav: 'Results',
                heading: 'Concentrated, not broadcast',
                body: [
                    'The flight concentrated its full weight on the highest-density value-shopper locations in each metro, with GPS logs verifying the plaza rotation was delivered as planned.',
                ],
            },
        ],
        quote: {
            text:
                'Every impression was spent within sight of a parking lot full of the exact drivers the product is priced for.',
            author: 'Campaign Team',
            role: 'Advertising Wheels',
        },
        gallery: platesOf('titan', ['/assets/images/process/city.png', '/assets/images/process/studio.png']),
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
