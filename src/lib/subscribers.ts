/**
 * The list of addresses that have already been notified about, so signing up
 * twice does not put a second identical email in the owner's inbox.
 *
 * ── READ THIS BEFORE DEPLOYING ──────────────────────────────────────────────
 * This is a JSON file on the local disk, which means it only actually works
 * where that disk survives. On a serverless host (Vercel, Netlify functions,
 * Lambda) it does NOT: the filesystem is read-only apart from /tmp, and /tmp is
 * per-instance and discarded when the instance is recycled. The guard would
 * still hold within one warm instance and quietly lapse everywhere else.
 *
 * That failure is deliberately harmless — a lapsed guard sends a duplicate
 * notification, it never loses a signup — but it is not the same as working.
 * On a serverless host this wants a real store (Vercel KV, Upstash, a table),
 * and the two functions at the bottom are the entire surface to reimplement.
 *
 * The file holds personal data. It is gitignored, and must stay that way.
 */

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export interface SubscriberRecord {
    /** As typed, so the owner sees what the person actually entered. */
    email: string;
    /** Lowercased — the value dedupe compares. */
    key: string;
    subscribedAt: string;
}

interface Store {
    version: 1;
    subscribers: SubscriberRecord[];
}

const EMPTY: Store = { version: 1, subscribers: [] };

/** Overridable so a host with one writable path can point at it. */
const FILE = process.env.SUBSCRIBERS_FILE || join(process.cwd(), 'data', 'subscribers.json');

/**
 * Case-insensitive only. Deliberately NOT clever about Gmail's dots or `+`
 * tags: treating `a.b@gmail.com` and `ab@gmail.com` as one address is right for
 * Gmail and wrong for most other providers, and being wrong here silently drops
 * a real person's signup.
 */
export const subscriberKey = (email: string): string => email.trim().toLowerCase();

/* ------------------------------------------------------------------ */
/*  Serialised access                                                  */
/* ------------------------------------------------------------------ */

/**
 * Read-modify-write is not atomic, so two overlapping signups could each read
 * the old list and the second write would drop the first. Every access goes
 * through one promise chain to make that impossible WITHIN this process.
 *
 * Across processes it is still possible, which is one more reason the note at
 * the top matters: multi-instance is exactly where this design stops holding.
 */
let queue: Promise<unknown> = Promise.resolve();

function serialise<T>(fn: () => Promise<T>): Promise<T> {
    const run = queue.then(fn, fn);
    // Swallow on the chain itself so one failure does not poison every caller after it.
    queue = run.catch(() => undefined);
    return run;
}

/**
 * `healthy` is false when the file exists but could not be understood.
 *
 * That distinction decides whether writing is safe. A missing file is an empty
 * list and writing it is correct. A corrupt or unreadable file might be a full
 * list that a bad deploy or a half-finished write mangled — overwriting it with
 * whatever we just parsed would turn a recoverable problem into data loss. So
 * when it is unhealthy we read as empty (signups still work, duplicates get
 * through) but refuse to write.
 */
async function load(): Promise<{ store: Store; healthy: boolean }> {
    let raw: string;
    try {
        raw = await readFile(FILE, 'utf8');
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
            return { store: { ...EMPTY, subscribers: [] }, healthy: true };
        }
        console.error('[subscribers] could not read the store:', err);
        return { store: { ...EMPTY, subscribers: [] }, healthy: false };
    }

    try {
        const parsed = JSON.parse(raw) as Partial<Store>;
        if (!Array.isArray(parsed.subscribers)) throw new Error('`subscribers` is not an array');
        return { store: { version: 1, subscribers: parsed.subscribers }, healthy: true };
    } catch (err) {
        console.error(`[subscribers] ${FILE} is not valid — refusing to overwrite it:`, err);
        return { store: { ...EMPTY, subscribers: [] }, healthy: false };
    }
}

/** Write to a sibling temp file and rename over the target. */
async function save(store: Store): Promise<void> {
    await mkdir(dirname(FILE), { recursive: true });
    const tmp = `${FILE}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(store, null, 2) + '\n', 'utf8');
    /* rename is atomic on the same filesystem, so a crash mid-write leaves the
       previous file intact rather than a truncated one. */
    await rename(tmp, FILE);
}

/* ------------------------------------------------------------------ */
/*  Public surface — the whole of it                                   */
/* ------------------------------------------------------------------ */

/** True when this address has already been notified about. */
export function isKnownSubscriber(email: string): Promise<boolean> {
    const key = subscriberKey(email);
    return serialise(async () => {
        const { store } = await load();
        return store.subscribers.some((s) => s.key === key);
    });
}

/**
 * Records the address. Call only AFTER the notification actually went out — if
 * a send fails, the address must stay unknown so the next attempt still works.
 *
 * Never throws. This is a de-duplication cache, not the system of record; the
 * owner's inbox is. Failing to append must not turn a delivered signup into an
 * error the visitor sees.
 */
// export function rememberSubscriber(email: string): Promise<void> {
//     const key = subscriberKey(email);
//     return serialise(async () => {
//         try {
//             const { store, healthy } = await load();
//             if (!healthy) return;
//             if (store.subscribers.some((s) => s.key === key)) return;

//             store.subscribers.push({ email: email.trim(), key, subscribedAt: new Date().toISOString() });
//             await save(store);
//         } catch (err) {
//             console.error('[subscribers] could not record the signup:', err);
//         }
//     });
// }
