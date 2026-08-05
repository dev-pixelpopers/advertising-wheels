/**
 * Client photography, one folder per client under
 * `public/assets/images/clients/<slug>/` — hero-NN.webp / fleet-NN.webp.
 *
 * GENERATED from the shoot originals (see `originals/Clients` at the repo
 * root, kept out of `public` and out of git). Every file here is a compressed
 * WebP derivative — EXIF-rotated, resized to 1920px (hero) / 1600px (fleet)
 * and re-encoded at q72 — so the paths are plain ASCII and need no
 * percent-encoding. Numbering follows the original alphabetical shoot order,
 * which is what keeps hand-picked frames (hero[0] per client, HOUSE_SHOTS)
 * stable across regenerations.
 *
 * HeroShots are the art-directed plates (the truck as the subject).
 * FleetShots are the on-route documentation — several per client, which is
 * what makes them work as a gallery run rather than single features.
 */

export interface ClientShots {
    /** Art-directed hero plates. */
    hero: string[];
    /** On-route fleet documentation. */
    fleet: string[];
}

export const CLIENT_SHOTS: Record<string, ClientShots> = {
    /* Dollar */
    'dollar': {
        hero: [
            '/assets/images/clients/dollar/hero-01.webp',
            '/assets/images/clients/dollar/hero-02.webp',
            '/assets/images/clients/dollar/hero-03.webp',
            '/assets/images/clients/dollar/hero-04.webp',
            '/assets/images/clients/dollar/hero-05.webp',
            '/assets/images/clients/dollar/hero-06.webp',
            '/assets/images/clients/dollar/hero-07.webp',
            '/assets/images/clients/dollar/hero-08.webp',
            '/assets/images/clients/dollar/hero-09.webp',
            '/assets/images/clients/dollar/hero-10.webp',
            '/assets/images/clients/dollar/hero-11.webp',
            '/assets/images/clients/dollar/hero-12.webp',
            '/assets/images/clients/dollar/hero-13.webp',
            '/assets/images/clients/dollar/hero-14.webp',
            '/assets/images/clients/dollar/hero-15.webp',
            '/assets/images/clients/dollar/hero-16.webp',
            '/assets/images/clients/dollar/hero-17.webp',
            '/assets/images/clients/dollar/hero-18.webp',
            '/assets/images/clients/dollar/hero-19.webp',
        ],
        fleet: [
            '/assets/images/clients/dollar/fleet-01.webp',
            '/assets/images/clients/dollar/fleet-02.webp',
            '/assets/images/clients/dollar/fleet-03.webp',
            '/assets/images/clients/dollar/fleet-04.webp',
            '/assets/images/clients/dollar/fleet-05.webp',
            '/assets/images/clients/dollar/fleet-06.webp',
            '/assets/images/clients/dollar/fleet-07.webp',
            '/assets/images/clients/dollar/fleet-08.webp',
            '/assets/images/clients/dollar/fleet-09.webp',
            '/assets/images/clients/dollar/fleet-10.webp',
            '/assets/images/clients/dollar/fleet-11.webp',
            '/assets/images/clients/dollar/fleet-12.webp',
            '/assets/images/clients/dollar/fleet-13.webp',
            '/assets/images/clients/dollar/fleet-14.webp',
            '/assets/images/clients/dollar/fleet-15.webp',
        ],
    },
    /* Floor & Decor */
    'floor-and-decor': {
        hero: [
            '/assets/images/clients/floor-and-decor/hero-01.webp',
            '/assets/images/clients/floor-and-decor/hero-02.webp',
            '/assets/images/clients/floor-and-decor/hero-03.webp',
            '/assets/images/clients/floor-and-decor/hero-04.webp',
            '/assets/images/clients/floor-and-decor/hero-05.webp',
            '/assets/images/clients/floor-and-decor/hero-06.webp',
        ],
        fleet: [
            '/assets/images/clients/floor-and-decor/fleet-01.webp',
            '/assets/images/clients/floor-and-decor/fleet-02.webp',
            '/assets/images/clients/floor-and-decor/fleet-03.webp',
            '/assets/images/clients/floor-and-decor/fleet-04.webp',
            '/assets/images/clients/floor-and-decor/fleet-05.webp',
        ],
    },
    /* Hertz */
    'hertz': {
        hero: [
            '/assets/images/clients/hertz/hero-01.webp',
            '/assets/images/clients/hertz/hero-02.webp',
            '/assets/images/clients/hertz/hero-03.webp',
            '/assets/images/clients/hertz/hero-04.webp',
            '/assets/images/clients/hertz/hero-05.webp',
        ],
        fleet: [
            '/assets/images/clients/hertz/fleet-01.webp',
            '/assets/images/clients/hertz/fleet-02.webp',
            '/assets/images/clients/hertz/fleet-03.webp',
            '/assets/images/clients/hertz/fleet-04.webp',
            '/assets/images/clients/hertz/fleet-05.webp',
            '/assets/images/clients/hertz/fleet-06.webp',
            '/assets/images/clients/hertz/fleet-07.webp',
            '/assets/images/clients/hertz/fleet-08.webp',
            '/assets/images/clients/hertz/fleet-09.webp',
            '/assets/images/clients/hertz/fleet-10.webp',
            '/assets/images/clients/hertz/fleet-11.webp',
        ],
    },
    /* Nationwide */
    'nationwide': {
        hero: [
            '/assets/images/clients/nationwide/hero-01.webp',
            '/assets/images/clients/nationwide/hero-02.webp',
        ],
        fleet: [
            '/assets/images/clients/nationwide/fleet-01.webp',
            '/assets/images/clients/nationwide/fleet-02.webp',
            '/assets/images/clients/nationwide/fleet-03.webp',
            '/assets/images/clients/nationwide/fleet-04.webp',
            '/assets/images/clients/nationwide/fleet-05.webp',
            '/assets/images/clients/nationwide/fleet-06.webp',
            '/assets/images/clients/nationwide/fleet-07.webp',
        ],
    },
    /* Outer */
    'outer': {
        hero: [
            '/assets/images/clients/outer/hero-01.webp',
            '/assets/images/clients/outer/hero-02.webp',
            '/assets/images/clients/outer/hero-03.webp',
            '/assets/images/clients/outer/hero-04.webp',
            '/assets/images/clients/outer/hero-05.webp',
            '/assets/images/clients/outer/hero-06.webp',
            '/assets/images/clients/outer/hero-07.webp',
            '/assets/images/clients/outer/hero-08.webp',
        ],
        fleet: [
            '/assets/images/clients/outer/fleet-01.webp',
            '/assets/images/clients/outer/fleet-02.webp',
            '/assets/images/clients/outer/fleet-03.webp',
            '/assets/images/clients/outer/fleet-04.webp',
            '/assets/images/clients/outer/fleet-05.webp',
            '/assets/images/clients/outer/fleet-06.webp',
            '/assets/images/clients/outer/fleet-07.webp',
            '/assets/images/clients/outer/fleet-08.webp',
            '/assets/images/clients/outer/fleet-09.webp',
        ],
    },
    /* Raising Cane's */
    'raising-canes': {
        hero: [
            '/assets/images/clients/raising-canes/hero-01.webp',
            '/assets/images/clients/raising-canes/hero-02.webp',
            '/assets/images/clients/raising-canes/hero-03.webp',
            '/assets/images/clients/raising-canes/hero-04.webp',
            '/assets/images/clients/raising-canes/hero-05.webp',
            '/assets/images/clients/raising-canes/hero-06.webp',
            '/assets/images/clients/raising-canes/hero-07.webp',
            '/assets/images/clients/raising-canes/hero-08.webp',
            '/assets/images/clients/raising-canes/hero-09.webp',
            '/assets/images/clients/raising-canes/hero-10.webp',
            '/assets/images/clients/raising-canes/hero-11.webp',
            '/assets/images/clients/raising-canes/hero-12.webp',
            '/assets/images/clients/raising-canes/hero-13.webp',
            '/assets/images/clients/raising-canes/hero-14.webp',
            '/assets/images/clients/raising-canes/hero-15.webp',
            '/assets/images/clients/raising-canes/hero-16.webp',
        ],
        fleet: [
            '/assets/images/clients/raising-canes/fleet-01.webp',
            '/assets/images/clients/raising-canes/fleet-02.webp',
            '/assets/images/clients/raising-canes/fleet-03.webp',
            '/assets/images/clients/raising-canes/fleet-04.webp',
            '/assets/images/clients/raising-canes/fleet-05.webp',
        ],
    },
    /* Reliable Heating & Cooling */
    'reliable-heating-cooling': {
        hero: [
            '/assets/images/clients/reliable-heating-cooling/hero-01.webp',
            '/assets/images/clients/reliable-heating-cooling/hero-02.webp',
            '/assets/images/clients/reliable-heating-cooling/hero-03.webp',
            '/assets/images/clients/reliable-heating-cooling/hero-04.webp',
            '/assets/images/clients/reliable-heating-cooling/hero-05.webp',
            '/assets/images/clients/reliable-heating-cooling/hero-06.webp',
            '/assets/images/clients/reliable-heating-cooling/hero-07.webp',
            '/assets/images/clients/reliable-heating-cooling/hero-08.webp',
            '/assets/images/clients/reliable-heating-cooling/hero-09.webp',
            '/assets/images/clients/reliable-heating-cooling/hero-10.webp',
            '/assets/images/clients/reliable-heating-cooling/hero-11.webp',
            '/assets/images/clients/reliable-heating-cooling/hero-12.webp',
            '/assets/images/clients/reliable-heating-cooling/hero-13.webp',
            '/assets/images/clients/reliable-heating-cooling/hero-14.webp',
            '/assets/images/clients/reliable-heating-cooling/hero-15.webp',
            '/assets/images/clients/reliable-heating-cooling/hero-16.webp',
            '/assets/images/clients/reliable-heating-cooling/hero-17.webp',
            '/assets/images/clients/reliable-heating-cooling/hero-18.webp',
            '/assets/images/clients/reliable-heating-cooling/hero-19.webp',
            '/assets/images/clients/reliable-heating-cooling/hero-20.webp',
            '/assets/images/clients/reliable-heating-cooling/hero-21.webp',
            '/assets/images/clients/reliable-heating-cooling/hero-22.webp',
            '/assets/images/clients/reliable-heating-cooling/hero-23.webp',
        ],
        fleet: [
            '/assets/images/clients/reliable-heating-cooling/fleet-01.webp',
            '/assets/images/clients/reliable-heating-cooling/fleet-02.webp',
            '/assets/images/clients/reliable-heating-cooling/fleet-03.webp',
            '/assets/images/clients/reliable-heating-cooling/fleet-04.webp',
            '/assets/images/clients/reliable-heating-cooling/fleet-05.webp',
            '/assets/images/clients/reliable-heating-cooling/fleet-06.webp',
            '/assets/images/clients/reliable-heating-cooling/fleet-07.webp',
            '/assets/images/clients/reliable-heating-cooling/fleet-08.webp',
            '/assets/images/clients/reliable-heating-cooling/fleet-09.webp',
            '/assets/images/clients/reliable-heating-cooling/fleet-10.webp',
            '/assets/images/clients/reliable-heating-cooling/fleet-11.webp',
        ],
    },
    /* Titan */
    'titan': {
        hero: [
            '/assets/images/clients/titan/hero-01.webp',
            '/assets/images/clients/titan/hero-02.webp',
            '/assets/images/clients/titan/hero-03.webp',
            '/assets/images/clients/titan/hero-04.webp',
        ],
        fleet: [
            '/assets/images/clients/titan/fleet-01.webp',
            '/assets/images/clients/titan/fleet-02.webp',
            '/assets/images/clients/titan/fleet-03.webp',
        ],
    },
    /* Wendy's */
    'wendys': {
        hero: [
            '/assets/images/clients/wendys/hero-01.webp',
            '/assets/images/clients/wendys/hero-02.webp',
            '/assets/images/clients/wendys/hero-03.webp',
            '/assets/images/clients/wendys/hero-04.webp',
            '/assets/images/clients/wendys/hero-05.webp',
            '/assets/images/clients/wendys/hero-06.webp',
            '/assets/images/clients/wendys/hero-07.webp',
            '/assets/images/clients/wendys/hero-08.webp',
            '/assets/images/clients/wendys/hero-09.webp',
            '/assets/images/clients/wendys/hero-10.webp',
            '/assets/images/clients/wendys/hero-11.webp',
        ],
        fleet: [
            '/assets/images/clients/wendys/fleet-01.webp',
            '/assets/images/clients/wendys/fleet-02.webp',
            '/assets/images/clients/wendys/fleet-03.webp',
            '/assets/images/clients/wendys/fleet-04.webp',
            '/assets/images/clients/wendys/fleet-05.webp',
            '/assets/images/clients/wendys/fleet-06.webp',
            '/assets/images/clients/wendys/fleet-07.webp',
            '/assets/images/clients/wendys/fleet-08.webp',
            '/assets/images/clients/wendys/fleet-09.webp',
            '/assets/images/clients/wendys/fleet-10.webp',
            '/assets/images/clients/wendys/fleet-11.webp',
            '/assets/images/clients/wendys/fleet-12.webp',
            '/assets/images/clients/wendys/fleet-13.webp',
            '/assets/images/clients/wendys/fleet-14.webp',
            '/assets/images/clients/wendys/fleet-15.webp',
            '/assets/images/clients/wendys/fleet-16.webp',
            '/assets/images/clients/wendys/fleet-17.webp',
            '/assets/images/clients/wendys/fleet-18.webp',
            '/assets/images/clients/wendys/fleet-19.webp',
            '/assets/images/clients/wendys/fleet-20.webp',
        ],
    },
    /* Xfinity */
    'xfinity': {
        hero: [
            '/assets/images/clients/xfinity/hero-01.webp',
            '/assets/images/clients/xfinity/hero-02.webp',
            '/assets/images/clients/xfinity/hero-03.webp',
            '/assets/images/clients/xfinity/hero-04.webp',
            '/assets/images/clients/xfinity/hero-05.webp',
            '/assets/images/clients/xfinity/hero-06.webp',
            '/assets/images/clients/xfinity/hero-07.webp',
            '/assets/images/clients/xfinity/hero-08.webp',
            '/assets/images/clients/xfinity/hero-09.webp',
            '/assets/images/clients/xfinity/hero-10.webp',
            '/assets/images/clients/xfinity/hero-11.webp',
            '/assets/images/clients/xfinity/hero-12.webp',
            '/assets/images/clients/xfinity/hero-13.webp',
            '/assets/images/clients/xfinity/hero-14.webp',
            '/assets/images/clients/xfinity/hero-15.webp',
            '/assets/images/clients/xfinity/hero-16.webp',
            '/assets/images/clients/xfinity/hero-17.webp',
            '/assets/images/clients/xfinity/hero-18.webp',
        ],
        fleet: [
            '/assets/images/clients/xfinity/fleet-01.webp',
            '/assets/images/clients/xfinity/fleet-02.webp',
            '/assets/images/clients/xfinity/fleet-03.webp',
            '/assets/images/clients/xfinity/fleet-04.webp',
            '/assets/images/clients/xfinity/fleet-05.webp',
            '/assets/images/clients/xfinity/fleet-06.webp',
            '/assets/images/clients/xfinity/fleet-07.webp',
            '/assets/images/clients/xfinity/fleet-08.webp',
            '/assets/images/clients/xfinity/fleet-09.webp',
            '/assets/images/clients/xfinity/fleet-10.webp',
        ],
    },
};

/** Shots for a case-study slug, if that client has a shoot folder. */
export const shotsFor = (slug: string): ClientShots | undefined => CLIENT_SHOTS[slug];

/**
 * Frames used OUTSIDE any one client's case study — the about hero, the
 * projects portal, the blog.
 *
 * These are chosen for composition, not for the brand on the wrap. Picked here
 * rather than inline so there is one place to see which client's photography
 * is doing double duty, and to swap it.
 */
export const HOUSE_SHOTS = {
    /** Wendy's — elevated view of a wrap parked at a retail centre (DJI_0768). */
    projectsHero: '/assets/images/clients/wendys/hero-01.webp',
    /** Wendy's — a wrap at speed on a multi-lane interstate (DSC06174). */
    highway: '/assets/images/clients/wendys/hero-03.webp',
};
