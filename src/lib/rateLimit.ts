/**
 * In-memory request throttling for route handlers.
 *
 * Deliberately modest, and the same bargain the contact route already makes:
 * this is a single-instance guard. It resets on deploy and does not coordinate
 * across instances, so it is not a defence against a distributed attack — it
 * costs nothing and stops the ordinary case, which is one bot hammering one
 * endpoint. If the site ever runs several instances and this starts mattering,
 * it wants Redis, not a bigger Map.
 *
 * A factory rather than a module-level Map, so each endpoint gets its OWN
 * bucket: signing up for the newsletter must not spend the allowance for
 * sending an inquiry.
 */

export interface RateLimiterOptions {
    windowMs: number;
    limit: number;
    /** Above this many tracked IPs, expired entries are swept. */
    maxKeys?: number;
}

/** Returns a predicate: `true` means this caller is over the limit. */
export function createRateLimiter({ windowMs, limit, maxKeys = 5000 }: RateLimiterOptions) {
    const hits = new Map<string, number[]>();

    return function rateLimited(ip: string): boolean {
        const now = Date.now();
        const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
        recent.push(now);
        hits.set(ip, recent);

        // Keep the map from growing without bound on a long-lived process.
        if (hits.size > maxKeys) {
            for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
        }

        return recent.length > limit;
    };
}

/**
 * Best-effort client address. Behind a proxy the socket address is the proxy,
 * so the forwarded headers are all there is — which also means a caller can
 * forge them. Fine for throttling, useless for anything security-bearing.
 */
export function clientIp(request: Request): string {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        'unknown'
    );
}
