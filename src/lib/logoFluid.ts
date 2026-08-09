/**
 * logoFluid — the water the logo field floats in.
 *
 * The stage is a sealed container: four rigid walls on the viewport edges plus
 * the heading as an island in the middle, filled to the brim. GSAP moves each
 * logo's OUTER element (the flood in, the stream upward, the impulse out); this
 * module owns a second, nested element and writes a per-frame offset onto it,
 * which is what makes the field behave like a fluid rather than like 23
 * independent tweens:
 *
 *   1. SWELL — one wave crossing the whole stage, `sin(ωt − k · position)`. The
 *      phase comes from where a mark IS rather than from its index, so
 *      neighbours move almost together and the field reads as a single surface
 *      instead of 23 things bobbing. The horizontal runs a quarter cycle ahead
 *      of the vertical, which puts every mark on a circular orbit rather than a
 *      straight up-and-down, and the roll follows the wave's slope. A per-mark
 *      chop is mixed in over the top so the surface is not a rigid sheet. The
 *      amplitude is large while a wave is still flooding in (debris on a rising
 *      tide) and settles to a float once it has landed.
 *   2. OUTWARD PRESSURE — a continuous force pushing every mark away from the
 *      centre of the stage. This is the difference between a layout and a fluid:
 *      it is what drives the field OUT into the corners and holds it pinned
 *      against the walls instead of letting it relax into clumps.
 *   3. NEIGHBOUR PRESSURE — overlapping colliders push each other apart, gently
 *      and symmetrically, a few relaxation passes per frame. Working against the
 *      outward force, this is what spreads the marks evenly rather than piling
 *      them all on the perimeter.
 *   4. BARRIERS — rectangles marks cannot enter. Applied at full strength the
 *      frame contact begins, so there is never a frame in which a logo overlaps
 *      the heading or sits behind a card; released on a spring, so water that a
 *      passing hull shouldered aside rushes back, overruns, and rocks to still.
 *      Which way a mark leaves a barrier is costed against the walls, so it goes
 *      around an obstacle it cannot get under.
 *   5. WALLS — and last the container itself, which is what a mark shoved by a
 *      barrier or by the outward force finally comes to rest against. The walls
 *      are tweenable: opening the top is how a sealed, brim-full field is
 *      allowed to start streaming upward.
 *
 * Splitting the transforms across two elements is deliberate: GSAP and this
 * solver would otherwise be writing the same `transform` and one would win.
 *
 * Nothing here is scroll-aware. It reads whatever GSAP has put on the outer
 * element and reacts to it, so the same solver covers the flood, the flow, and
 * the wipe without knowing which is happening.
 */

import gsap from 'gsap';

const TAU = Math.PI * 2;

/**
 * The swell's own clock. ONE frequency for the whole field, deliberately: a
 * travelling wave has a single period and varies by phase, not by rate. What
 * used to sit here was `sin(time * 2 + index * 0.5)` — one rate, but phased on
 * the array index, which is not a position. That gives every mark an arbitrary
 * slot in the cycle, and over a lattice it reads as a stadium wave running
 * through a grid rather than as water.
 */
const SWELL_FREQ = 2;

/**
 * Wavelength of that swell, counted in stage widths and heights.
 *
 * These are bounded from BOTH sides and the window is narrower than it looks.
 * Too low and the field converges on pulsing in unison, which is the thing the
 * spatial phase exists to avoid. Too high and the wave is under-sampled: the
 * pool is only about six marks across, so at much over one cycle per stage
 * neighbours land far enough apart in phase that the wave aliases and reads as
 * 23 marks bobbing randomly — the same failure as index phasing, arrived at from
 * the other direction.
 *
 * At 0.8 a row of six sits roughly 50° apart mark to mark, and a column roughly
 * 30°: close enough that neighbours visibly move together, far enough that the
 * stage still holds a crest and a trough at once.
 */
const WAVE_KX = 0.8;
const WAVE_KY = 0.45;

/**
 * How much of the motion is the coherent swell and how much is each mark's own
 * chop. All swell is a rigid sheet; all chop is 23 unrelated bobbers. The
 * surface wants to be mostly the former with enough of the latter to break it.
 */
const SWELL_MIX = 0.68;
/** The same split for the roll, between wave slope and each mark's own drift. */
const SLOPE_MIX = 0.7;

/**
 * Amplitudes at rest. Anisotropic on purpose — buoyancy is vertical, so a float
 * that travels further up and down than side to side reads as sitting IN
 * something. These are also several times what they were, because the rest
 * amplitude has to be a visible fraction of a cell (a mark is 20vw wide) or the
 * field settles into a legible arrangement and stops being water.
 */
const REST = { ampX: 13, ampY: 24, rot: 2 };
/** Extra amplitude at full swell, i.e. while a wave is still flooding in. */
const SURGE = { ampX: 18, ampY: 30, rot: 5 };

/**
 * Colliders, as a fraction of the DRAWN artwork — see `measure`, which derives
 * that from the image's own aspect ratio rather than from its box.
 *
 * These used to be 0.88 and 0.82 of the box, on the reasoning that the PNGs
 * carry a lot of transparent margin so touching boxes are nowhere near touching
 * marks. That holds for a mark whose height cap has bitten, where the picture
 * really is letterboxed inside a wider box. It is exactly wrong for every other
 * mark, where the box IS the picture — there the collider came out 18% shorter
 * than the ink, so two marks could sit with colliders barely apart and their
 * logos visibly overlapping. Which is what was happening.
 *
 * Just under 1 now, because the collider is measured against the artwork
 * itself, with GAP carrying the breathing room instead.
 */
const COLLIDER_X = 0.96;
const COLLIDER_Y = 0.94;

/** Clear space held around every mark, in px, on top of the collider. */
const GAP = 7;

/**
 * The outward expansion force, in px of steady displacement. Modest, because the
 * timeline's target grid already does the filling — this only takes up the slack
 * where neighbour pressure has squeezed the field inward, and pins it against the
 * walls. Raise it and it starts fighting the authored targets.
 */
const OUTWARD = 14;

