'use client';

/**
 * Article detail — `/blog/[slug]`.
 *
 * Flow: hero with mask-revealed title and byline → clip-revealed lead image →
 * sticky-TOC article body with callouts → pull quote → pinned takeaways panel →
 * related reading → newsletter → footer.
 *
 * A reading-progress bar scrubs across the article element specifically, so it
 * tracks the read rather than the document (which would finish early, somewhere
 * around the related-posts rail).
 */

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import { Eyebrow, Dot, ArrowIcon, Rings } from '@/components/site/primitives';
import {
    ReadingProgress,
    StickyToc,
    ParallaxMedia,
    ArticleSection,
    BackLink,
    useScrollTriggerRefresh,
} from '@/components/site/detail';
import { getPost, relatedPosts, type Post } from '@/data/posts';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

function Hero({ post }: { post: Post }) {
    const rootRef = useRef<HTMLElement>(null);

    // On-mount entrance: a scroll trigger at the very top of the page would
    // already be past its start on load and never fire.
    useGSAP(
        () => {
            const q = gsap.utils.selector(rootRef);
            gsap.timeline({ defaults: { ease: 'power3.out' } })
                .from(q('[data-a-back]'), { y: 16, autoAlpha: 0, duration: 0.5 })
                .from(q('[data-a-meta]'), { y: 18, autoAlpha: 0, duration: 0.6 }, '<0.1')
                .from(q('[data-a-line]'), { yPercent: 108, duration: 0.95, stagger: 0.08, ease: 'power4.out' }, '<0.1')
                .from(q('[data-a-lead]'), { y: 24, autoAlpha: 0, duration: 0.7 }, '<0.4')
                .from(q('[data-a-by]'), { y: 18, autoAlpha: 0, duration: 0.6 }, '<0.1');
        },
        { scope: rootRef }
    );

    // Split the title so each line rides up out of its own mask.
    const words = post.title.split(' ');
    const mid = Math.ceil(words.length / 2);
    const lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];

    return (
        <section
            ref={rootRef}
            className="relative w-full overflow-hidden bg-[#EEE8D9] transition-colors duration-300"
        >
            <div className="pointer-events-none absolute -right-[20%] -top-[46%] opacity-80" aria-hidden="true">
                <Rings />
            </div>

            <div className="relative z-10 mx-auto max-w-[980px] px-6 pb-12 pt-[124px] md:px-12 md:pb-16 md:pt-[172px]">
                <div data-a-back className="mb-8">
                    <BackLink href="/blog">All articles</BackLink>
                </div>

                <div data-a-meta className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-[#FCD119] px-3.5 py-1.5 font-tommy-medium text-[11px] uppercase tracking-[1.5px] text-black">
                        {post.category}
                    </span>
                    <span className="font-tommy-regular text-[12.5px] text-[#6F6A60]">
                        {post.date}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-[#6F6A60] opacity-40" />
                    <span className="font-tommy-regular text-[12.5px] text-[#6F6A60]">
                        {post.read}
                    </span>
                </div>

                <h1 className="mt-7 font-tommy-bold text-[clamp(32px,5vw,68px)] leading-[1.03] tracking-[-0.03em] text-[#1A1917]">
                    {lines.map((line) => (
                        <span key={line} className="block overflow-hidden pb-[0.06em]">
                            <span data-a-line className="block">
                                {line}
                            </span>
                        </span>
                    ))}
                </h1>

                <p
                    data-a-lead
                    className="mt-7 font-tommy-regular text-[17px] leading-[1.72] text-[#4F4A42] md:text-[21px]"
                >
                    {post.lead}
                </p>

                <div
                    data-a-by
                    className="mt-9 flex items-center gap-4 border-t border-black/10 pt-7"
                >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#1A1917] font-tommy-bold text-[15px] text-[#FCD119]">
                        {post.author.name.charAt(0)}
                    </span>
                    <span>
                        <span className="block font-tommy-medium text-[15px] text-[#1A1917]">
                            {post.author.name}
                        </span>
                        <span className="block font-tommy-regular text-[13px] text-[#6F6A60]">
                            {post.author.role}
                        </span>
                    </span>
                </div>
            </div>

            <div className="relative z-10 mx-auto max-w-[1280px] px-6 pb-4 md:px-12">
                <ParallaxMedia src={post.image} alt="" height="h-[260px] md:h-[480px]" />
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Body                                                               */
/* ------------------------------------------------------------------ */

function Body({ post }: { post: Post }) {
    const toc = post.sections.map((s) => ({ id: s.id, nav: s.nav }));

    return (
        <section className="w-full bg-[#EEE8D9] py-14 transition-colors duration-300 md:py-20">
            <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-12 px-6 md:px-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-20">
                <aside className="order-2 lg:order-1">
                    <StickyToc items={toc} label="In this article" />
                </aside>

                <div id="post-article" className="order-1 min-w-0 lg:order-2">
                    {post.sections.map((s) => (
                        <ArticleSection key={s.id} id={s.id} heading={s.heading} body={s.body} callout={s.callout} />
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Quote                                                              */
/* ------------------------------------------------------------------ */

function Quote({ post }: { post: Post }) {
    const ref = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            gsap.from(ref.current?.querySelectorAll('[data-q]') ?? [], {
                y: 30,
                autoAlpha: 0,
                duration: 0.85,
                stagger: 0.12,
                ease: 'power3.out',
                scrollTrigger: { trigger: ref.current, start: 'top 82%', once: true },
            });
        },
        { scope: ref }
    );

    if (!post.quote) return null;

    return (
        <section
            ref={ref}
            className="w-full bg-[#EEE8D9] pb-6 transition-colors duration-300 md:pb-10"
        >
            <div className="mx-auto max-w-[900px] px-6 md:px-12">
                <blockquote
                    data-q
                    className="border-l-2 border-[#C8992B] pl-7 font-tommy-medium text-[clamp(20px,2.6vw,32px)] leading-[1.35] tracking-[-0.02em] text-[#1A1917]"
                >
                    {post.quote.text}
                </blockquote>
                <p data-q className="mt-5 pl-7 font-tommy-regular text-[13px] uppercase tracking-[2.5px] text-[#6F6A60]">
                    {post.quote.author}
                </p>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Takeaways — pinned                                                 */
/* ------------------------------------------------------------------ */

/**
 * Pinned summary. The panel holds while each takeaway resolves in turn; the
 * numeral fills as its row becomes the active one, which gives the pin an
 * obvious job rather than just holding still.
 *
 * Pinning is desktop-only — on a short viewport a pin this tall costs more than
 * it earns, so the rows simply stagger in on approach instead.
 */
function Takeaways({ post }: { post: Post }) {
    const rootRef = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            const q = gsap.utils.selector(rootRef);
            const rows = q('[data-tk-row]');
            if (!rows.length) return;

            const mm = gsap.matchMedia(rootRef);

            const build = (pin: boolean) => {
                const tl = gsap.timeline({
                    defaults: { ease: 'none' },
                    scrollTrigger: {
                        trigger: rootRef.current,
                        start: pin ? 'top top' : 'top 80%',
                        end: pin ? '+=' + window.innerHeight * 1.2 : 'bottom 65%',
                        pin,
                        scrub: 0.6,
                        invalidateOnRefresh: true,
                        refreshPriority: 1,
                    },
                });

                rows.forEach((row, i) => {
                    tl.fromTo(
                        row,
                        { autoAlpha: 0.25, x: -18 },
                        { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power2.out' },
                        i * 0.4
                    ).fromTo(
                        row.querySelector('[data-tk-bar]'),
                        { scaleX: 0 },
                        { scaleX: 1, duration: 0.5, transformOrigin: 'left center' },
                        i * 0.4
                    );
                });

                return () => tl.scrollTrigger?.kill();
            };

            mm.add('(min-width: 1024px)', () => build(true));
            mm.add('(max-width: 1023px)', () => build(false));
        },
        { scope: rootRef }
    );

    return (
        <section
            ref={rootRef}
            className="w-full bg-[#E7E0CE] py-20 transition-colors duration-300 md:py-28"
        >
            <div className="mx-auto max-w-[1100px] px-6 md:px-12">
                <Eyebrow>The short version</Eyebrow>
                <h2 className="mt-4 font-tommy-bold text-[clamp(28px,3.6vw,50px)] leading-[1.04] tracking-[-0.025em] text-[#1A1917]">
                    Four things to take away<Dot />
                </h2>

                <ol className="mt-12 space-y-7">
                    {post.takeaways.map((t, i) => (
                        <li key={t} data-tk-row className="relative pl-14">
                            <span className="absolute left-0 top-0 font-tommy-bold text-[15px] tabular-nums text-[#C8992B]">
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <p className="font-tommy-medium text-[17px] leading-[1.55] text-[#1A1917] md:text-[20px]">
                                {t}
                            </p>
                            <span
                                data-tk-bar
                                className="mt-5 block h-px w-full origin-left bg-black/15"
                            />
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Related + newsletter                                               */
/* ------------------------------------------------------------------ */

function Related({ slug }: { slug: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const items = relatedPosts(slug);

    useGSAP(
        () => {
            gsap.from(ref.current?.children ?? [], {
                y: 44,
                autoAlpha: 0,
                duration: 0.85,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
            });
        },
        { scope: ref }
    );

    if (!items.length) return null;

    return (
        <section className="w-full bg-[#EEE8D9] py-20 transition-colors duration-300 md:py-28">
            <div className="mx-auto max-w-[1280px] px-6 md:px-12">
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <h2 className="font-tommy-bold text-[clamp(26px,3vw,42px)] leading-[1.05] tracking-[-0.02em] text-[#1A1917]">
                        Keep reading<Dot />
                    </h2>
                    <Link
                        href="/blog"
                        className="group inline-flex items-center gap-2 font-tommy-medium text-[13px] uppercase tracking-[2px] text-[#1A1917] transition-colors duration-300 hover:text-[#C8992B]"
                    >
                        All articles <ArrowIcon />
                    </Link>
                </div>

                <div ref={ref} className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                    {items.map((p) => (
                        <Link
                            key={p.slug}
                            href={`/blog/${p.slug}`}
                            className="group flex flex-col overflow-hidden rounded-[20px] border border-black/10 bg-white/40 transition-colors duration-300 hover:border-[#C8992B]/40"
                        >
                            <div className="relative h-[170px] overflow-hidden">
                                <Image
                                    src={p.image}
                                    alt=""
                                    fill
                                    loading="lazy"
                                    sizes="(max-width: 768px) 100vw, 400px"
                                    className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                                />
                            </div>
                            <div className="flex flex-1 flex-col p-6">
                                <div className="flex items-center gap-3 font-tommy-regular text-[11px] uppercase tracking-[1.5px] text-[#8A857C]">
                                    <span className="text-[#C8992B]">{p.category}</span>
                                    <span className="h-1 w-1 rounded-full bg-current opacity-40" />
                                    <span>{p.read}</span>
                                </div>
                                <h3 className="mt-3 font-tommy-bold text-[19px] leading-[1.2] tracking-[-0.02em] text-[#1A1917]">
                                    {p.title}
                                </h3>
                                <p className="mt-3 font-tommy-regular text-[14px] leading-[1.62] text-[#5A554C]">
                                    {p.excerpt}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ArticleDetailPage() {
    const params = useParams<{ slug: string }>();
    const post = getPost(params?.slug ?? '');

    useScrollTriggerRefresh();

    if (!post) return null;

    return (
        // No header/footer here — the root layout renders both for every route.
        <>
            <ReadingProgress targetId="post-article" />

            <main className="w-full bg-[#EEE8D9] transition-colors duration-300">
                <Hero post={post} />
                <Body post={post} />
                <Quote post={post} />
                <Takeaways post={post} />
                <Related slug={post.slug} />
            </main>
        </>
    );
}
