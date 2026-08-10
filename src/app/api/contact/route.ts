import { NextResponse } from 'next/server';
import { sendInquiry, MailConfigError, type Inquiry } from '@/lib/mail';

/* Sending is now plain HTTPS to the Gmail API, so no TCP socket is needed —
   but the MIME builder works in Buffers, which is Node-only. Keep this on the
   Node runtime unless the message assembly is rewritten against Uint8Array. */
export const runtime = 'nodejs';
/* Never cached — this is a side effect, not a document. */
export const dynamic = 'force-dynamic';

const MAX = { name: 120, company: 160, email: 254, phone: 40, interest: 80, message: 5000 };

/**
 * In-memory rate limit: 5 submissions per IP per 10 minutes.
 *
 * Deliberately modest. This is a single-instance guard — it resets on deploy
 * and does not coordinate across instances — but it costs nothing and stops the
 * ordinary case, which is one bot hammering one endpoint. If the site ever runs
 * multiple instances and this starts mattering, it wants Redis, not a bigger Map.
 */
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    recent.push(now);
    hits.set(ip, recent);

    // Keep the map from growing without bound on a long-lived process.
    if (hits.size > 5000) {
        for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
    return recent.length > LIMIT;
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

export async function POST(request: Request) {
    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
    }

    /* Honeypot. A field hidden from humans that bots fill in anyway. Answer 200
       so the bot believes it succeeded and does not retry with a variation.

       LOGGED, because this branch discards a submission while telling the
       sender it worked. If the field ever starts catching real people — an
       autofill guessing at it, which is exactly what happened when it was
       named "website" — a silent drop is invisible and inquiries are lost
       with nothing to show for it. `body.website` is still checked so any
       page still serving the old field name keeps working. */
    if (str(body.aw_contact_ref) || str(body.website)) {
        console.warn('[contact] honeypot triggered — submission discarded');
        return NextResponse.json({ ok: true });
    }

    const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        'unknown';

    if (rateLimited(ip)) {
        return NextResponse.json(
            { error: 'Too many messages from this connection. Please try again shortly.' },
            { status: 429 }
        );
    }

    const data: Inquiry = {
        name: str(body.name),
        company: str(body.company),
        email: str(body.email),
        phone: str(body.phone),
        interest: str(body.interest),
        message: str(body.message),
    };

    /* Server-side validation. The form's `required` attributes are a courtesy to
       the person filling it in — they are absent entirely from a direct POST. */
    const errors: string[] = [];
    if (!data.name) errors.push('Name is required.');
    if (!data.email) errors.push('Email is required.');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) errors.push('That email address looks wrong.');
    if (!data.message) errors.push('Message is required.');

    for (const [field, max] of Object.entries(MAX)) {
        const v = data[field as keyof Inquiry];
        if (typeof v === 'string' && v.length > max) errors.push(`${field} is too long.`);
    }

    /* Header injection: a newline in a field that reaches a header (Reply-To
       carries the name and email) could append arbitrary headers. */
    if (/[\r\n]/.test(data.name) || /[\r\n]/.test(data.email)) errors.push('Invalid characters submitted.');

    if (errors.length) return NextResponse.json({ error: errors[0], errors }, { status: 400 });

    try {
        await sendInquiry(data);
        return NextResponse.json({ ok: true });
    } catch (err) {
        /* The visitor always gets the same generic sentence — the underlying
           detail names the mailbox and the OAuth client. `reason` is the one
           extra bit that leaves the server: WHICH kind of failure this was,
           never any value. Three cases, because each has a different fix:

             not_configured — the host is missing environment variables
             auth_failed    — the OAuth grant was rejected (revoked token, or an
                              app still in "Testing", where Google expires
                              refresh tokens after seven days)
             send_failed    — authorised, but Gmail refused the message

           Inferring this from response latency, the only option from outside,
           is miserable — that is how the last round was diagnosed. */
        let reason: 'not_configured' | 'auth_failed' | 'send_failed' = 'send_failed';

        if (err instanceof MailConfigError) {
            reason = 'not_configured';
            console.error('[contact] NOT CONFIGURED — missing on this host:', err.missing.join(', '));
        } else {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.startsWith('OAuth token request failed')) reason = 'auth_failed';
            console.error(`[contact] ${reason}:`, err);
        }

        return NextResponse.json(
            {
                error: 'We could not send your message. Please email BrandGrowth@AdvertisingWheels.com directly.',
                reason,
            },
            { status: 502 }
        );
    }
}
