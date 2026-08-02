import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CASE_STUDIES, getCaseStudy } from '@/data/caseStudies';

/**
 * Server shell for the case-study detail route.
 *
 * The page itself is a client component (it runs GSAP), and a client component
 * cannot export `metadata` — so per-study SEO lives here, in the layout, which
 * stays on the server. Same split the other inner routes already use.
 */

interface Props {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}

/** Pre-render every known study at build time. */
export function generateStaticParams() {
    return CASE_STUDIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const study = getCaseStudy(slug);

    if (!study) return { title: 'Case study — Advertising Wheels' };

    return {
        title: `${study.brand} — Advertising Wheels case study`,
        description: study.summary,
        openGraph: {
            title: `${study.brand} — Advertising Wheels case study`,
            description: study.summary,
            images: [study.hero],
            type: 'article',
        },
    };
}

export default async function CaseStudyLayout({ children, params }: Props) {
    // Resolved here so an unknown slug 404s on the server rather than rendering
    // an empty client page.
    const { slug } = await params;
    if (!getCaseStudy(slug)) notFound();

    return <>{children}</>;
}
