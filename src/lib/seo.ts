import type { Metadata } from 'next';
import { absoluteUrl } from './siteUrl';

/**
 * Open Graph / Twitter metadata, built the same way on every route.
 *
 * A helper rather than hand-written blocks per page because the failure mode
 * for social tags is silence: nothing errors, nothing warns, the page just
 * shares as a bare link with no card. Tags that exist on five routes and are
 * missing on the sixth is the normal outcome of copying blocks around, and the
 * only way to notice is to paste every URL into a debugger by hand.
 */

export const SITE_NAME = 'Advertising Wheels';

/**
 * Fallback card image. 1920×994 — a 1.93:1 ratio, near enough to Open Graph's
 * ideal 1.91:1 that no platform crops anything meaningful, and PNG rather than
 * one of the .webp assets because X still renders WebP cards unreliably.
 */
const DEFAULT_IMAGE = '/assets/images/process/city.png';
const DEFAULT_IMAGE_SIZE = { width: 1920, height: 994 };
const DEFAULT_IMAGE_ALT = 'An Advertising Wheels truckside billboard on a city corridor';

export interface PageMetaInput {
    /** Also used verbatim as og:title — social cards get the page's own title. */
    title: string;
    description: string;
    /** Site-relative, e.g. '/services'. Becomes both og:url and the canonical. */
    path: string;
    /** Site-relative or absolute. Falls back to the site-wide card. */
    image?: string;
    imageAlt?: string;
    type?: 'website' | 'article';
    /** Only read when `type` is 'article'. */
    publishedTime?: string;
    authors?: string[];
}

/** Leaves an already-absolute URL alone; makes a site-relative path absolute. */
const toAbsolute = (src: string) => (/^https?:\/\//i.test(src) ? src : absoluteUrl(src));

export function pageMetadata({
    title,
    description,
    path,
    image,
    imageAlt,
    type = 'website',
    publishedTime,
    authors,
}: PageMetaInput): Metadata {
    const url = absoluteUrl(path);
    const usingDefault = !image;

    const images = [
        {
            url: toAbsolute(image ?? DEFAULT_IMAGE),
            alt: imageAlt ?? DEFAULT_IMAGE_ALT,
            /* Dimensions only for the image we control. Declaring a size for a
               post's own artwork would mean asserting something we have not
               measured — and a wrong og:image:width makes scrapers lay the card
               out against a shape the file does not have. */
            ...(usingDefault ? DEFAULT_IMAGE_SIZE : {}),
        },
    ];

    const shared = { title, description, url, siteName: SITE_NAME, locale: 'en_US', images };

    return {
        title,
        description,
        /* Every page declares its own canonical. Without one, the same page
           reached via a tracking query or a trailing slash is a separate URL to
           a crawler, splitting whatever authority it has. */
        alternates: { canonical: url },
        openGraph:
            type === 'article'
                ? { ...shared, type: 'article', publishedTime, authors }
                : { ...shared, type: 'website' },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: images.map((i) => i.url),
        },
    };
}
