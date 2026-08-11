/**
 * The site's canonical origin.
 *
 * Lives in one place because more than one thing has to agree on it — the
 * sitemap's `<loc>` entries and the `Sitemap:` line in robots.txt at minimum,
 * and canonical/OG tags whenever those get added. Two files each with their own
 * copy of the domain is how a sitemap ends up advertising URLs on a host that
 * redirects, which Search Console reports as an error rather than ignoring.
 *
 * `NEXT_PUBLIC_` because the value is not a secret and is useful client-side
 * too; the fallback is the real production domain, so a host that forgets to
 * set it still emits correct absolute URLs rather than `undefined/about`.
 */

const FALLBACK = 'https://advertisingwheels.com';

/** Tolerates a trailing slash or a bare hostname, both of which get pasted in. */
function normalise(raw: string): string {
    const trimmed = raw.trim().replace(/\/+$/, '');
    if (!trimmed) return FALLBACK;
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export const SITE_URL = normalise(process.env.NEXT_PUBLIC_SITE_URL || FALLBACK);

/**
 * Absolute URL for a site-relative path.
 *
 * `/` returns the bare origin with NO trailing slash: a sitemap entry has to
 * match the canonical URL exactly, and Next serves the home page at
 * `https://host` rather than `https://host/`.
 */
export function absoluteUrl(path: string): string {
    if (path === '/' || path === '') return SITE_URL;
    return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
