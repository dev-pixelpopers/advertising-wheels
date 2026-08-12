/**
 * The shell shared by /privacy and /terms.
 *
 * Deliberately plain: no GSAP, no scroll reveals, no hero. These pages are read
 * rather than experienced, and they have to render identically for a visitor, a
 * crawler and a regulator — including with JavaScript disabled. That is also why
 * there is no `'use client'` here: the text ships in the HTML unconditionally.
 */

import { ReactNode } from 'react';

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
    return (
        <section className="mt-12 first:mt-0">
            <h2 className="font-tommy-bold text-[22px] leading-[1.25] tracking-[-0.02em] text-[#1A1917] md:text-[27px]">
                {heading}
            </h2>
            <div className="mt-4 flex flex-col gap-4 font-tommy-regular text-[15px] leading-[1.75] text-[#5A554C] md:text-[16.5px]">
                {children}
            </div>
        </section>
    );
}

/** Bulleted list styled to match `LegalSection`'s body copy. */
export function LegalList({ items }: { items: ReactNode[] }) {
    return (
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-[#C8992B]">
            {items.map((item, i) => (
                <li key={i}>{item}</li>
            ))}
        </ul>
    );
}

export default function LegalPage({
    title,
    lastUpdated,
    intro,
    children,
}: {
    title: string;
    /** Rendered as given — keep it a plain date, not a relative one. */
    lastUpdated: string;
    intro: ReactNode;
    children: ReactNode;
}) {
    return (
        <main className="w-full bg-[#EEE8D9] ">
            <div className="mx-auto max-w-[1280px] px-6 pb-24 pt-[120px] md:px-12 md:pb-32 md:pt-[160px]">
                <div className="max-w-[74ch]">
                    <p className="font-tommy-regular text-[11px] uppercase tracking-[4px] text-[#8A857C] md:text-[13px]">
                        Legal
                    </p>
                    <h1 className="mt-4 font-tommy-bold text-[clamp(34px,5vw,62px)] leading-[1.02] tracking-[-0.03em] text-[#1A1917]">
                        {title}
                        <span className="text-[#C8992B]">.</span>
                    </h1>
                    <p className="mt-5 font-tommy-regular text-[13px] uppercase tracking-[2px] text-[#6F6A60]">
                        Last updated {lastUpdated}
                    </p>

                    <div className="mt-8 border-t border-black/10 pt-8 font-tommy-regular text-[16px] leading-[1.75] text-[#5A554C] md:text-[17.5px]">
                        {intro}
                    </div>

                    <div className="mt-4">{children}</div>
                </div>
            </div>
        </main>
    );
}
