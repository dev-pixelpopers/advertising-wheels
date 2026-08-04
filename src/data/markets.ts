/**
 * The 50 covered metro markets — the single source for MarketsCoverageV2.
 *
 * Reconciled 1:1 against the client's MarketCoverage.csv: same 50 rows, same
 * spellings, ordered by the market rank recorded in that file's notes column.
 * Coverage figures are the client's own (adults inside the coverage area is
 * 60% of the metro 18+ population).
 *
 * NOTE: the original MarketsCoverage.tsx keeps its own copy of this table
 * because it also carries per-market x/y map coordinates. V2 has no map, so it
 * needs none of that — this module is deliberately geometry-free.
 */

export type Region = 'WEST' | 'CENTRAL' | 'SOUTH' | 'NORTHEAST';

export const REGIONS: Region[] = ['WEST', 'CENTRAL', 'SOUTH', 'NORTHEAST'];

export interface Market {
    id: string;
    /** City as written in the client's coverage sheet, e.g. "Los Angeles, CA". */
    city: string;
    /** City with the state suffix stripped — the label used in the UI. */
    name: string;
    /** Two-letter state/territory code, parsed off the city string. */
    state: string;
    region: Region;
    /** Nielsen-style market rank (1 = largest). */
    rank: number;
    /** Adults 18+ inside the coverage area. */
    adults: number;
    /** Total adult 18+ population of the metro. */
    pop18: number;
    /** Impressions per truck across a standard 4-week flight. */
    impressions: number;
    /** Optional colour on who the routes actually reach. */
    audience?: string;
}

