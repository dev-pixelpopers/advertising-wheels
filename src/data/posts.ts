/**
 * Blog source of truth.
 *
 * The index (`/blog`) and the article route (`/blog/[slug]`) both read from
 * here. As with the case studies, `sections` feeds the article body AND the
 * sticky table of contents, so the two can never disagree.
 */

import { HOUSE_SHOTS } from './clientShots';

export interface PostSection {
    /** Anchor id — also the TOC target. */
    id: string;
    /** Short TOC label. */
    nav: string;
    heading: string;
    body: string[];
    /** Optional emphasised line rendered after the body. */
    callout?: string;
}

export interface Post {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    date: string;
    read: string;
    image: string;
    author: { name: string; role: string };
    /** Standfirst under the title. */
    lead: string;
    sections: PostSection[];
    quote?: { text: string; author: string };
    /** Closing takeaways. */
    takeaways: string[];
}

export const POSTS: Post[] = [
    {
        slug: 'why-out-of-home-is-the-most-trusted-channel',
        title: 'Why out-of-home is the most trusted channel in a skippable world',
        excerpt:
            'Ad blockers, skip buttons and banner blindness gutted digital attention. A 600-square-foot truck rolling through rush hour can’t be skipped, blocked or muted — and the data shows audiences trust it more because of it.',
        category: 'Strategy',
        date: 'Jul 14, 2026',
        read: '6 min read',
        image: HOUSE_SHOTS.highway,
        author: { name: 'Roopanjan Dey', role: 'Founder, Advertising Wheels' },
        lead:
            'The most valuable property in advertising is no longer reach. It is the small, stubborn fraction of reach that an audience cannot dismiss — and increasingly, that fraction lives outside.',
        sections: [
            {
                id: 'skip-economy',
                nav: 'The skip economy',
                heading: 'We built an industry the audience can opt out of',
                body: [
                    'Almost every digital format invented in the last two decades shipped with an escape hatch. Pre-roll got a skip button. Display got the blocker. Social got the scroll. Each was a reasonable concession to user experience, and collectively they moved the balance of power decisively to the audience.',
                    'The result is a strange economy where impressions are abundant and attention is scarce. Buyers respond by purchasing more impressions, which trains audiences to dismiss faster, which raises the price of the attention that remains.',
                ],
                callout:
                    'An impression that can be dismissed in 300 milliseconds is not the same unit as one that cannot be dismissed at all.',
            },
            {
                id: 'trust-gap',
                nav: 'The trust gap',
                heading: 'Physical presence reads as commitment',
                body: [
                    'Audiences consistently rate outdoor advertising as more trustworthy than social or display formats. The usual explanation is nostalgia. The better explanation is cost signalling.',
                    'A wrapped vehicle is visibly expensive and visibly permanent. It cannot be spun up overnight by an anonymous drop-shipper, cannot be targeted at one person and denied to another, and cannot be quietly deleted when the claim turns out to be false. Everyone on the street sees the same message. That shared visibility is itself a form of accountability.',
                ],
            },
            {
                id: 'measurement',
                nav: 'Closing the loop',
                heading: 'The old objection has been solved',
                body: [
                    'Outdoor’s historic weakness was measurement, and that objection is now mostly out of date. GPS logging produces verified rather than modeled impressions. Geo-matched control markets isolate incremental lift. Search and site-visit studies connect exposure to behaviour.',
                    'The practical consequence is that outdoor can now be evaluated on the same terms as a performance channel — which is exactly how it should be bought.',
                ],
            },
            {
                id: 'what-to-do',
                nav: 'What to do',
                heading: 'Buy the unskippable fraction deliberately',
                body: [
                    'Treat unskippable reach as its own line in the plan rather than a rounding error. Size it against the cost of the attention you are currently renting at auction, not against a historic outdoor benchmark.',
                    'Then hold it to a performance standard. If it cannot report incremental lift against a control, it is brand spend regardless of the format.',
                ],
            },
        ],
        quote: {
            text:
                'Reach is cheap. Reach that the audience cannot dismiss is the only inventory that has actually got scarcer.',
            author: 'Roopanjan Dey',
        },
        takeaways: [
            'Skippability, not reach, is now the scarce variable in media planning.',
            'Outdoor’s trust advantage comes from visible cost and shared visibility, not nostalgia.',
            'GPS verification and geo-matched controls remove the historic measurement objection.',
            'Budget unskippable reach as its own line, and hold it to performance standards.',
        ],
    },
    {
        slug: 'the-real-math-behind-a-600-square-foot-billboard',
        title: 'The real math behind a 600-square-foot billboard',
        excerpt:
            'What one wrapped truck actually delivers per mile — and why it beats a static board on cost-per-thousand.',
        category: 'Measurement',
        date: 'Jul 2, 2026',
        read: '5 min read',
        image: '/assets/images/process/stats.png',
        author: { name: 'Advertising Wheels', role: 'Measurement team' },
        lead:
            'Static boards are priced on a fixed audience passing a fixed point. A truck inverts that: the audience is fixed and the board moves through it. The arithmetic changes more than people expect.',
        sections: [
            {
                id: 'unit',
                nav: 'The unit',
                heading: 'Start with surface area, not the rate card',
                body: [
                    'A standard box truck carries roughly six hundred square feet of print across three faces. That is comparable to a mid-size bulletin, except it is not competing for attention with the four boards either side of it on the same stretch of highway.',
                    'Because the surfaces are read from different angles at different points in a journey, a single vehicle produces several distinct viewing opportunities per encounter rather than one.',
                ],
            },
            {
                id: 'frequency',
                nav: 'Frequency',
                heading: 'A moving board resets its own audience',
                body: [
                    'A static board’s audience is largely the same people on the same commute, so frequency accumulates quickly and reach plateaus early. A routed vehicle deliberately does the opposite: route rotation means each day draws from a partially new population.',
                    'That gives planners a dial static inventory does not have. Hold a route to build frequency in a tight catchment, or rotate it to buy reach.',
                ],
                callout:
                    'Route rotation is the closest thing outdoor has to a reach-versus-frequency slider.',
            },
            {
                id: 'cpm',
                nav: 'Cost per thousand',
                heading: 'Where the numbers land',
                body: [
                    'Verified truckside impressions typically clear at a lower cost per thousand than premium static bulletins in the same market, before accounting for the dwell-time advantage at signals and in congestion.',
                    'The important caveat: this only holds if impressions are verified rather than modeled. A modeled number can be inflated arbitrarily, which makes any CPM comparison meaningless.',
                ],
            },
        ],
        takeaways: [
            'One truck ≈ 600 sq ft across three faces, without adjacent-board competition.',
            'Route rotation lets you trade reach against frequency deliberately.',
            'Verified truckside CPM generally undercuts premium static bulletins.',
            'Only compare CPMs when both sides are verified, not modeled.',
        ],
    },
    {
        slug: 'how-gps-routing-turns-guesswork-into-a-media-plan',
        title: 'How GPS routing turns guesswork into a media plan',
        excerpt:
            'Audience-led routes, dayparts and dwell zones — planning OOH the way you’d plan a digital buy.',
        category: 'Technology',
        date: 'Jun 20, 2026',
        read: '7 min read',
        image: '/assets/images/process/city.png',
        author: { name: 'Advertising Wheels', role: 'Routing team' },
        lead:
            'The difference between a truck driving around and a media plan is entirely in the routing. One produces miles. The other produces an audience.',
        sections: [
            {
                id: 'catchment',
                nav: 'Catchments',
                heading: 'Start from the outcome, not the map',
                body: [
                    'Good routing begins with the locations that matter commercially — branches, stores, venues, campuses — and works outward into the ZIPs where an incremental customer is both likely and valuable.',
                    'Only then does the road network enter the conversation. Planning the other way round produces impressive mileage in places that cannot convert.',
                ],
            },
            {
                id: 'dayparts',
                nav: 'Dayparts',
                heading: 'The same road is three different placements',
                body: [
                    'A commuter corridor at eight in the morning, at one in the afternoon and at six in the evening reaches three materially different audiences at three different levels of receptiveness.',
                    'Dayparting the route is therefore not a scheduling detail — it is targeting, and it is the single highest-leverage decision in the plan.',
                ],
            },
            {
                id: 'dwell',
                nav: 'Dwell zones',
                heading: 'Buy the red lights on purpose',
                body: [
                    'Exposure quality scales with dwell time. A vehicle stationary at a long signal cycle, in queued traffic or at a busy loading zone delivers a fundamentally longer read than one at speed.',
                    'We map those zones explicitly and weight routes toward them, which is why two campaigns with identical mileage can produce very different recall.',
                ],
                callout: 'Mileage is an input. Dwell-weighted exposure is the output worth reporting.',
            },
            {
                id: 'verification',
                nav: 'Verification',
                heading: 'Log everything, reconcile weekly',
                body: [
                    'Fifteen-second GPS pings turn the plan into a record. Every route run can be reconciled against the route sold, and any shortfall is visible within the week rather than at the wrap report.',
                    'That record is also what makes third-party audit possible — and audit is what lets a CFO treat the line as measured media.',
                ],
            },
        ],
        takeaways: [
            'Plan catchments from commercial outcomes, then fit routes to them.',
            'Dayparting a route is targeting, not scheduling.',
            'Weight routes toward dwell zones; mileage alone is a vanity input.',
            'Fifteen-second GPS logging enables weekly reconciliation and third-party audit.',
        ],
    },
    {
        slug: 'wrap-design-that-reads-at-65-miles-an-hour',
        title: 'Wrap design that reads at 65 miles an hour',
        excerpt:
            'Distance, motion and glance-value — the art-direction rules for creative built for the highway.',
        category: 'Creative',
        date: 'Jun 9, 2026',
        read: '4 min read',
        image: '/assets/images/process/studio.png',
        author: { name: 'Advertising Wheels', role: 'Creative studio' },
        lead:
            'Wrap creative fails for one reason more than any other: it was approved on a screen, at arm’s length, while stationary. None of those conditions apply on the road.',
        sections: [
            {
                id: 'glance',
                nav: 'Glance value',
                heading: 'You have roughly a second and a half',
                body: [
                    'At highway speed, a passing vehicle is in useful view for well under two seconds. That is enough for one idea and one brand attribution — not for a headline, a subhead, three proof points and a QR code.',
                    'The discipline is subtractive. Every element that survives the cut has to earn its place against the one thing you want remembered.',
                ],
            },
            {
                id: 'legibility',
                nav: 'Legibility',
                heading: 'Design at distance, not at desk',
                body: [
                    'Type needs weight and generous counters to hold together at distance and in motion. Fine strokes, tight tracking and low-contrast colour pairings all collapse first.',
                    'The practical test: view the artwork at ten percent scale from across the room. If it does not resolve there, it will not resolve on the road.',
                ],
                callout: 'If it survives the ten-percent test, it survives the highway.',
            },
            {
                id: 'geometry',
                nav: 'Vehicle geometry',
                heading: 'Respect the panel breaks',
                body: [
                    'Rivets, door seams, wheel arches and hinges are not obstacles to design around at the end — they are the grid. Type crossing a door break becomes unreadable the moment that door is opened.',
                    'Each face also has its own job: the sides carry the campaign idea, the rear carries the action, since it is read by a stationary driver behind you.',
                ],
            },
        ],
        takeaways: [
            'One idea, one attribution — under two seconds of view time.',
            'Weighted type with open counters survives distance and motion.',
            'Treat panel seams as the layout grid, not an afterthought.',
            'Sides sell the idea; the rear carries the call to action.',
        ],
    },
    {
        slug: 'ooh-plus-social-the-earned-media-flywheel',
        title: 'OOH + social: the earned-media flywheel',
        excerpt:
            'Sightings become photos, photos become posts. How a moving billboard keeps working after it passes.',
        category: 'Strategy',
        date: 'May 28, 2026',
        read: '6 min read',
        image: '/assets/images/clients/floor-and-decor/hero-05.webp',
        author: { name: 'Advertising Wheels', role: 'Strategy team' },
        lead:
            'The second impression is free. A truck that gets photographed keeps delivering long after it has left the intersection — but only if the creative gives someone a reason to lift their phone.',
        sections: [
            {
                id: 'why-shared',
                nav: 'Why it gets shared',
                heading: 'Novelty plus locality',
                body: [
                    'People photograph outdoor advertising when it is unexpected and when it is theirs. A national execution parked in a specific neighborhood satisfies neither. A local reference on an unusual surface satisfies both.',
                    'Timing compounds it. The same wrap on an ordinary Tuesday and on the morning of a home game will not perform the same way.',
                ],
            },
            {
                id: 'designing-for-it',
                nav: 'Designing for it',
                heading: 'Leave room for the photograph',
                body: [
                    'Shareable executions tend to have a clear focal point, enough negative space to survive being framed badly on a phone, and a brand mark that stays legible at low resolution.',
                    'A subtle prompt helps — a local hashtag or a line that only makes sense to people who live there.',
                ],
                callout:
                    'Design the wrap for the photo of the wrap, not just for the person standing next to it.',
            },
            {
                id: 'measuring',
                nav: 'Measuring it',
                heading: 'Track mentions against route, not just volume',
                body: [
                    'Raw mention counts say little. Mentions mapped against route and daypart tell you which corridors and which hours actually generate earned reach — and that is a routing input for the next flight.',
                ],
            },
        ],
        takeaways: [
            'Shares come from novelty plus locality, amplified by timing.',
            'Design for the phone photo: focal point, negative space, low-res legibility.',
            'Map mentions to route and daypart so earned reach feeds back into planning.',
        ],
    },
    {
        slug: 'what-verified-impressions-actually-means',
        title: 'What “verified impressions” actually means',
        excerpt:
            'Third-party audited reach and frequency, explained — and why it’s the number your CMO should ask for.',
        category: 'Measurement',
        date: 'May 3, 2026',
        read: '8 min read',
        image: '/assets/images/process/stats.png',
        author: { name: 'Advertising Wheels', role: 'Measurement team' },
        lead:
            'Two campaigns can report the same impression number and mean entirely different things by it. The difference is whether anyone independent checked.',
        sections: [
            {
                id: 'modeled',
                nav: 'Modeled numbers',
                heading: 'Where the big numbers come from',
                body: [
                    'A modeled impression estimate multiplies a traffic count by an assumed visibility factor by a duration. Every one of those inputs is an assumption, and small changes to any of them move the headline number enormously.',
                    'That is not inherently dishonest — modelling is how most outdoor has always been sold. It is simply not a measurement, and it should not be compared against one.',
                ],
            },
            {
                id: 'verified',
                nav: 'Verified numbers',
                heading: 'What verification actually adds',
                body: [
                    'A verified impression starts from a logged fact: this vehicle was on this road segment at this time, at this speed, for this duration. Audience is then applied to a route that is known to have happened rather than one that was planned.',
                    'The count is usually lower than a modeled equivalent. That is the point — it is defensible, and it can be reconciled line by line.',
                ],
                callout: 'A smaller number you can defend is worth more than a larger one you cannot.',
            },
            {
                id: 'asking',
                nav: 'What to ask for',
                heading: 'Four questions that separate the two',
                body: [
                    'Ask whether impressions are logged or modeled. Ask at what interval position is recorded. Ask who audits the data and whether you can see the raw route file. Ask how shortfall against the planned route is handled.',
                    'Vendors working from verified data answer all four immediately. The answers themselves matter less than the speed with which they arrive.',
                ],
            },
        ],
        takeaways: [
            'Modeled impressions are assumptions stacked on a traffic count.',
            'Verified impressions begin from logged position, speed and duration.',
            'Expect verified counts to be lower — and defensible.',
            'Ask: logged or modeled, at what interval, audited by whom, shortfall handled how.',
        ],
    },
];

export function getPost(slug: string): Post | undefined {
    return POSTS.find((p) => p.slug === slug);
}

/** Prefer same-category posts, then fill with the most recent others. */
export function relatedPosts(slug: string, limit = 3): Post[] {
    const current = getPost(slug);
    const others = POSTS.filter((p) => p.slug !== slug);
    if (!current) return others.slice(0, limit);
    const sameCategory = others.filter((p) => p.category === current.category);
    const rest = others.filter((p) => p.category !== current.category);
    return [...sameCategory, ...rest].slice(0, limit);
}