/**
 * How much of a mutual overlap is resolved per pass. Low = soft, springy.
 *
 * Was 0.85, which is very nearly a full resolution in a single pass — and over
 * eight passes that makes the loop bang-bang rather than iterative. A stiff
 * solver on an over-packed field does not converge; it lands on a different
 * arrangement every frame, and because the sweep below is Gauss-Seidel the
 * arrangement it lands on depends on the order marks happen to be visited in.
 * Measured, that came out as ~0.5-0.8 accel-to-speed against ~0.04 for the
 * settled pool: the field was chattering, not floating.
 *
 * Lower per pass with the same pass count reaches the same answer, but reaches
 * it smoothly and lands on the same one two frames running.
 */
const PRESSURE = 0.55;
const RELAX_PASSES = 10;

/**
 * Fraction of a separation that is carried on the OTHER axis — the tangential
 * slip that stops contacts locking square.
 *
 * Minimum-translation resolution is a lattice builder. It only ever moves a pair
 * purely horizontally or purely vertically, so a field held under constant
 * outward pressure keeps getting nudged onto shared rows and columns until it
 * crystallises, which is most of why a settled pool reads as a grid. Letting a
 * little of each push run along the contact instead lets marks slide past one
 * another and settle offset. Kept well under 1 so the guarantee that a pair
 * actually separates is untouched.
 */
const SLIP = 0.22;

/** Easing applied to the soft offset, so pressure arrives as a swell. */
const SMOOTH = 0.14;

/**
 * How a barrier lets go once a mark has flowed clear of it.
 *
 * This was a plain exponential ease — a fixed fraction of the remaining push
 * shed per frame — which is the one return curve water never makes. It decays,
 * it never overshoots, and it is slowest exactly when the mark is nearly home,
 * so a mark released by a passing card creeps the last of the way back. That
 * reads as drifting, not as closing.
 *
 * A spring reads as water because water has mass: it is pushed aside, and when
 * the thing pushing it leaves, it rushes back, overruns, and rocks down to
 * still. Under-damped on purpose — SPRING sets how hard it snaps back, DAMP how
 * quickly the rocking dies. At these values the return takes about a third of a
 * second and shows two or three diminishing swings, which is the wake.
 */
const SPRING = 0.09;
const DAMP = 0.16;

/**
 * What it costs to leave a barrier on an axis that a wall has closed off.
 *
 * The walls are applied AFTER the barriers, so a wall silently wins every
 * argument between them: a mark shoved down out of a full-width card runs into
 * the floor, gets clamped back up, and ends up sitting inside the card it was
 * just pushed out of. That is not a near miss, it is a logo parked on a quote.
 *
 * Rather than reorder the two — barriers winning would let marks leave the
 * stage entirely — the escape route is costed. A direction that ends outside
 * the container is not forbidden, just made expensive enough that the other
 * axis wins whenever the other axis is open at all, so a mark with no room
 * below goes around the end instead of through the middle. High rather than
 * infinite, because when a barrier spans the stage and BOTH ways out are walled
 * there still has to be an answer, and the shortest one is the right one.
 */
const WALLED = 40;

/**
 * How much of the blade's travel the water ahead of it takes, per frame.
 *
 * 1 is a rigid sheet moving with the wiper and reads as a decal stuck to it.
 * Under 1 the field falls behind a little every frame, which is what puts the
 * bank in front of the blade and gives the pressure pass something to spread —
 * and it is why the field is still visibly water while it is being cleared
 * rather than a block sliding off. At 0.9 across a 1920px crossing the field
 * ends up about 190px behind the edge, which is most of a mark: enough to bunch,
 * not enough to be run over.
 */
const WIPE = 0.9;

/**
 * How far past MAX_DRIFT the spring may carry a mark, as a fraction of the
 * stage, once the blade owns the whole of it — see the cap in the write pass.
 *
 * This is what spreads the gathered bank, and it is deliberately the SPRING
 * doing it rather than anything permanent. An earlier attempt bled the standing
 * squeeze into the carried offset so the heap would "flow", which works for
 * about a second and then creeps: marks held in contact carry a permanent push,
 * and permanent push converted to permanent travel is a pump with no equilibrium
 * — measured, a heap parked mid-crossing went from 69% worst overlap to 91%
 * while nothing at all was happening. Gating it on blade speed, then on overlap,
 * moved the creep around without removing it, because the thing being converted
 * never goes away.
 *
 * A spring has an equilibrium by construction. It spreads the bank exactly as
 * hard as the bank is crowded, holds there, and lets go when the card does —
 * which is also what makes scrubbing back up work: the field springs home
 * instead of staying where it was pushed.
 */
const SPREAD = 0.8;

/**
 * Ceiling on how far the soft part may carry a mark from its own position.
 *
 * 300 is right for a pool at rest, where the soft part is swell and pressure
 * and nothing should be travelling far from its authored target. It is far too
 * tight for a mark in a gathered bank, which needs room to get clear of its
 * neighbours — at 300 the heap hit the cap and started overlapping instead of
 * spreading. The cap therefore opens with `cover`; see SPREAD. The blade's own
 * displacement is not subject to it at all, being carried separately.
 */
const MAX_DRIFT = 300;