export const MARKETS: Market[] = [
    { id: 'nyc', city: 'New York, NY', name: 'New York', state: 'NY', region: 'NORTHEAST', rank: 1, adults: 9360000, pop18: 15600000, impressions: 2025000 },
    { id: 'lax', city: 'Los Angeles, CA', name: 'Los Angeles', state: 'CA', region: 'WEST', rank: 2, adults: 6120000, pop18: 10200000, impressions: 1751625 },
    { id: 'ord', city: 'Chicago, IL', name: 'Chicago', state: 'IL', region: 'CENTRAL', rank: 3, adults: 3960000, pop18: 6600000, impressions: 978750 },
    { id: 'phl', city: 'Philadelphia, PA', name: 'Philadelphia', state: 'PA', region: 'NORTHEAST', rank: 4, adults: 2820000, pop18: 4700000, impressions: 877500 },
    { id: 'dfw', city: 'Dallas-Ft. Worth, TX', name: 'Dallas-Ft. Worth', state: 'TX', region: 'CENTRAL', rank: 5, adults: 3240000, pop18: 5400000, impressions: 985500 },
    { id: 'dca', city: 'Washington, DC', name: 'Washington', state: 'DC', region: 'NORTHEAST', rank: 6, adults: 2940000, pop18: 4900000, impressions: 648000 },
    { id: 'hou', city: 'Houston, TX', name: 'Houston', state: 'TX', region: 'CENTRAL', rank: 7, adults: 2820000, pop18: 4700000, impressions: 675000, audience: 'Commuters, shoppers, sports & event crowds — ~1.2M weekly' },
    { id: 'mia', city: 'Miami-Ft. Lauderdale, FL', name: 'Miami-Ft. Lauderdale', state: 'FL', region: 'SOUTH', rank: 8, adults: 2400000, pop18: 4000000, impressions: 1373692 },
    { id: 'atl', city: 'Atlanta, GA', name: 'Atlanta', state: 'GA', region: 'SOUTH', rank: 9, adults: 2700000, pop18: 4500000, impressions: 1029105 },
    { id: 'bos', city: 'Boston, MA', name: 'Boston', state: 'MA', region: 'NORTHEAST', rank: 10, adults: 2640000, pop18: 4400000, impressions: 1350000 },
    { id: 'sfo', city: 'San Francisco, CA', name: 'San Francisco', state: 'CA', region: 'WEST', rank: 11, adults: 2940000, pop18: 4900000, impressions: 749250 },
    { id: 'phx', city: 'Phoenix, AZ', name: 'Phoenix', state: 'AZ', region: 'WEST', rank: 12, adults: 2460000, pop18: 4100000, impressions: 384750 },
    { id: 'sea', city: 'Seattle-Tacoma, WA', name: 'Seattle-Tacoma', state: 'WA', region: 'WEST', rank: 13, adults: 2220000, pop18: 3700000, impressions: 931500 },
    { id: 'dtw', city: 'Detroit, MI', name: 'Detroit', state: 'MI', region: 'CENTRAL', rank: 14, adults: 1920000, pop18: 3200000, impressions: 877500 },
    { id: 'msp', city: 'Minneapolis-St. Paul, MN', name: 'Minneapolis-St. Paul', state: 'MN', region: 'CENTRAL', rank: 15, adults: 1860000, pop18: 3100000, impressions: 742500 },
    { id: 'den', city: 'Denver, CO', name: 'Denver', state: 'CO', region: 'WEST', rank: 16, adults: 1740000, pop18: 2900000, impressions: 810000 },
    { id: 'tpa', city: 'Tampa-St. Pete, FL', name: 'Tampa-St. Pete', state: 'FL', region: 'SOUTH', rank: 17, adults: 1800000, pop18: 3000000, impressions: 641250 },
    { id: 'mco', city: 'Orlando, FL', name: 'Orlando', state: 'FL', region: 'SOUTH', rank: 18, adults: 1740000, pop18: 2900000, impressions: 607500 },
    { id: 'cle', city: 'Cleveland, OH', name: 'Cleveland', state: 'OH', region: 'CENTRAL', rank: 19, adults: 1560000, pop18: 2600000, impressions: 384750 },
    { id: 'sac', city: 'Sacramento, CA', name: 'Sacramento', state: 'CA', region: 'WEST', rank: 20, adults: 1440000, pop18: 2400000, impressions: 513000 },
    { id: 'clt', city: 'Charlotte, NC', name: 'Charlotte', state: 'NC', region: 'SOUTH', rank: 21, adults: 1260000, pop18: 2100000, impressions: 573750 },
    { id: 'rdu', city: 'Raleigh-Durham, NC', name: 'Raleigh-Durham', state: 'NC', region: 'SOUTH', rank: 22, adults: 1080000, pop18: 1800000, impressions: 506250 },
    { id: 'ind', city: 'Indianapolis, IN', name: 'Indianapolis', state: 'IN', region: 'CENTRAL', rank: 23, adults: 1140000, pop18: 1900000, impressions: 540000 },
    { id: 'bna', city: 'Nashville, TN', name: 'Nashville', state: 'TN', region: 'SOUTH', rank: 24, adults: 1080000, pop18: 1800000, impressions: 1032750 },
    { id: 'bwi', city: 'Baltimore, MD', name: 'Baltimore', state: 'MD', region: 'NORTHEAST', rank: 25, adults: 1380000, pop18: 2300000, impressions: 742500 },
    { id: 'san', city: 'San Diego, CA', name: 'San Diego', state: 'CA', region: 'WEST', rank: 26, adults: 1500000, pop18: 2500000, impressions: 776250 },
    { id: 'pdx', city: 'Portland, OR', name: 'Portland', state: 'OR', region: 'WEST', rank: 27, adults: 1320000, pop18: 2200000, impressions: 810000 },
    { id: 'stl', city: 'St. Louis, MO', name: 'St. Louis', state: 'MO', region: 'CENTRAL', rank: 28, adults: 1380000, pop18: 2300000, impressions: 675000 },
    { id: 'aus', city: 'Austin, TX', name: 'Austin', state: 'TX', region: 'CENTRAL', rank: 29, adults: 1020000, pop18: 1700000, impressions: 1074195 },
    { id: 'pit', city: 'Pittsburgh, PA', name: 'Pittsburgh', state: 'PA', region: 'NORTHEAST', rank: 30, adults: 1260000, pop18: 2100000, impressions: 648000 },
    { id: 'jax', city: 'Jacksonville, FL', name: 'Jacksonville', state: 'FL', region: 'SOUTH', rank: 31, adults: 720000, pop18: 1200000, impressions: 472500 },
    { id: 'grr', city: 'Grand Rapids, MI', name: 'Grand Rapids', state: 'MI', region: 'CENTRAL', rank: 32, adults: 450000, pop18: 750000, impressions: 715500 },
    { id: 'rsw', city: 'Ft. Myers, FL', name: 'Ft. Myers', state: 'FL', region: 'SOUTH', rank: 33, adults: 450000, pop18: 750000, impressions: 634500 },
    { id: 'bdl', city: 'Hartford, CT', name: 'Hartford', state: 'CT', region: 'NORTHEAST', rank: 34, adults: 540000, pop18: 900000, impressions: 540000 },
    { id: 'mci', city: 'Kansas City, MO', name: 'Kansas City', state: 'MO', region: 'CENTRAL', rank: 35, adults: 900000, pop18: 1500000, impressions: 675000 },
    { id: 'slc', city: 'Salt Lake City, UT', name: 'Salt Lake City', state: 'UT', region: 'WEST', rank: 36, adults: 660000, pop18: 1100000, impressions: 540000 },
    { id: 'cvg', city: 'Cincinnati, OH', name: 'Cincinnati', state: 'OH', region: 'CENTRAL', rank: 37, adults: 840000, pop18: 1400000, impressions: 607500 },
    { id: 'sat', city: 'San Antonio, TX', name: 'San Antonio', state: 'TX', region: 'CENTRAL', rank: 38, adults: 960000, pop18: 1600000, impressions: 742500 },
    { id: 'gsp', city: 'Greenville-Spartanburg, SC', name: 'Greenville-Spartanburg', state: 'SC', region: 'SOUTH', rank: 39, adults: 510000, pop18: 850000, impressions: 405000 },
    { id: 'mem', city: 'Memphis, TN', name: 'Memphis', state: 'TN', region: 'SOUTH', rank: 40, adults: 540000, pop18: 900000, impressions: 472500 },
    { id: 'pbi', city: 'West Palm Beach, FL', name: 'West Palm Beach', state: 'FL', region: 'SOUTH', rank: 41, adults: 600000, pop18: 1000000, impressions: 499500 },
    { id: 'las', city: 'Las Vegas, NV', name: 'Las Vegas', state: 'NV', region: 'WEST', rank: 42, adults: 960000, pop18: 1600000, impressions: 810000 },
    { id: 'sdf', city: 'Louisville, KY', name: 'Louisville', state: 'KY', region: 'SOUTH', rank: 43, adults: 510000, pop18: 850000, impressions: 432000 },
    { id: 'okc', city: 'Oklahoma City, OK', name: 'Oklahoma City', state: 'OK', region: 'CENTRAL', rank: 44, adults: 540000, pop18: 900000, impressions: 405000 },
    { id: 'abq', city: 'Albuquerque, NM', name: 'Albuquerque', state: 'NM', region: 'WEST', rank: 45, adults: 420000, pop18: 700000, impressions: 337500 },
    { id: 'pvd', city: 'Providence, RI', name: 'Providence', state: 'RI', region: 'NORTHEAST', rank: 46, adults: 570000, pop18: 950000, impressions: 450000 },
    { id: 'ric', city: 'Richmond, VA', name: 'Richmond', state: 'VA', region: 'SOUTH', rank: 47, adults: 510000, pop18: 850000, impressions: 432000 },
    { id: 'orf', city: 'Norfolk-Virginia Beach, VA', name: 'Norfolk-Virginia Beach', state: 'VA', region: 'SOUTH', rank: 48, adults: 600000, pop18: 1000000, impressions: 472500 },
    { id: 'msy', city: 'New Orleans, LA', name: 'New Orleans', state: 'LA', region: 'SOUTH', rank: 49, adults: 510000, pop18: 850000, impressions: 432000 },
    { id: 'buf', city: 'Buffalo, NY', name: 'Buffalo', state: 'NY', region: 'NORTHEAST', rank: 50, adults: 480000, pop18: 800000, impressions: 384750 },
];

