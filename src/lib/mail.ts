/**
 * Contact-inquiry email, sent through the Gmail API using a Google service
 * account with domain-wide delegation.
 *
 * WHY THIS SHAPE
 * There is no refresh token and no consent screen. The service account holds an
 * RSA private key; we sign a short-lived JWT asserting "I am this service
 * account, acting as this mailbox", and Google exchanges it for an access token
 * good for an hour. That is the whole flow — a server-to-server grant with no
 * human in it, so nothing expires after seven days the way an unpublished
 * OAuth app's refresh token does.
 *
 * It is also plain HTTPS rather than SMTP, which matters on serverless: no
 * long-lived outbound TCP connection on port 587 to be throttled or blocked,
 * and no stored password equivalent to the mailbox.
 *
 * WHAT IT REQUIRES — this only works on Google Workspace, not consumer Gmail:
 *   1. Google Cloud → create a service account, add a JSON key, note its
 *      `client_email` and `client_id`, and enable the Gmail API.
 *   2. Workspace Admin → Security → Access and data control → API controls →
 *      Domain-wide delegation → add that numeric client_id with the single
 *      scope https://www.googleapis.com/auth/gmail.send
 *   3. GMAIL_SENDER must be a real mailbox in that Workspace domain. The
 *      service account impersonates it; without step 2 Google answers
 *      `unauthorized_client`.
 *
 * Scope is gmail.send only — the grant cannot read the mailbox.
 */

import { createSign } from 'node:crypto';
import MailComposer from 'nodemailer/lib/mail-composer';

export interface Inquiry {
    name: string;
    company?: string;
    email: string;
    phone?: string;
    interest?: string;
    message: string;
}

/**
 * Thrown when the mailbox is not configured at all, as opposed to configured
 * and rejected. The two are indistinguishable to a visitor but need completely
 * different fixes — "set the variables on the host" versus "the delegation is
 * wrong" — so the route can report which without leaking any value.
 */
export class MailConfigError extends Error {
    readonly missing: string[];
    constructor(missing: string[]) {
        super(`Missing environment variable(s): ${missing.join(', ')}`);
        this.name = 'MailConfigError';
        this.missing = missing;
    }
}

/**
 * CONTACT_FROM_EMAIL is deliberately absent — it is optional and falls back to
 * GMAIL_SENDER.
 */
const REQUIRED_KEYS = [
    'GOOGLE_SA_EMAIL',
    'GOOGLE_SA_PRIVATE_KEY',
    'GMAIL_SENDER',
    'CONTACT_TO_EMAIL',
] as const;

/**
 * Reports EVERY missing key at once.
 *
 * Must run before anything else reads `process.env`, or the first individual
 * lookup throws and the operator is told about one variable per deploy.
 */
function requireAll(keys: readonly string[]): Record<string, string> {
    const missing = keys.filter((k) => !process.env[k]);
    if (missing.length) throw new MailConfigError(missing);
    return Object.fromEntries(keys.map((k) => [k, process.env[k] as string]));
}

/* ------------------------------------------------------------------ */
/*  Signed JWT → access token                                          */
/* ------------------------------------------------------------------ */

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SEND_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
const SCOPE = 'https://www.googleapis.com/auth/gmail.send';
const JWT_GRANT = 'urn:ietf:params:oauth:grant-type:jwt-bearer';

const b64url = (input: Buffer | string): string =>
    (Buffer.isBuffer(input) ? input : Buffer.from(input))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

/**
 * Environment variables cannot hold real newlines on most hosts, so PEM keys
 * are pasted with the line breaks escaped as `\n`. Restoring them is required —
 * OpenSSL rejects a single-line PEM outright.
 */
function normalisePrivateKey(raw: string): string {
    let key = raw.trim();
    // Some dashboards additionally wrap the whole value in quotes.
    if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
        key = key.slice(1, -1);
    }
    return key.replace(/\\n/g, '\n');
}

/**
 * Access tokens last an hour. Cached across invocations of a warm serverless
 * instance so a busy period does not mint one per submission, and refreshed a
 * minute early so a token cannot expire in flight between check and send.
 */
let token: { value: string; expiresAt: number } | null = null;
const EXPIRY_SKEW_MS = 60_000;