export interface FluidObstacle {
    /** The barrier. Its live bounding box is re-read every frame, so it may move. */
    el: HTMLElement | undefined;
    /**
     * Which way a trapped mark should prefer to leave.
     *
     * Resolution is minimum-translation, but the preferred axis is weighted
     * BELOW 1, which makes it read as the cheaper route before it is literally
     * the shorter one. That is what turns a barrier into a shape the field
     * flows around in a particular way: `x` on the heading splits the marks
     * into left and right channels instead of damming them underneath, and `y`
     * on a card sends the upper marks over its top edge and the lower ones
     * under its bottom edge.
     *
     * The flip is progressive, not instant. First contact is still resolved on
     * whichever axis is genuinely shortest — a mark meeting the card's leading
     * edge is shoved along ahead of it — and only once the barrier has covered
     * enough of the mark does the preferred axis win and the mark slip around
     * the edge. The path that traces is the curve.
     */
    prefer: 'x' | 'y';
    /** Weight on the preferred axis. 1 = no preference, lower = stronger. */
    bias?: number;
    /**
     * Force every escape to ONE side, whatever the geometry says is shortest.
     *
     * Minimum translation is the right model for something a mark has to get
     * around. It is the wrong model for something advancing INTO the field: it
     * resolves each mark by the cheapest route at that instant, so a mark the
     * hull has half swallowed takes the short way out backwards and ends up
     * behind the card, and a mark deep under a full-width one slides the length
     * of its face looking for an edge. Both read as being dragged, which is what
     * they are.
     *
     * A hull does not negotiate with water; it displaces it forward. Naming the
     * direction turns the barrier into a BLADE, and a blade is not resolved with
     * the other barriers at all — see `wipeField`, which runs first and moves
     * marks outright rather than computing an escape for them, and the clamp at
     * the end of the write pass, which is only the guarantee that nothing is
     * ever drawn on top of it. What is left in the escape-costing loop below is
     * the negotiable kind of barrier: an island the field parts around.
     */
    push?: 'left' | 'right' | 'up' | 'down';
    /** Clearance around the box. Negative pulls the collider inside it. */
    pad?: number;
    /** Only a barrier while this query matches. */
    media?: string;
}

export interface FluidMark {
    /** GSAP's element. Read, never written. */
    outer: HTMLElement;
    /** This solver's element. Written, never read by anything else. */
    body: HTMLElement;
    wave: 1 | 2;
    /** Seconds of offset into the sine. Keeps the field off unison. */
    phase: number;
}

export interface LogoFluid {
    /**
     * Per-wave swell, 1 = riding the incoming wave, 0 = settled. A plain object
     * so a GSAP timeline can tween it alongside the entrance it belongs to.
     */
    swell: { wave1: number; wave2: number };
    /** Global authority. Tween to 0 to hand the field over to a hard impulse. */
    gain: { value: number };
    /**
     * The four walls, as insets in px from the stage edges. Live and tweenable:
     * the container is sealed while the field is at rest, and the top is opened
     * (a large negative inset) to let the field start streaming upward. Without
     * that, a brim-full container has nowhere to flow.
     */
    walls: { top: number; right: number; bottom: number; left: number };
    /** Re-take resting marks and collider sizes. Call on layout changes. */
    measure(): void;
    destroy(): void;
}

interface Mark extends FluidMark {
    /** Collider half-extents at scale 1 — neighbours and barriers. */
    hw: number;
    hh: number;
    /** Full box half-extents at scale 1 — the walls, so nothing gets clipped. */
    bw: number;
    bh: number;
    /** The eased soft offset carried between frames. */
    sx: number;
    sy: number;
    /**
     * ADVECTION — how far a hull has carried this mark from its authored target,
     * kept for good.
     *
     * The difference between water being displaced and water being leaned on.
     * Everything else the solver computes is a DEVIATION from `bx`/`by`: the
     * swell, the neighbour pressure, the outward force all read as "how far from
     * home is this mark", and all of them are pulled back toward zero the moment
     * whatever caused them stops. That is right for a pool at rest and wrong for
     * a pool with a hull in it — a mark shoved left by the card was still being
     * hauled back toward the target it started on, so it drifted right as fast as
     * the card drove it left, and the two fought for the whole crossing.
     *
     * This offset does not spring back. When the plough moves a mark, the move is
     * banked here and becomes part of where the mark now lives — pressure, walls
     * and swell all read from the carried position afterwards. The mark leaves
     * its place, which is what water does.
     */
    cax: number;
    cay: number;
    /** The barrier displacement carried between frames: hard in, sprung out. */
    px: number;
    py: number;
    /** …and its velocity, which is what lets the return overshoot. */
    vpx: number;
    vpy: number;
    freqX: number;
    freqY: number;
    freqR: number;
}

interface Bar {
    l: number;
    t: number;
    r: number;
    b: number;
    prefer: 'x' | 'y';
    bias: number;
    push?: 'left' | 'right' | 'up' | 'down';
    /** px this barrier's leading edge advanced since the last frame. */
    adv: number;
}

const num = (v: unknown) => {
    const f = parseFloat(v as string);
    return Number.isFinite(f) ? f : 0;
};

