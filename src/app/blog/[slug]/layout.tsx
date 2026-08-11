import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { POSTS, getPost } from '@/data/posts';
import { pageMetadata } from '@/lib/seo';

/**
 * Server shell for the article route — see the case-study layout for why the
 * metadata lives here rather than in the page (client components can't export
 * it).
 */

interface Props {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
    return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = getPost(slug);

    if (!post) return { title: 'Blog — Advertising Wheels' };

    /* `post.date` is a display string ("Jul 14, 2026"); article:published_time
       is supposed to be ISO 8601, so it is converted here rather than shipped
       as-is. An unparseable date drops the tag instead of emitting a malformed
       one. */
    const published = new Date(post.date);

    return pageMetadata({
        title: `${post.title} — Advertising Wheels`,
        description: post.excerpt,
        path: `/blog/${post.slug}`,
        image: post.image,
        imageAlt: post.title,
        type: 'article',
        publishedTime: Number.isNaN(published.getTime()) ? undefined : published.toISOString(),
        authors: [post.author.name],
    });
}

export default async function ArticleLayout({ children, params }: Props) {
    const { slug } = await params;
    if (!getPost(slug)) notFound();

    return <>{children}</>;
}
