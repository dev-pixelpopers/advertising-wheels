'use client';

/**
 * Cookie / storage notice.
 *
 * Deliberately NOT a modal. The site stores nothing non-essential before a
 * choice is made, so there is nothing to protect the visitor from while they
 * decide — blocking the page or trapping focus would be friction with no
 * purpose behind it. It is a labelled region that sits out of the way and can
 * be ignored, and either button dismisses it for good.
 *
 * Two things it has to avoid colliding with:
 *   1. The homepage intro. On a cold visit the preloader owns the screen and
 *      locks scroll; the notice waits for it to leave the DOM.
 *   2. The Hero's CTA buttons, which sit centred at the bottom of the first
 *      screen. Hence bottom-LEFT on desktop rather than a full-width bar.
 */

import { useEffect, useState } from 'react';
import { getConsent, setConsent, type Consent } from '@/lib/cookieConsent';

export default function CookieNotice() {
    /* Starts closed on both server and client so the markup matches during
       hydration; the effect opens it a moment later. Reading storage in the
       initialiser would render different HTML on the two sides. */
    const [open, setOpen] = useState(false);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        if (getConsent() !== null) return;

        let cancelled = false;
        let poll = 0;

        /* The intro is a real element in the server HTML (`data-preloader`, the
           same hook PreloaderGate's stylesheet uses). While it is present the
           page is covered and scroll is locked, so the notice holds off. */
        const introGone = () => !document.querySelector('[data-preloader]');

        const show = () => {
            if (!cancelled) setOpen(true);
        };

        const wait = () => {
            if (cancelled) return;
            if (introGone()) {
                // A beat after the intro clears, so it does not race the Hero's
                // opening animation for the visitor's attention.
                window.setTimeout(show, 900);
                return;
            }
            poll = window.setTimeout(wait, 250);
        };

        wait();
        return () => {
            cancelled = true;
            window.clearTimeout(poll);
        };
    }, []);

    function choose(value: Consent) {
        setConsent(value);
        setLeaving(true);
        // Matches the transition below; unmounts once it has played out.
        window.setTimeout(() => setOpen(false), 260);
    }

    if (!open) return null;

    return (
        <div
            role="region"
            aria-label="Cookie notice"
            className={[
                'fixed z-[120] bottom-4 left-4 right-4 sm:right-auto sm:max-w-[380px]',
                'rounded-[18px] border border-black/10 bg-[#EEE8D9]/95 p-5 backdrop-blur-md',
                'shadow-[0_18px_50px_-18px_rgba(0,0,0,0.45)]',
                'dark:border-white/12 dark:bg-[#141414]/95',
                'transition-all duration-[260ms] ease-out motion-reduce:transition-none',
                leaving ? 'translate-y-3 opacity-0' : 'aw-cookie-in',
            ].join(' ')}
        >
            <style>{`
                @keyframes aw-cookie-in {
                    from { transform: translateY(14px); opacity: 0; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
                .aw-cookie-in { animation: aw-cookie-in 320ms cubic-bezier(0.22,1,0.36,1) both; }
                @media (prefers-reduced-motion: reduce) {
                    .aw-cookie-in { animation: none; }
                }
            `}</style>

            <p className="font-tommy-bold text-[13px] uppercase tracking-[2px] text-[#C8992B] dark:text-[#FCD119]">
                Cookies
            </p>

            <p className="mt-2.5 font-tommy-regular text-[13.5px] leading-[1.6] text-[#4F4A42] dark:text-[#B7B2A8]">
                We use a small amount of browser storage to keep the site working — remembering your
                theme and not replaying the intro. We&apos;d also like your consent for analytics, to
                understand how the site is used. Read our{' '}
                <a
                    href="/privacy"
                    className="underline underline-offset-2 transition-colors hover:text-[#1A1917] dark:hover:text-white"
                >
                    Privacy Policy
                </a>
                .
            </p>

            <div className="mt-4 flex items-center gap-2.5">
                <button
                    type="button"
                    onClick={() => choose('accepted')}
                    className="rounded-full bg-[#1A1917] px-5 py-2.5 font-tommy-medium text-[13.5px] text-[#FCD119] transition-transform duration-200 hover:scale-[1.03] dark:bg-[#FCD119] dark:text-black"
                >
                    Accept
                </button>
                <button
                    type="button"
                    onClick={() => choose('declined')}
                    className="rounded-full border border-black/15 px-5 py-2.5 font-tommy-medium text-[13.5px] text-[#4F4A42] transition-colors duration-200 hover:border-black/35 hover:text-[#1A1917] dark:border-white/20 dark:text-[#B7B2A8] dark:hover:border-white/45 dark:hover:text-white"
                >
                    Decline
                </button>
            </div>
        </div>
    );
}