export function createLogoFluid(cfg: {
    /** The element resting marks are measured against — the pinned stage. */
    stage: HTMLElement;
    marks: FluidMark[];
    obstacles: FluidObstacle[];
    /**
     * Starting insets, px, for the four walls of the container. Zero puts a wall
     * flush with the viewport edge, which is what lets the field fill the screen
     * to the brim; `top` normally carries a value because the site header is
     * fixed over the stage and would slice anything pressed against it.
     *
     * Mutable afterwards via the handle's `walls`.
     */
    walls?: { top?: number; right?: number; bottom?: number; left?: number };
    /** False under reduced-motion: nothing is written and no ticker is added. */
    enabled?: boolean;
}): LogoFluid {
    const walls = {
        top: cfg.walls?.top ?? 0,
        right: cfg.walls?.right ?? 0,
        bottom: cfg.walls?.bottom ?? 0,
        left: cfg.walls?.left ?? 0,
    };
    const swell = { wave1: 1, wave2: 1 };
    const gain = { value: 1 };

    const n = cfg.marks.length;
    /* Frequencies are derived from the index rather than randomised, so the
       field is identical on every render and nothing shifts under hydration.
       `Math.random()` had been standing in here, which quietly broke that: the
       chop came out different on every reload, so no two visits to the section
       agreed and nothing about it was reproducible while tuning.

       The multipliers are irrational, not a modulus. `i % k` repeats every k
       marks, which drops whole groups of the field back onto a shared clock —
       the same unison problem the phase term above exists to avoid. These never
       line up and still spread evenly across the range. */
    const marks: Mark[] = cfg.marks.map((m, i) => ({
        ...m,
        hw: 0,
        hh: 0,
        bw: 0,
        bh: 0,
        sx: 0,
        sy: 0,
        cax: 0,
        cay: 0,
        px: 0,
        py: 0,
        vpx: 0,
        vpy: 0,
        freqX: 0.42 + ((i * 0.6180339887) % 1) * 0.2,
        freqY: 0.61 + ((i * 0.7548776662) % 1) * 0.3,
        freqR: 0.33 + ((i * 0.4142135624) % 1) * 0.2,
    }));

    const bars = cfg.obstacles
        .filter((o): o is FluidObstacle & { el: HTMLElement } => !!o.el)
        .map((o) => ({
            el: o.el,
            prefer: o.prefer,
            bias: o.bias ?? 0.5,
            push: o.push,
            pad: o.pad ?? 0,
            mql: o.media ? window.matchMedia(o.media) : null,
            /** Last frame's leading edge, for the wipe. NaN until first seen. */
            prev: NaN,
        }));

    // Scratch, reused every frame — this runs 60 times a second.
    const bx = new Float64Array(n);
    const by = new Float64Array(n);
    const hw = new Float64Array(n);
    const hh = new Float64Array(n);
    const bw = new Float64Array(n);
    const bh = new Float64Array(n);
    const px = new Float64Array(n);
    const py = new Float64Array(n);
    /* Each mark's orbit term, kept from the position pass so the write pass can
       roll it on the wave's slope without recomputing the phase. */
    const orb = new Float64Array(n);
    /**
     * Each mark's current outer scale, kept because the write pass has to divide
     * by it — see the transform at the end of `frame`.
     */
    const scl = new Float64Array(n);
    const live: Bar[] = [];
    /**
     * The ploughing subset of `live`, kept separately because ploughs are solved
     * WITH the neighbour pressure rather than after it — see the relaxation loop.
     */
    const ploughs: Bar[] = [];

    const measure = () => {
        for (const m of marks) {
            let w = m.body.offsetWidth;
            let h = m.body.offsetHeight;

            /* The box is not the picture. Every mark is `width: 20vw` with a
               `max-height` cap and `object-fit: contain`, so the drawn artwork
               is whatever fits inside that box at the image's own aspect ratio —
               which for a capped mark is a good deal narrower than the box, and
               for an uncapped one is exactly the box. Measuring the box and
               shrinking it by a constant therefore gets BOTH cases wrong in
               opposite directions, and the second case is the one that lets
               logos overlap.
               Re-deriving the contained size makes the collider the logo. */
            const img = Array.from(m.body.querySelectorAll('img')).find(
                (el) => el.naturalWidth > 0 && el.clientWidth > 0
            );
            if (img) {
                const k = Math.min(w / img.naturalWidth, h / img.naturalHeight);
                w = img.naturalWidth * k;
                h = img.naturalHeight * k;
            }

            m.bw = w / 2;
            m.bh = h / 2;
            m.hw = m.bw * COLLIDER_X + GAP;
            m.hh = m.bh * COLLIDER_Y + GAP;
        }
    };
    measure();

    if (cfg.enabled === false) {
        return { swell, gain, walls, measure, destroy: () => { } };
    }

    /* Artwork is lazy-loaded, so the first measure lands on zero-height boxes.
       Observing the bodies re-takes the colliders the moment each image gets its
       real size, and covers font swaps and resizes for free. Transforms do not
       trigger this, so the solver's own writes cannot feed it back. */
    const ro = new ResizeObserver(() => measure());
    marks.forEach((m) => ro.observe(m.body));

    /**
     * THE WIPE — the bead, and how it travels.
     *
     * Three pictures of this were tried and the first two are worth keeping,
     * because each is wrong in a way that looks like something.
     *
     * Displace EVERY mark by the blade's travel and the field crosses the screen
     * with its spacing intact. Nothing is ever gathered and nothing is ever
     * cleared; it reads as the page sliding sideways.
     *
     * Displace only what the blade is TOUCHING and the front rank gets out of
     * the way while the twenty marks behind it stand still and are compressed
     * into. That is a heap at 70% overlap: logos on top of logos, because
     * nothing told the water in front that the water behind it was coming.
     *
     * A squeegee does neither. The blade picks up what it meets, and what it has
     * picked up shoves what IT meets, and so on — the bead is a contact chain,
     * and the whole chain moves at the blade's speed. Water with clear space in
     * front of it does not move at all until the bead arrives. That is the two
     * passes below: seed from the blade, then flood along overlaps, and displace
     * everything the flood reached.
     *
     * It cannot creep, and that property is structural rather than tuned. Every
     * step is `bar.adv` — what the blade itself travelled this frame. Park the
     * scroll and `adv` is zero and the bead does not move; scrub back up and
     * `adv` is negative and it comes back. There is no reservoir of stored
     * pressure to leak, which is where three earlier attempts at this went: they
     * converted the standing squeeze between neighbours into travel, and a
     * standing squeeze never runs out, so the field kept dismantling itself
     * whenever it was left alone.
     *
     * The chain is whole-height regardless of the blade's own box: the card is
     * only painted across the middle band, but a wiper that cleared a stripe and
     * left the top and bottom standing is not a wipe.
     */
    const reached = new Uint8Array(n);
    const wipeField = () => {
        for (let k = 0; k < ploughs.length; k += 1) {
            const bar = ploughs[k];
            if (!bar.adv) continue;
            const horiz = bar.push === 'left' || bar.push === 'right';
            const fwd = bar.push === 'left' || bar.push === 'up';

            /**
             * A RETREATING blade releases everything it is holding, not just what
             * it can still touch.
             *
             * The forward chain is seeded from contact, and on the way back that
             * is the one thing the blade no longer has: it is retreating away from
             * a bank it pushed most of a screen, so nothing is touching it, so
             * nothing was released. Scrubbing up left the logos parked off the
             * left edge and then snapped them home in the last few frames when
             * the card finally cleared the stage altogether — the section played
             * beautifully downward and badly upward, which for a pinned scrub is
             * half the section broken.
             *
             * Water does not need to be touched to flow back. The bank was held
             * up by the blade, and when the blade goes the whole of it comes with
             * it, so a retreat releases every mark still carrying a displacement.
             * Clamped at zero, so nothing is dragged past where it started, and
             * marks that were never picked up are untouched either way.
             */
            if (bar.adv < 0) {
                const back = bar.adv * WIPE;
                for (let i = 0; i < n; i += 1) {
                    const m = marks[i];
                    if (horiz) { if (m.cax) m.cax = fwd ? Math.min(0, m.cax - back) : Math.max(0, m.cax + back); }
                    else if (m.cay) m.cay = fwd ? Math.min(0, m.cay - back) : Math.max(0, m.cay + back);
                }
                continue;
            }

            // Seed: everything the blade itself is in contact with.
            for (let i = 0; i < n; i += 1) {
                const m = marks[i];
                reached[i] = horiz
                    ? (fwd ? bx[i] + m.cax + hw[i] > bar.l : bx[i] + m.cax - hw[i] < bar.r) ? 1 : 0
                    : (fwd ? by[i] + m.cay + hh[i] > bar.t : by[i] + m.cay - hh[i] < bar.b) ? 1 : 0;
            }

            /* Flood along contacts, forward only. A mark joins the bead when
               something already in it overlaps it AND lies behind it — so the
               chain runs the way the blade is going and a mark never drags the
               water in front of it backwards. Bounded passes: 23 marks cannot
               chain deeper than that, and in practice it settles in three. */
            for (let pass = 0; pass < 6; pass += 1) {
                let added = 0;
                for (let i = 0; i < n; i += 1) {
                    if (!reached[i]) continue;
                    for (let j = 0; j < n; j += 1) {
                        if (reached[j] || i === j) continue;
                        const dx = bx[j] + marks[j].cax - (bx[i] + marks[i].cax);
                        const dy = by[j] + marks[j].cay - (by[i] + marks[i].cay);
                        if (Math.abs(dx) >= hw[i] + hw[j] || Math.abs(dy) >= hh[i] + hh[j]) continue;
                        const ahead = horiz ? (fwd ? dx < 0 : dx > 0) : fwd ? dy < 0 : dy > 0;
                        if (!ahead) continue;
                        reached[j] = 1;
                        added += 1;
                    }
                }
                if (!added) break;
            }

            const step = bar.adv * WIPE;
            for (let i = 0; i < n; i += 1) {
                if (!reached[i]) continue;
                const m = marks[i];
                if (horiz) m.cax = fwd ? Math.min(0, m.cax - step) : Math.max(0, m.cax + step);
                else m.cay = fwd ? Math.min(0, m.cay - step) : Math.max(0, m.cay + step);
            }
        }
    };

    const frame = (t: number) => {
        const sr = cfg.stage.getBoundingClientRect();

        // ── Barriers, converted to stage-local px ──────────────────────────
        live.length = 0;
        ploughs.length = 0;
        if (gain.value > 0.02) {
            for (const b of bars) {
                if (b.mql && !b.mql.matches) continue;
                // autoAlpha parks a barrier at 0 rather than removing it.
                if (num(gsap.getProperty(b.el, 'opacity')) < 0.08) continue;
                const r = b.el.getBoundingClientRect();
                if (r.width < 8 || r.height < 8) continue;
                const l = r.left - sr.left - b.pad;
                const rr = r.right - sr.left + b.pad;
                if (rr <= 0 || l >= sr.width) continue; // still off stage
                const t = r.top - sr.top - b.pad;
                const bb = r.bottom - sr.top + b.pad;
                /* How far the leading edge moved since the last frame, positive
                   in the direction of travel. Signed, deliberately — the whole
                   section is scrubbed, so scrolling back up has to un-wipe. */
                const edge = b.push === 'left' ? l : b.push === 'right' ? rr : b.push === 'up' ? t : bb;
                /* The wipe is an integral — it is the sum of every step the blade
                   took, not a function of where the blade is now. That is fine
                   while the section is scrolled through and wrong the moment it
                   is not: reload the page already halfway down the pin and the
                   first frame the blade is seen is halfway across, with no
                   history behind it, so nothing would ever have been wiped and
                   the field would be sitting on the cards. Seeding the first
                   frame from off-stage replays the crossing the reader did not
                   make, in one step. */
                const seed = b.push === 'left' ? sr.width : b.push === 'right' ? 0 : b.push === 'up' ? sr.height : 0;
                const prev = Number.isFinite(b.prev) ? b.prev : seed;
                const adv = b.push === 'left' || b.push === 'up' ? prev - edge : edge - prev;
                b.prev = edge;
                const bar: Bar = {
                    l,
                    t,
                    r: rr,
                    b: bb,
                    prefer: b.prefer,
                    bias: b.bias,
                    push: b.push,
                    adv,
                };
                live.push(bar);
                if (bar.push) ploughs.push(bar);
            }
        }

        /**
         * How much of the stage a hull has taken, 0 to 1 — and with it, how much
         * of the container's own authority is left.
         *
         * A sealed pool is held in shape by OUTWARD: a steady force pressing every
         * mark away from the middle and onto the walls, which is what stops the
         * field relaxing into clumps and leaving the edges bare. That force is a
         * restoring one, and while the card is crossing it is restoring marks
         * INTO the card — pushing the right-hand half of the field back toward
         * the very thing driving it left. The two cancel out to a mark that
         * neither leaves nor stays, which is the drift, and it is worst exactly
         * where it shows: the marks the leading edge is passing.
         *
         * So the container gives way as the hull fills it. There is less and less
         * pool for the outward force to hold in shape, and by the time the card
         * owns the stage there is none — the field is not a body of water being
         * kept against the walls any more, it is what the hull has pushed ahead of
         * it, and it is on its way off the left edge. Neighbour pressure is NOT
         * scaled with it: marks must still not overlap each other on the way out.
         */
        let cover = 0;
        for (let k = 0; k < ploughs.length; k += 1) {
            const bar = ploughs[k];
            if (bar.push === 'left') cover = Math.max(cover, (sr.width - bar.l) / sr.width);
            else if (bar.push === 'right') cover = Math.max(cover, bar.r / sr.width);
            else if (bar.push === 'up') cover = Math.max(cover, (sr.height - bar.t) / sr.height);
            else if (bar.push === 'down') cover = Math.max(cover, bar.b / sr.height);
        }
        cover = cover < 0 ? 0 : cover > 1 ? 1 : cover;
        const outward = OUTWARD * (1 - cover);

        /* ── Where GSAP has each mark ───────────────────────────────────────
           `x`/`y` ARE the position — there is no CSS `left`/`top` under these
           marks, so whatever the timeline has tweened is the whole answer.

           Read in a pass of its own because the wipe below needs every mark's
           box before it can decide which of them the bead has reached. */
        for (let i = 0; i < n; i += 1) {
            const m = marks[i];
            const sc = num(gsap.getProperty(m.outer, 'scaleX')) || 1;
            scl[i] = sc;
            bx[i] = num(gsap.getProperty(m.outer, 'x'));
            by[i] = num(gsap.getProperty(m.outer, 'y'));
            hw[i] = m.hw * sc;
            hh[i] = m.hh * sc;
            bw[i] = m.bw * sc;
            bh[i] = m.bh * sc;
        }

        wipeField();

        // ── …plus its own sine ─────────────────────────────────────────────
        for (let i = 0; i < n; i += 1) {
            const m = marks[i];

            const sw = m.wave === 1 ? swell.wave1 : swell.wave2;

            /* The swell's phase, taken from the mark's own position. `ωt − k · p`
               is a wave that TRAVELS: two marks side by side are a few degrees
               apart and rise together, marks a stage apart are in opposite phase.
               That spatial correlation is the whole difference between a surface
               and a crowd — and it is what a lattice cannot survive, because the
               row no longer shares a height at any instant. */
            const wp = (bx[i] / sr.width) * WAVE_KX * TAU + (by[i] / sr.height) * WAVE_KY * TAU;
            const wy = Math.sin(t * SWELL_FREQ - wp);
            /* A quarter cycle ahead of the rise. Water under a passing wave does
               not bob straight up and down — a particle travels a circle,
               forward over the crest and back through the trough — and running
               the horizontal on the cosine of the same phase is that orbit. */
            const wx = Math.cos(t * SWELL_FREQ - wp);
            orb[i] = wx;

            /* Chop, uncorrelated per mark, so the swell is not a rigid sheet.
               `freqY` finally does something: it was computed for every mark and
               never read, which is why the vertical had been running at one
               shared rate for all 23. */
            const cx = Math.sin(t * m.freqX + m.phase);
            const cy = Math.sin(t * m.freqY + m.phase);

            /* Everything below works from the CARRIED position, not the authored
               one — see `cax`. Once a hull has moved a mark, that is where the
               mark is, and the swell, the pressure and the walls all have to
               agree about it or they spend the crossing undoing it. */
            px[i] = bx[i] + m.cax + (wx * SWELL_MIX + cx * (1 - SWELL_MIX)) * (REST.ampX + sw * SURGE.ampX);
            py[i] = by[i] + m.cay + (wy * SWELL_MIX + cy * (1 - SWELL_MIX)) * (REST.ampY + sw * SURGE.ampY);

            /* Outward expansion. Every mark is pushed away from the middle of the
               stage, which is what drives the field into the corners and holds it
               against the walls. Without it the neighbour pressure below has no
               opponent and the field just relaxes inward into clumps, leaving the
               edges bare. */
            const ox = px[i] - sr.width / 2;
            const oy = py[i] - sr.height / 2;
            const ol = Math.sqrt(ox * ox + oy * oy) || 1;
            px[i] += (ox / ol) * outward;
            py[i] += (oy / ol) * outward;
        }

        /* ── Neighbour pressure, WITH the ploughs ───────────────────────────
           The ploughing barriers are solved in here rather than after, and that
           reordering is the fix for logos sitting on top of one another.

           Applied afterwards, a plough is a pin: it resolves each mark to
           exactly `bar.l − hw`, flush against the leading edge, measured from a
           position pressure had already settled. Every mark the hull had
           swallowed therefore landed on the SAME line whatever depth it was
           caught at, and pressure never saw that stack because pressure had
           finished running on the un-ploughed arrangement. It was separating a
           configuration that was not the one being drawn — measured, five pairs
           overlapping, the worst by 48% of a mark.

           Solved together, the edge simply becomes another contact: the marks
           against it push the ones behind them back, those separate in turn, and
           the bank grows leftward and fans out on its own. Nobody is pinned,
           because pressure is free to carry a mark further from the edge than
           the barrier asked for and nothing pulls it back. */
        const clampPloughs = (i: number) => {
            for (let k = 0; k < ploughs.length; k += 1) {
                const bar = ploughs[k];
                if (bar.push === 'left') {
                    const lim = bar.l - hw[i];
                    if (px[i] > lim && px[i] + hw[i] > bar.l && py[i] + hh[i] > bar.t && py[i] - hh[i] < bar.b) px[i] = lim;
                } else if (bar.push === 'right') {
                    const lim = bar.r + hw[i];
                    if (px[i] < lim && px[i] - hw[i] < bar.r && py[i] + hh[i] > bar.t && py[i] - hh[i] < bar.b) px[i] = lim;
                } else if (bar.push === 'up') {
                    const lim = bar.t - hh[i];
                    if (py[i] > lim && py[i] + hh[i] > bar.t && px[i] + hw[i] > bar.l && px[i] - hw[i] < bar.r) py[i] = lim;
                } else if (bar.push === 'down') {
                    const lim = bar.b + hh[i];
                    if (py[i] < lim && py[i] - hh[i] < bar.b && px[i] + hw[i] > bar.l && px[i] - hw[i] < bar.r) py[i] = lim;
                }
            }
        };

        for (let pass = 0; pass < RELAX_PASSES; pass += 1) {
            /* Alternate the sweep direction. A one-way Gauss-Seidel sweep biases
               the answer toward whichever end it starts from, and since the
               starting configuration shifts a little every frame the bias flips
               with it — which is a per-frame wobble the eased offset below then
               renders as jitter. Reversing on alternate passes cancels it. */
            const rev = (pass & 1) === 1;
            for (let a = 0; a < n - 1; a += 1) {
                const i = rev ? n - 2 - a : a;
                for (let j = i + 1; j < n; j += 1) {
                    const dx = px[j] - px[i];
                    const ox = hw[i] + hw[j] - Math.abs(dx);
                    if (ox <= 0) continue;
                    const dy = py[j] - py[i];
                    const oy = hh[i] + hh[j] - Math.abs(dy);
                    if (oy <= 0) continue;
                    /* Relieve along whichever axis is the shorter way out — that
                       is what guarantees the pair actually separates — and carry
                       SLIP of the same push along the contact, so the two slide
                       past each other rather than squaring up. See SLIP: without
                       it this loop is the field's crystalliser. */
                    if (ox < oy) {
                        const s = ((dx < 0 ? -1 : 1) * ox * PRESSURE) / 2;
                        px[i] -= s;
                        px[j] += s;
                        const ts = ((dy < 0 ? -1 : 1) * ox * PRESSURE * SLIP) / 2;
                        py[i] -= ts;
                        py[j] += ts;
                    } else {
                        const s = ((dy < 0 ? -1 : 1) * oy * PRESSURE) / 2;
                        py[i] -= s;
                        py[j] += s;
                        const ts = ((dx < 0 ? -1 : 1) * oy * PRESSURE * SLIP) / 2;
                        px[i] -= ts;
                        px[j] += ts;
                    }
                }
                if (ploughs.length) clampPloughs(i);
            }
            /* The last mark never gets an `i` of its own above — the pair loop
               stops at n-2 — so it would be the one mark the hull could swallow. */
            if (ploughs.length) clampPloughs(n - 1);
        }

        // ── Ease the soft part, then resolve barriers hard, then write ─────
        for (let i = 0; i < n; i += 1) {
            const m = marks[i];

            /* Measured from the carried position, so MAX_DRIFT still means what
               it says — a cap on swell and pressure, not on how far a hull is
               allowed to have carried this mark. */
            let dx = px[i] - bx[i] - m.cax;
            let dy = py[i] - by[i] - m.cay;
            /* The cap opens as the blade takes the stage. MAX_DRIFT is sized for
               a pool at rest, where nothing should be far from its authored
               place; a mark in a gathered heap has to be able to get clear of
               its neighbours, and at 300px it could not — the heap hit the cap
               and started overlapping instead of spreading. */
            const cap = MAX_DRIFT + cover * sr.width * SPREAD;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d > cap) {
                dx = (dx / d) * cap;
                dy = (dy / d) * cap;
            }
            m.sx += (dx - m.sx) * SMOOTH;
            m.sy += (dy - m.sy) * SMOOTH;

            const ex = bx[i] + m.cax + m.sx;
            const ey = by[i] + m.cay + m.sy;

            /* How far out of every barrier this mark needs to be moved, measured
               from its eased position. Two passes so a mark squeezed out of one
               box is still pushed clear of the other. */
            let rx = 0;
            let ry = 0;
            /* The container as this mark sees it, so the resolution below can
               tell an open escape route from one that ends in a wall. Only
               counts on an axis the walls actually govern — during the flood and
               the sweep the base is deliberately off stage and out of their
               jurisdiction, and a route that leaves the viewport is then exactly
               where the mark is supposed to be going. */
            const wallX = bx[i] > -1 && bx[i] < sr.width;
            const wallY = by[i] > -1 && by[i] < sr.height;
            const loX = walls.left + bw[i];
            const hiX = sr.width - walls.right - bw[i];
            const loY = walls.top + bh[i];
            const hiY = sr.height - walls.bottom - bh[i];

            for (let pass = 0; pass < 2; pass += 1) {
                for (let k = 0; k < live.length; k += 1) {
                    const bar = live[k];
                    /* Ploughs are not resolved here any more — they are solved
                       with the neighbour pressure above, where the field can
                       actually bank up in front of one. Resolving them here as
                       well would re-pin every mark to the leading edge and undo
                       it. What is left in this loop is the sprung, negotiable
                       kind of barrier: the heading, which the field parts
                       around and closes back over. */
                    if (bar.push) continue;
                    const penL = ex + rx + hw[i] - bar.l;
                    if (penL <= 0) continue;
                    const penR = bar.r - (ex + rx - hw[i]);
                    if (penR <= 0) continue;
                    const penT = ey + ry + hh[i] - bar.t;
                    if (penT <= 0) continue;
                    const penB = bar.b - (ey + ry - hh[i]);
                    if (penB <= 0) continue;

                    /* All FOUR ways out, costed, cheapest open one wins.

                       This used to reduce each axis to its shorter direction
                       first and only then compare the two, which throws away the
                       answer in exactly the case that matters: a mark under the
                       cards has a short way down and a long way up, so the short
                       one is chosen, and if the floor blocks it there is nothing
                       left to fall back to — the longer route over the top was
                       discarded before the walls were ever consulted. Keeping
                       all four alive means a mark that cannot fit beneath an
                       obstacle goes around the top of it instead of staying put.

                       The weighting is unchanged: the preferred axis is cheaper,
                       and a route ending outside the container is multiplied out
                       of contention — see WALLED. Written flat rather than as an
                       array of candidates because this runs 23 times a frame per
                       barrier and has no business allocating. */
                    const wx = bar.prefer === 'x' ? bar.bias : 1;
                    const wy = bar.prefer === 'y' ? bar.bias : 1;
                    const cL = penL * wx * (wallX && ex + rx - penL < loX ? WALLED : 1);
                    const cR = penR * wx * (wallX && ex + rx + penR > hiX ? WALLED : 1);
                    const cT = penT * wy * (wallY && ey + ry - penT < loY ? WALLED : 1);
                    const cB = penB * wy * (wallY && ey + ry + penB > hiY ? WALLED : 1);

                    let best = cL;
                    let pick = 0;
                    if (cR < best) { best = cR; pick = 1; }
                    if (cT < best) { best = cT; pick = 2; }
                    if (cB < best) { pick = 3; }

                    if (pick === 0) rx -= penL;
                    else if (pick === 1) rx += penR;
                    else if (pick === 2) ry -= penT;
                    else ry += penB;
                }
            }

            /* Hard on the way in, sprung on the way out. Taking the push in full
               the frame contact begins is what makes a barrier impenetrable, and
               a deepening push or a reversal both count as new contact — taken
               whole, with the spring's velocity cleared so the mark does not
               carry momentum from the last release into this one.

               A push that is only shrinking means the barrier is leaving, and
               that is where the spring runs: the mark rushes back toward where
               it belongs, overshoots, and rocks down to still. See SPRING/DAMP. */
            if (Math.abs(rx) > Math.abs(m.px) || rx * m.px < 0) {
                m.px = rx;
                m.vpx = 0;
            } else {
                m.vpx += (rx - m.px) * SPRING - m.vpx * DAMP;
                m.px += m.vpx;
            }
            if (Math.abs(ry) > Math.abs(m.py) || ry * m.py < 0) {
                m.py = ry;
                m.vpy = 0;
            } else {
                m.vpy += (ry - m.py) * SPRING - m.vpy * DAMP;
                m.py += m.vpy;
            }

            let cx = ex + m.px;
            let cy = ey + m.py;

            /* Last: the container. Checked against the mark's FULL box, not its
               collider, so a mark held against a wall sits flush with the edge
               rather than hanging over it.

               Only ever applied to a mark GSAP has parked INSIDE the stage —
               during the flood, and again during the impulse, the base position is
               deliberately off frame and the walls have no business dragging it
               back. That is also what lets the top wall be opened for the stream:
               once a mark's base has travelled above the stage it is out of the
               container's jurisdiction entirely. */
            if (bx[i] > -1 && bx[i] < sr.width) {
                const lo = walls.left + bw[i];
                const hi = sr.width - walls.right - bw[i];
                if (lo < hi) cx = cx < lo ? lo : cx > hi ? hi : cx;
            }
            if (by[i] > -1 && by[i] < sr.height) {
                const lo = walls.top + bh[i];
                const hi = sr.height - walls.bottom - bh[i];
                if (lo < hi) cy = cy < lo ? lo : cy > hi ? hi : cy;
            }

            /* The hull, last of all, and the only thing that outranks a wall.
               The pressure pass has already banked the field up in front of it,
               so on a settled frame this is a no-op; it earns its place on the
               fast ones, where the eased offset is a few frames behind the card
               and would otherwise let a leading edge travelling at speed catch
               up with a mark before the swell carried it clear. A clamp rather
               than a displacement, so it can only ever hold a mark at the edge —
               it has no state of its own to oscillate, which is what the sprung
               version above did when the card was on top of it. It also has to
               beat the walls: a mark pressed against the right wall by the
               outward force is a mark sitting on a quote. */
            for (let k = 0; k < ploughs.length; k += 1) {
                const bar = ploughs[k];
                if (bar.push === 'left' || bar.push === 'right') {
                    if (cy + bh[i] <= bar.t || cy - bh[i] >= bar.b) continue;
                    const lim = bar.push === 'left' ? bar.l - bw[i] : bar.r + bw[i];
                    const over = bar.push === 'left' ? cx - lim : lim - cx;
                    if (over > 0) { m.cax += bar.push === 'left' ? -over : over; cx = lim; }
                } else {
                    if (cx + bw[i] <= bar.l || cx - bw[i] >= bar.r) continue;
                    const lim = bar.push === 'up' ? bar.t - bh[i] : bar.b + bh[i];
                    const over = bar.push === 'up' ? cy - lim : lim - cy;
                    if (over > 0) { m.cay += bar.push === 'up' ? -over : over; cy = lim; }
                }
            }

            /* With no hull on the stage the carried offset lets go, slowly. The
               sweep normally gets there first, so this is what covers a resize or
               a scroll back up the section rather than anything the eye sees. */
            if (!ploughs.length) {
                m.cax -= m.cax * 0.04;
                m.cay -= m.cay * 0.04;
            }

            const g = gain.value;
            const sw = m.wave === 1 ? swell.wave1 : swell.wave2;
            /* Roll follows the SLOPE of the swell rather than a clock of its own.
               The slope of `sin(ωt − kx)` along x is `−cos(ωt − kx)`, which is
               the orbit term already in hand — so a mark on the leading face of a
               wave leans one way and one on the trailing face leans the other,
               and the tilt sweeps across the field with the crest instead of
               every mark rocking to its own beat. */
            const rot =
                (-orb[i] * SLOPE_MIX + Math.sin(t * m.freqR + m.phase) * (1 - SLOPE_MIX)) *
                (REST.rot + sw * SURGE.rot) *
                g;
            /**
             * Divided by the outer's scale, because the body is INSIDE it.
             *
             * Everything above this line works in stage pixels — the walls, the
             * colliders, the barrier edges are all read off `getBoundingClientRect`
             * — but the px written here are the body's own, and the body sits
             * under the outer's `scale(s)`. The browser multiplies them by s on
             * the way out, so a solver that asked for 200px of stage got 200·s of
             * it, and at the section's FLOW_SCALE of 0.65 that is a third of the
             * answer thrown away.
             *
             * Everything downstream of the solver was therefore short: the swell
             * shallower than it reads in the constants, marks not pushed clear of
             * the heading, and — the one that shows — the plough failing to keep
             * the field ahead of the card, because a clamp that says "no further
             * right than the hull's edge" only travelled 65% of the way there.
             * Measured against the drawn artwork, marks were sitting up to 200px
             * inside the card with the clamp nominally holding them out.
             *
             * Dividing here undoes the outer's scale and nothing else: the mark
             * still draws at its authored size, and the offset it draws at is the
             * one the solver actually computed.
             */
            const inv = scl[i] > 0.001 ? 1 / scl[i] : 1;
            m.body.style.transform =
                `translate3d(${((cx - bx[i]) * g * inv).toFixed(2)}px, ${((cy - by[i]) * g * inv).toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg)`;
        }
    };

    gsap.ticker.add(frame);

    return {
        swell,
        gain,
        walls,
        measure,
        destroy() {
            gsap.ticker.remove(frame);
            ro.disconnect();
            marks.forEach((m) => {
                m.body.style.transform = '';
            });
        },
    };
}
