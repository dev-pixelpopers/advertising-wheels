import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/siteUrl';

/**
 * robots.txt, served at /robots.txt.
 *
 * Generated rather than a static file in `public/` for one reason: a static
 * robots.txt is served identically by every deployment, and on a host that
 * builds preview URLs per branch (Vercel does) that means the staging copy of
 * the site invites crawlers in exactly as the real one does. Duplicate,
 * half-finished copies of a marketing site competing with it in search results
 * is a genuinely annoying problem to unwind after the fact, and the fix is one
 * environment check here.
 */

/**
 * `VERCEL_ENV` is checked FIRST and NODE_ENV only as a fallback, because
 * `next build` sets NODE_ENV to "production" for every deployment — preview
 * builds included. Testing NODE_ENV alone would mark previews indexable, which
 * is the exact case this guard exists for.
 *
 * Off Vercel (a VPS, a container) VERCEL_ENV is simply absent and NODE_ENV is
 * the right signal: production for a real build, development locally.
 */
const isProduction = process.env.VERCEL_ENV
    ? process.env.VERCEL_ENV === 'production'
    : process.env.NODE_ENV === 'production';

export default function robots(): MetadataRoute.Robots {
    /* Anything that is not the live site asks to be left alone entirely.
       Note this is a request, not access control — it keeps well-behaved
       crawlers out, and nothing else. A preview URL that must actually stay
       private needs deployment protection, not a robots rule. */
    if (!isProduction) {
        return {
            rules: { userAgent: '*', disallow: '/' },
        };
    }

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            /* The route handlers are side effects, not documents — there is
               nothing there to index, and they are POST-only besides. */
            disallow: ['/api/'],
        },
        /* Absolute by spec: `Sitemap:` is the one robots.txt directive that
           must carry a full URL, and it shares its origin with the sitemap's
           own entries via `siteUrl` so the two cannot drift apart. */
        sitemap: absoluteUrl('/sitemap.xml'),
    };
}