/** Full state names, for the roll call's oversized display type. */
export const STATE_NAMES: Record<string, string> = {
    AZ: 'Arizona', CA: 'California', CO: 'Colorado', CT: 'Connecticut',
    DC: 'Washington DC', FL: 'Florida', GA: 'Georgia', IL: 'Illinois',
    IN: 'Indiana', KY: 'Kentucky', LA: 'Louisiana', MA: 'Massachusetts',
    MD: 'Maryland', MI: 'Michigan', MN: 'Minnesota', MO: 'Missouri',
    NC: 'North Carolina', NM: 'New Mexico', NV: 'Nevada', NY: 'New York',
    OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
    RI: 'Rhode Island', SC: 'South Carolina', TN: 'Tennessee', TX: 'Texas',
    UT: 'Utah', VA: 'Virginia', WA: 'Washington',
};

export interface StateGroup {
    state: string;
    /** Display name, e.g. "California". */
    label: string;
    region: Region;
    markets: Market[];
    /** Best (lowest) market rank in the group — drives the running order. */
    rank: number;
    adults: number;
    impressions: number;
}

/**
 * Markets grouped by state, ordered by each state's strongest market.
 *
 * This is what the roll call scrolls: 31 states rather than 50 cities. Eleven
 * of them hold more than one market (Florida has six, California and Texas four
 * each), which is exactly why the list is two levels — a state row on its own
 * has nothing to open.
 */
export const STATE_GROUPS: StateGroup[] = Object.values(
    MARKETS.reduce<Record<string, StateGroup>>((acc, m) => {
        const g = (acc[m.state] ??= {
            state: m.state,
            label: STATE_NAMES[m.state] ?? m.state,
            region: m.region,
            markets: [],
            rank: m.rank,
            adults: 0,
            impressions: 0,
        });
        g.markets.push(m);
        g.rank = Math.min(g.rank, m.rank);
        g.adults += m.adults;
        g.impressions += m.impressions;
        return acc;
    }, {})
).sort((a, b) => a.rank - b.rank);

/** Split the ordered list into region buckets, preserving rank order. */
export const MARKETS_BY_REGION = REGIONS.map((region) => ({
    region,
    markets: MARKETS.filter((m) => m.region === region),
}));

/** National totals shown in the section intro. */
export const TOTALS = {
    count: MARKETS.length,
    adults: MARKETS.reduce((s, m) => s + m.adults, 0),
    pop18: MARKETS.reduce((s, m) => s + m.pop18, 0),
    impressions: MARKETS.reduce((s, m) => s + m.impressions, 0),
};

/** 1,234,567 */
export const fmt = (n: number) => n.toLocaleString('en-US');

/** 83M / 1.2B — for headline figures where the exact digits don't help. */
export const compact = (n: number) =>
    n >= 1_000_000_000
        ? (n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 1) + 'B'
        : n >= 1_000_000
            ? Math.round(n / 1_000_000) + 'M'
            : n >= 1_000
                ? Math.round(n / 1_000) + 'K'
                : String(n);
