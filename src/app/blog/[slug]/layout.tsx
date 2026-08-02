import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { POSTS, getPost } from '@/data/posts';

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

    return {
        title: `${post.title} — Advertising Wheels`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: [post.image],
            type: 'article',
            publishedTime: post.date,
            authors: [post.author.name],
        },
    };
}

export default async function ArticleLayout({ children, params }: Props) {
    const { slug } = await params;
    if (!getPost(slug)) notFound();

    return <>{children}</>;
}
