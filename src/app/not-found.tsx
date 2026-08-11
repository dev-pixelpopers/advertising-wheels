import type { Metadata } from 'next';
import Link from 'next/link';

/**
 * 404.
 *
 * Deliberately plain, for the same reason the legal pages are: no GSAP, no
 * scroll reveals, no `'use client'`. A visitor reaching this page has already
 * had one thing go wrong, and a 404 that needs to boot an animation runtime
 * before it can tell you where to go next is the wrong place to spend the
 * budget. The copy ships in the HTML.
 *
 * The root layout wraps this, so the header and footer come along on their own
 * — which is most of the recovery route right there. The links below are the
 * shortcuts for the two things someone who mistyped a URL is most likely after.
 */

/**
 * No `robots` here on purpose. Next already emits
 * `<meta name="robots" content="noindex">` for this file on its own — adding
 * our own produced two robots tags in the head saying the same thing.
 */
export const metadata: Metadata = {
    title: 'Page not found — Advertising Wheels',
    /**
     * `null` to DELETE the inherited canonical, not to skip setting one.
     *
     * Metadata cascades, so leaving this out does not mean "no canonical" — it
     * means this page keeps the root layout's, and every dead URL on the site
     * ends up announcing itself as a duplicate of the home page. Paired with
     * the automatic `noindex` above that is a contradiction aimed at the one
     * page least able to afford it.
     */
    alternates: { canonical: null },
};

/** The places worth offering someone who landed here by mistake. */
const SUGGESTIONS = [
    { label: 'Services', href: '/services', hint: 'What we run and how' },
    { label: 'Case studies', href: '/projects', hint: 'Measured campaign results' },
    { label: 'Blog', href: '/blog', hint: 'Insights from the road' },
];

export default function NotFound() {
    return (
        <main className="w-full bg-[#EEE8D9] transition-colors duration-300 dark:bg-[#0A0A0A]">
            <div className="mx-auto max-w-[1280px] px-6 pb-24 pt-[120px] md:px-12 md:pb-32 md:pt-[160px]">
                <div className="max-w-[62ch]">
                    <p className="font-tommy-regular text-[11px] uppercase tracking-[4px] text-[#8A857C] md:text-[13px] dark:text-[#9A968E]">
                        Error 404
                    </p>

                    <h1 className="mt-4 font-tommy-bold text-[clamp(38px,7vw,86px)] leading-[0.98] tracking-[-0.03em] text-[#1A1917] dark:text-white">
                        This route doesn&rsquo;t exist
                        <span className="text-[#C8992B] dark:text-[#FCD119]">.</span>
                    </h1>

                    <p className="mt-6 font-tommy-regular text-[15px] leading-[1.75] text-[#5A554C] md:text-[16.5px] dark:text-[#A8A399]">
                        The page you were after has moved, been renamed, or never existed. Nothing is
                        broken on your end — try one of these instead.
                    </p>

                    <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
                        <Link
                            href="/"
                            className="group flex items-center gap-2 rounded-full bg-[#1A1917] px-6 py-3 font-tommy-medium text-[15px] text-[#FCD119] transition-transform duration-300 hover:scale-[1.04] dark:bg-[#FCD119] dark:text-black"
                        >
                            Back to home
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 16 16"
                                fill="none"
                                aria-hidden="true"
                                className="transition-transform duration-300 group-hover:translate-x-1"
                            >
                                <path
                                    d="M1 8 H14 M9 3 L14 8 L9 13"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </Link>

                        <Link
                            href="/contact"
                            className="rounded-full border border-black/15 px-6 py-3 font-tommy-medium text-[15px] text-[#1A1917] transition-colors duration-300 hover:border-[#C8992B]/50 hover:text-[#C8992B] dark:border-white/20 dark:text-white dark:hover:border-[#FCD119]/50 dark:hover:text-[#FCD119]"
                        >
                            Talk to us
                        </Link>
                    </div>

                    <ul className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-[18px] border border-black/10 bg-black/10 sm:grid-cols-3 dark:border-white/10 dark:bg-white/10">
                        {SUGGESTIONS.map((s) => (
                            <li key={s.href}>
                                <Link
                                    href={s.href}
                                    className="group flex h-full flex-col justify-between gap-6 bg-[#EEE8D9] p-5 transition-colors duration-300 hover:bg-[#E7E0CE] dark:bg-[#0A0A0A] dark:hover:bg-white/[0.04]"
                                >
                                    <span className="font-tommy-regular text-[12.5px] leading-[1.5] text-[#6F6A60] dark:text-[#9A968E]">
                                        {s.hint}
                                    </span>
                                    <span className="flex items-center justify-between gap-3 font-tommy-bold text-[17px] tracking-tight text-[#1A1917] dark:text-white">
                                        {s.label}
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            aria-hidden="true"
                                            className="shrink-0 text-[#C8992B] transition-transform duration-300 group-hover:translate-x-1 dark:text-[#FCD119]"
                                        >
                                            <path
                                                d="M1 8 H14 M9 3 L14 8 L9 13"
                                                stroke="currentColor"
                                                strokeWidth="1.6"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </main>
    );
}
