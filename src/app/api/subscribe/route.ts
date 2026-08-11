import { NextResponse } from 'next/server';
import { sendSubscription, MailConfigError } from '@/lib/mail';
import { createRateLimiter, clientIp } from '@/lib/rateLimit';
import { isKnownSubscriber } from '@/lib/subscribers';

/* Same constraint as the contact route: the MIME builder works in Buffers,
   which is Node-only. */
export const runtime = 'nodejs';
/* Never cached — this is a side effect, not a document. */
export const dynamic = 'force-dynamic';

const MAX_EMAIL = 254;

/* Looser than the contact form's five, because subscribing is one field and a
   person legitimately retyping a typo should not be locked out. */
const rateLimited = createRateLimiter({ windowMs: 10 * 60 * 1000, limit: 8 });

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

export async function POST(request: Request) {
    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
    }

    /* Honeypot, same trick as the contact route: a field hidden from humans
       that bots fill in anyway. Answer 200 so the bot believes it worked and
       does not retry with a variation — but LOG it, because this branch throws
       a submission away while reporting success. If autofill ever starts
       guessing at the field, a silent drop is invisible and signups are lost
       with nothing to show for it. */
    if (str(body.aw_subscribe_ref)) {
        console.warn('[subscribe] honeypot triggered — submission discarded');
        return NextResponse.json({ ok: true });
    }

    if (rateLimited(clientIp(request))) {
        return NextResponse.json(
            { error: 'Too many attempts from this connection. Please try again shortly.' },
            { status: 429 }
        );
    }

    const email = str(body.email);

    /* Server-side validation. The input's `type="email"` and `required` are a
       courtesy to the person filling it in — both are absent from a direct POST. */
    if (!email) {
        return NextResponse.json({ error: 'Please enter your email address.' }, { status: 400 });
    }
    if (email.length > MAX_EMAIL) {
        return NextResponse.json({ error: 'That email address is too long.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        return NextResponse.json({ error: 'That email address looks wrong.' }, { status: 400 });
    }
    /* Header injection: the address reaches Reply-To, so a newline in it could
       append arbitrary headers. The regex above already rejects whitespace —
       this is the explicit belt to its braces. */
    if (/[\r\n]/.test(email)) {
        return NextResponse.json({ error: 'Invalid characters submitted.' }, { status: 400 });
    }

    /* Already on file — the owner has been told about this address once, and a
       second identical notification is noise. Answers exactly as a first-time
       signup does, deliberately: a different response would let anyone probe
       whether a given address is on the list.

       A store failure resolves to `false`, so the worst case is a duplicate
       notification rather than a signup that silently goes nowhere. */
    // if (await isKnownSubscriber(email)) {
    //     console.info('[subscribe] address already on file — no notification sent');
    //     return NextResponse.json({ ok: true });
    // }

    try {
        await sendSubscription(email);
        /* Recorded only now. If the send throws, the address stays unknown so
           the next attempt still reaches the owner. */
        // await rememberSubscriber(email);
        return NextResponse.json({ ok: true });
    } catch (err) {
        /* Mirrors the contact route: the visitor gets one generic sentence, and
           `reason` says which KIND of failure it was without leaking any value.
             not_configured — the host is missing environment variables
             auth_failed    — the OAuth grant was rejected
             send_failed    — authorised, but Gmail refused the message */
        let reason: 'not_configured' | 'auth_failed' | 'send_failed' = 'send_failed';

        if (err instanceof MailConfigError) {
            reason = 'not_configured';
            console.error('[subscribe] NOT CONFIGURED — missing on this host:', err.missing.join(', '));
        } else {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.startsWith('OAuth token request failed')) reason = 'auth_failed';
            console.error(`[subscribe] ${reason}:`, err);
        }

        return NextResponse.json(
            {
                error: 'We could not sign you up just now. Please email BrandGrowth@AdvertisingWheels.com instead.',
                reason,
            },
            { status: 502 }
        );
    }
}
