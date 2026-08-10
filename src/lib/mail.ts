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

function required(key: string): string {
    const v = process.env[key];
    if (!v) throw new Error(`Missing environment variable: ${key}`);
    return v;
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

    const port = Number(process.env.SMTP_PORT ?? 587);

    cached = nodemailer.createTransport({
        host: required('SMTP_HOST'),
        port,
        // 465 is implicit TLS; 587 starts plaintext and upgrades via STARTTLS.
        // Getting this backwards is the most common cause of a hang on connect.
        secure: port === 465,
        auth: {
            user: required('SMTP_USER'),
            pass: required('SMTP_PASS'),
        },
    });

    return cached;
}

const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function sendInquiry(data: Inquiry): Promise<void> {
    const to = required('CONTACT_TO_EMAIL');
    /* The From address must be a mailbox on YOUR domain that the SMTP account is
       allowed to send as. Putting the visitor's address here instead is what
       gets contact forms classed as spoofing and dropped — their address goes in
       Reply-To, so hitting reply still answers them directly. */
    const from = process.env.CONTACT_FROM_EMAIL ?? required('SMTP_USER');

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
