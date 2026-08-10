/**
 * Has the intro already played in THIS browsing session?
 *
 * Session-scoped, not permanent. The preloader exists to cover the first paint
 * of a cold visit — fonts, the hero video, the hero's own timeline. Within a
 * session that work is cached, so replaying it every time someone clicks the
 * logo to come home is pure friction. A visitor returning next week loads cold
 * again, and that is exactly when the intro is worth watching, so the flag dies
 * with the tab rather than living in localStorage.
 *
 * The key is read in two places that must agree: the blocking script in the
 * document head (see `PreloaderGate`) and the homepage's own state. It lives
 * here so the two cannot drift apart.
 */
export const PRELOADER_SEEN_KEY = 'aw:preloader-seen';

/** Marks the root element, so CSS can hide the intro before React ever runs. */
export const PRELOADER_SEEN_ATTR = 'data-preloader-seen';

/**
 * Safe on the server and in privacy modes that throw on storage access —
 * Safari's "block all cookies" makes even reading sessionStorage a SecurityError,
 * and an exception here would take the whole homepage down with it. Failing to
 * `false` just means the intro plays, which is the harmless direction.
 */
export function hasSeenPreloader(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        return window.sessionStorage.getItem(PRELOADER_SEEN_KEY) === '1';
    } catch {
        return false;
    }
}

export function markPreloaderSeen(): void {
    if (typeof window === 'undefined') return;
    try {
        window.sessionStorage.setItem(PRELOADER_SEEN_KEY, '1');
    } catch {
        /* Private mode with storage disabled — the intro simply plays again. */
    }
    document.documentElement.setAttribute(PRELOADER_SEEN_ATTR, '1');
}
