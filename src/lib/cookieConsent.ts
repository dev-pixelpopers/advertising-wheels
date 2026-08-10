/**
 * Cookie / storage consent.
 *
 * WHAT THE SITE ACTUALLY STORES TODAY — worth stating, because the banner's
 * wording has to stay true to it:
 *
 *   • sessionStorage `aw:preloader-seen` — stops the intro replaying within a
 *     browsing session. Dies with the tab.
 *   • localStorage  `theme`              — remembers light/dark choice.
 *   • localStorage  `aw:cookie-consent`  — this decision itself.
 *
 * There are no cookies, no analytics and no third-party trackers on the site at
 * the time of writing. All three items above are strictly functional, which
 * under GDPR/ePrivacy is the category that does NOT require consent — so the
 * banner is a notice, and the choice below exists to gate anything added later.
 *
 * When analytics IS added, gate it on `hasAnalyticsConsent()` and load nothing
 * until that returns true. Do not load it and then opt out; that is the exact
 * thing consent is meant to prevent.
 */

export const CONSENT_KEY = 'aw:cookie-consent';

export type Consent = 'accepted' | 'declined';

/**
 * Every access is wrapped. Safari with "block all cookies" throws a
 * SecurityError on localStorage even for a read, and an exception here would
 * take down whatever component asked — the same trap `preloaderSeen` documents.
 * Unknown is the safe answer: it shows the notice and withholds consent.
 */
export function getConsent(): Consent | null {
    if (typeof window === 'undefined') return null;
    try {
        const v = window.localStorage.getItem(CONSENT_KEY);
        return v === 'accepted' || v === 'declined' ? v : null;
    } catch {
        return null;
    }
}

export function setConsent(value: Consent): void {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
        /* Storage blocked — the notice will show again next visit, which is the
           harmless direction. Nothing non-essential is loaded either way. */
    }
    window.dispatchEvent(new CustomEvent('aw:consent', { detail: value }));
}

/** The gate for any future analytics/marketing script. */
export function hasAnalyticsConsent(): boolean {
    return getConsent() === 'accepted';
}
