import { PRELOADER_SEEN_ATTR, PRELOADER_SEEN_KEY } from '@/lib/preloaderSeen';

/**
 * Decides — BEFORE THE FIRST PAINT — whether the intro is allowed to show.
 *
 * Why a blocking script rather than a `useEffect`:
 *
 * The homepage is server-rendered, so the preloader's markup is in the HTML the
 * browser receives. That HTML paints as soon as it arrives, well before React
 * hydrates. A returning visitor who clicks the logo would therefore SEE the
 * intro for the gap between paint and hydration, and only then have it removed
 * — a flash, which is worse than the problem being fixed. `useLayoutEffect` is
 * no better; it cannot run before hydration either.
 *
 * A synchronous script in <head> runs before the body is painted at all. It
 * stamps the root element, and the CSS rule below hides the intro on the very
 * first frame. React then reads the same key and agrees.
 *
 * `suppressHydrationWarning` is already set on <html> in the layout, so
 * stamping the attribute here does not trip a mismatch.
 */
export default function PreloaderGate() {
    /* Kept deliberately tiny — it is parser-blocking, so every byte is delay.
       Wrapped in try/catch because Safari with all cookies blocked throws on
       sessionStorage access, and an exception in a head script is fatal. */
    const script = `try{if(sessionStorage.getItem(${JSON.stringify(
        PRELOADER_SEEN_KEY
    )})==="1")document.documentElement.setAttribute(${JSON.stringify(
        PRELOADER_SEEN_ATTR
    )},"1")}catch(e){}`;

    return (
        <>
            <script dangerouslySetInnerHTML={{ __html: script }} />
            <style
                dangerouslySetInnerHTML={{
                    __html: `html[${PRELOADER_SEEN_ATTR}="1"] [data-preloader]{display:none!important}`,
                }}
            />
        </>
    );
}
