import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/siteUrl';
import { POSTS } from '@/data/posts';
import { CASE_STUDIES } from '@/data/caseStudies';

/**
 * sitemap.xml, served at /sitemap.xml.
 *
 * The two dynamic sections are derived from the SAME lists the routes
 * themselves read — `POSTS` for /blog/[slug], `CASE_STUDIES` for
 * /projects/[slug]. A hand-maintained URL list is the one kind of sitemap that
 * reliably rots: it keeps advertising posts that were renamed and silently
 * omits the ones added last week, and nothing in the build ever complains.
 */

/** Static routes, ordered by how much of the site's argument they carry. */
const STATIC_ROUTES: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
}> = [
    { path: '/', priority: 1.0, changeFrequency: 'monthly' },
    { path: '/services', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/projects', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/blog', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.7, changeFrequency: 'yearly' },
    { path: '/vendors', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.6, changeFrequency: 'yearly' },
    /* Kept in — they are legitimate pages and being absent from the sitemap
       looks like an omission — but weighted to the floor, because they should
       never compete with a service page for a query. */
    { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
];

/**
 * Post dates are display strings ("Jul 14, 2026"). `Date` parses that form, but
 * a typo would yield an Invalid Date and Next would serialise `<lastmod>` as
 * garbage — so an unparseable date drops the field rather than emitting one.
 * A missing `lastmod` is ignored by crawlers; a malformed one invalidates the
 * entry.
 */
function parsedDate(raw: string): Date | undefined {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? undefined : d;
}

export default function sitemap(): MetadataRoute.Sitemap {
    const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
        url: absoluteUrl(r.path),
        changeFrequency: r.changeFrequency,
        priority: r.priority,
    }));

    const postEntries: MetadataRoute.Sitemap = POSTS.map((p) => {
        const lastModified = parsedDate(p.date);
        return {
            url: absoluteUrl(`/blog/${p.slug}`),
            changeFrequency: 'monthly',
            priority: 0.6,
            ...(lastModified ? { lastModified } : {}),
        };
    });

    /* Case studies carry a `year`, not a date, so there is nothing precise
       enough to put in `lastmod`. Stamping the build time instead would tell
       crawlers every study changed on every deploy, which is worse than saying
       nothing — Google discounts a `lastmod` it catches lying. */
    const caseStudyEntries: MetadataRoute.Sitemap = CASE_STUDIES.map((c) => ({
        url: absoluteUrl(`/projects/${c.slug}`),
        changeFrequency: 'yearly',
        priority: 0.7,
    }));

    return [...staticEntries, ...postEntries, ...caseStudyEntries];
}
