/**
 * SMTP transport + the contact-inquiry email.
 *
 * Every value comes from the environment — nothing about the mailbox is
 * committed. `getTransport` throws a readable error naming the missing variable
 * rather than letting nodemailer fail deep inside a socket, because the usual
 * way this breaks is a host that has the code deployed but not the env vars.
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

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
 * different fixes — one is "set the variables on the host", the other is "the
 * credentials or the connection are wrong" — so the route can report which.
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
 * Everything the mailbox needs. CONTACT_FROM_EMAIL is deliberately absent —
 * it falls back to SMTP_USER, so it is optional.
 */
const REQUIRED_KEYS = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'CONTACT_TO_EMAIL'] as const;

/**
 * Reports EVERY missing key at once.
 *
 * This must be called before anything else touches `process.env`, or the first
 * individual lookup throws and the operator gets told about one variable per
 * deploy — which is exactly what happened the first time this was written.
 */
function requireAll(keys: readonly string[]): Record<string, string> {
    const missing = keys.filter((k) => !process.env[k]);
    if (missing.length) throw new MailConfigError(missing);
    return Object.fromEntries(keys.map((k) => [k, process.env[k] as string]));
}

/**
 * Built lazily and cached on the module.
 *
 * Creating it at import time would run during `next build`, where the env vars
 * may legitimately not exist yet — that turns a missing secret into a failed
 * build instead of a failed request.
 */
let cached: Transporter | null = null;

export function getTransport(): Transporter {
    if (cached) return cached;

    const cfg = requireAll(REQUIRED_KEYS);
    const port = Number(process.env.SMTP_PORT ?? 587);

    cached = nodemailer.createTransport({
        host: cfg.SMTP_HOST,
        port,
        // 465 is implicit TLS; 587 starts plaintext and upgrades via STARTTLS.
        // Getting this backwards is the most common cause of a hang on connect.
        secure: port === 465,
        auth: {
            user: cfg.SMTP_USER,
            pass: cfg.SMTP_PASS,
        },
    });

    return cached;
}

const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function sendInquiry(data: Inquiry): Promise<void> {
    /* Validated FIRST, in one shot, so a host missing several variables is told
       about all of them at once. */
    const cfg = requireAll(REQUIRED_KEYS);
    const to = cfg.CONTACT_TO_EMAIL;
    /* The From address must be a mailbox on YOUR domain that the SMTP account is
       allowed to send as. Putting the visitor's address here instead is what
       gets contact forms classed as spoofing and dropped — their address goes in
       Reply-To, so hitting reply still answers them directly. */
    const from = process.env.CONTACT_FROM_EMAIL || cfg.SMTP_USER;

    const rows: [string, string][] = [
        ['Name', data.name],
        ['Company', data.company || '—'],
        ['Email', data.email],
        ['Phone', data.phone || '—'],
        ['Interested in', data.interest || '—'],
    ];

    const text =
        rows.map(([k, v]) => `${k}: ${v}`).join('\n') +
        `\n\nMessage:\n${data.message}\n`;

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

    await getTransport().sendMail({
        from: `"Advertising Wheels — Website" <${from}>`,
        to,
        replyTo: `"${data.name}" <${data.email}>`,
        subject: `Website inquiry — ${data.name}${data.company ? ` (${data.company})` : ''}`,
        text,
        html,
    });
}