async function getAccessToken(cfg: Record<string, string>): Promise<string> {
    if (token && Date.now() < token.expiresAt) return token.value;

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const claims = {
        iss: cfg.GOOGLE_SA_EMAIL,
        /* `sub` is the impersonation. Without it the service account has no
           mailbox of its own and Gmail has nothing to send from. */
        sub: cfg.GMAIL_SENDER,
        scope: SCOPE,
        aud: TOKEN_URL,
        iat: now,
        exp: now + 3600,
    };

    const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claims))}`;

    let signature: string;
    try {
        signature = b64url(
            createSign('RSA-SHA256').update(signingInput).sign(normalisePrivateKey(cfg.GOOGLE_SA_PRIVATE_KEY))
        );
    } catch (e) {
        /* Almost always a mangled PEM — the `\n` escapes were lost, or only the
           base64 body was pasted without the BEGIN/END lines. Say so plainly;
           the raw OpenSSL error is unhelpful. */
        throw new Error(
            `OAuth token request failed: GOOGLE_SA_PRIVATE_KEY could not be used to sign — ` +
                `check it is the full PEM including the BEGIN/END lines (${(e as Error).message})`
        );
    }

    const res = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: JWT_GRANT, assertion: `${signingInput}.${signature}` }),
    });

    const json = (await res.json().catch(() => ({}))) as {
        access_token?: string;
        expires_in?: number;
        error?: string;
        error_description?: string;
    };

    if (!res.ok || !json.access_token) {
        /* `unauthorized_client` means the delegation step was never done, or the
           scope registered in the Admin console does not match SCOPE exactly.
           `invalid_grant` usually means GMAIL_SENDER is not a real mailbox in
           the domain. Both are configuration, not code. */
        throw new Error(
            `OAuth token request failed (${res.status}): ${json.error ?? 'unknown'}` +
                (json.error_description ? ` — ${json.error_description}` : '')
        );
    }

    token = {
        value: json.access_token,
        expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000 - EXPIRY_SKEW_MS,
    };
    return token.value;
}

/** Discards the cached token — used to retry once on a 401. */
function invalidateToken(): void {
    token = null;
}

/* ------------------------------------------------------------------ */
/*  Message                                                            */
/* ------------------------------------------------------------------ */

const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function buildRawMessage(data: Inquiry, from: string, to: string): Promise<string> {
    const rows: [string, string][] = [
        ['Name', data.name],
        ['Company', data.company || '—'],
        ['Email', data.email],
        ['Phone', data.phone || '—'],
        ['Interested in', data.interest || '—'],
    ];

    const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n') + `\n\nMessage:\n${data.message}\n`;

    const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px">
      <h2 style="margin:0 0 4px;font-size:18px">New website inquiry</h2>
      <p style="margin:0 0 18px;color:#666;font-size:13px">advertisingwheels.com contact form</p>
      <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;border-collapse:collapse">
        ${rows
            .map(
                ([k, v]) =>
                    `<tr><td style="padding:7px 12px 7px 0;color:#666;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:7px 0">${esc(v)}</td></tr>`
            )
            .join('')}
      </table>
      <div style="margin-top:18px;padding-top:14px;border-top:1px solid #e5e5e5">
        <div style="color:#666;font-size:13px;margin-bottom:6px">Message</div>
        <div style="font-size:14px;line-height:1.6;white-space:pre-wrap">${esc(data.message)}</div>
      </div>
    </div>`;

    /* MIME assembly is reused from nodemailer rather than hand-rolled — it is
       already a dependency, and getting multipart boundaries and header
       encoding right by hand is a bug farm. Nothing is sent by this call; the
       composer only builds the bytes. */
    const built = await new MailComposer({
        from: `"Advertising Wheels — Website" <${from}>`,
        to,
        /* The visitor goes in Reply-To, never in From: sending AS them is
           spoofing and gets the message dropped. Reply still reaches them. */
        replyTo: `"${data.name}" <${data.email}>`,
        subject: `Website inquiry — ${data.name}${data.company ? ` (${data.company})` : ''}`,
        text,
        html,
    })
        .compile()
        .build();

    return b64url(built);
}

/* ------------------------------------------------------------------ */
/*  Send                                                               */
/* ------------------------------------------------------------------ */

export async function sendInquiry(data: Inquiry): Promise<void> {
    const cfg = requireAll(REQUIRED_KEYS);

    /* Must be GMAIL_SENDER itself or an alias that mailbox has verified under
       "Send mail as" — Gmail rejects anything else. */
    const from = process.env.CONTACT_FROM_EMAIL || cfg.GMAIL_SENDER;
    const raw = await buildRawMessage(data, from, cfg.CONTACT_TO_EMAIL);

    const post = async (accessToken: string) =>
        fetch(SEND_URL, {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ raw }),
        });

    let res = await post(await getAccessToken(cfg));

    /* One retry on 401. A cached token can be revoked mid-life, and the retry
       turns a hard failure into a hiccup. Only once — a second 401 is a real
       authorisation problem, not a stale token. */
    if (res.status === 401) {
        invalidateToken();
        res = await post(await getAccessToken(cfg));
    }

    if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Gmail API send failed (${res.status}): ${body.slice(0, 400)}`);
    }
}
