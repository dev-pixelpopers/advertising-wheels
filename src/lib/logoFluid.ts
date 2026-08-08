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
 *   1. BOB — every mark rides its own sine, `sin(t * freq + phase) * amplitude`,
 *      on both axes plus a shallow roll. The amplitude is large while a wave is
 *      still flooding in (debris on a rising tide) and drops to a few pixels
 *      once it has settled.
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
 *      the heading or sits behind a card; released on an ease, so a mark that
 *      has flowed past one settles back rather than snapping.
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

/**
 * The idle float, `Math.sin(time * 2 + index * 0.5) * 15`. The index term is
 * what phase-offsets the field so it never pulses in unison; `phase` on the mark
 * itself desyncs the horizontal drift and the roll separately, so the three do
 * not share a period either.
 */
const IDLE_FREQ = 2;
const IDLE_AMP = 15;

/** Amplitudes at rest — just enough to breathe. */
const REST = { ampX: 6, rot: 1.4 };
/** Extra amplitude at full swell, i.e. while a wave is still flooding in. */
const SURGE = { ampX: 18, ampY: 30, rot: 5 };

/**
 * Colliders are a fraction of the artwork's box, not the box itself. These are
 * transparent PNGs with a lot of whitespace, so touching bounding boxes are
 * nowhere near touching marks; sizing the collider to the ink is what lets the
 * field pack wall-to-wall without looking like it overlaps.
 *
 * The WALLS are checked against the full box instead (see `bw`/`bh`), because a
 * mark pressed against the edge of the screen by a collider that ignores its
 * margins would hang over the edge and get clipped.
 */
const COLLIDER_X = 0.88;
const COLLIDER_Y = 0.82;

/**
 * The outward expansion force, in px of steady displacement. Modest, because the
 * timeline's target grid already does the filling — this only takes up the slack
 * where neighbour pressure has squeezed the field inward, and pins it against the
 * walls. Raise it and it starts fighting the authored targets.
 */
const OUTWARD = 14;

/** How much of a mutual overlap is resolved per pass. Low = soft, springy. */
const PRESSURE = 0.85;
const RELAX_PASSES = 8;

/** Easing applied to the soft offset, so pressure arrives as a swell. */
const SMOOTH = 0.2;

/** How fast a barrier lets go once a mark has flowed clear of it. */
const RELEASE = 0.1;

/** Ceiling on how far the soft part may carry a mark from its own position. */
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
    /** The barrier displacement carried between frames: hard in, eased out. */
    px: number;
    py: number;
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
       field is identical on every render and nothing shifts under hydration. */
    const marks: Mark[] = cfg.marks.map((m, i) => ({
        ...m,
        hw: 0,
        hh: 0,
        bw: 0,
        bh: 0,
        sx: 0,
        sy: 0,
        px: 0,
        py: 0,
        //freqX: 0.42 + (i % 5) * 0.055,
        freqX: 0.42 + (Math.random() * 0.2),
        // freqY: 0.61 + (i % 7) * 0.048,
        freqY: 0.61 + (Math.random() * 0.3),
        freqR: 0.33 + (Math.random() * 0.2),
        // freqR: 0.33 + (i % 4) * 0.06,
    }));

    const bars = cfg.obstacles
        .filter((o): o is FluidObstacle & { el: HTMLElement } => !!o.el)
        .map((o) => ({
            el: o.el,
            prefer: o.prefer,
            bias: o.bias ?? 0.5,
            pad: o.pad ?? 0,
            mql: o.media ? window.matchMedia(o.media) : null,
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
    const live: Bar[] = [];

    const measure = () => {
        for (const m of marks) {
            m.bw = m.body.offsetWidth / 2;
            m.bh = m.body.offsetHeight / 2;
            m.hw = m.bw * COLLIDER_X;
            m.hh = m.bh * COLLIDER_Y;
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

    const frame = (t: number) => {
        const sr = cfg.stage.getBoundingClientRect();

        // ── Barriers, converted to stage-local px ──────────────────────────
        live.length = 0;
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
                live.push({
                    l,
                    t: r.top - sr.top - b.pad,
                    r: rr,
                    b: r.bottom - sr.top + b.pad,
                    prefer: b.prefer,
                    bias: b.bias,
                });
            }
        }

        /* ── Where GSAP has each mark, plus its own sine ────────────────────
           `x`/`y` ARE the position — there is no CSS `left`/`top` under these
           marks, so whatever the timeline has tweened is the whole answer. */
        for (let i = 0; i < n; i += 1) {
            const m = marks[i];
            const sc = num(gsap.getProperty(m.outer, 'scaleX')) || 1;
            bx[i] = num(gsap.getProperty(m.outer, 'x'));
            by[i] = num(gsap.getProperty(m.outer, 'y'));
            hw[i] = m.hw * sc;
            hh[i] = m.hh * sc;
            bw[i] = m.bw * sc;
            bh[i] = m.bh * sc;

            const sw = m.wave === 1 ? swell.wave1 : swell.wave2;
            px[i] = bx[i] + Math.sin(t * m.freqX + m.phase) * (REST.ampX + sw * SURGE.ampX);
            py[i] = by[i] + Math.sin(t * IDLE_FREQ + i * 0.5) * (IDLE_AMP + sw * SURGE.ampY);

            /* Outward expansion. Every mark is pushed away from the middle of the
               stage, which is what drives the field into the corners and holds it
               against the walls. Without it the neighbour pressure below has no
               opponent and the field just relaxes inward into clumps, leaving the
               edges bare. */
            const ox = px[i] - sr.width / 2;
            const oy = py[i] - sr.height / 2;
            const ol = Math.sqrt(ox * ox + oy * oy) || 1;
            px[i] += (ox / ol) * OUTWARD;
            py[i] += (oy / ol) * OUTWARD;
        }

        // ── Neighbour pressure ────────────────────────────────────────────
        for (let pass = 0; pass < RELAX_PASSES; pass += 1) {
            for (let i = 0; i < n - 1; i += 1) {
                for (let j = i + 1; j < n; j += 1) {
                    const dx = px[j] - px[i];
                    const ox = hw[i] + hw[j] - Math.abs(dx);
                    if (ox <= 0) continue;
                    const dy = py[j] - py[i];
                    const oy = hh[i] + hh[j] - Math.abs(dy);
                    if (oy <= 0) continue;
                    // Relieve along whichever axis is the shorter way out.
                    if (ox < oy) {
                        const s = ((dx < 0 ? -1 : 1) * ox * PRESSURE) / 2;
                        px[i] -= s;
                        px[j] += s;
                    } else {
                        const s = ((dy < 0 ? -1 : 1) * oy * PRESSURE) / 2;
                        py[i] -= s;
                        py[j] += s;
                    }
                }
            }
        }

        // ── Ease the soft part, then resolve barriers hard, then write ─────
        for (let i = 0; i < n; i += 1) {
            const m = marks[i];

            let dx = px[i] - bx[i];
            let dy = py[i] - by[i];
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d > MAX_DRIFT) {
                dx = (dx / d) * MAX_DRIFT;
                dy = (dy / d) * MAX_DRIFT;
            }
            m.sx += (dx - m.sx) * SMOOTH;
            m.sy += (dy - m.sy) * SMOOTH;

            const ex = bx[i] + m.sx;
            const ey = by[i] + m.sy;

            /* How far out of every barrier this mark needs to be moved, measured
               from its eased position. Two passes so a mark squeezed out of one
               box is still pushed clear of the other. */
            let rx = 0;
            let ry = 0;
            for (let pass = 0; pass < 2; pass += 1) {
                for (let k = 0; k < live.length; k += 1) {
                    const bar = live[k];
                    const penL = ex + rx + hw[i] - bar.l;
                    if (penL <= 0) continue;
                    const penR = bar.r - (ex + rx - hw[i]);
                    if (penR <= 0) continue;
                    const penT = ey + ry + hh[i] - bar.t;
                    if (penT <= 0) continue;
                    const penB = bar.b - (ey + ry - hh[i]);
                    if (penB <= 0) continue;

                    // Shortest signed move out on each axis, then the weighting.
                    const mx = penL < penR ? -penL : penR;
                    const my = penT < penB ? -penT : penB;
                    const costX = Math.abs(mx) * (bar.prefer === 'x' ? bar.bias : 1);
                    const costY = Math.abs(my) * (bar.prefer === 'y' ? bar.bias : 1);
                    if (costX <= costY) rx += mx;
                    else ry += my;
                }
            }

            /* Hard on the way in, eased on the way out. Taking the push in full
               the frame contact begins is what makes a barrier impenetrable;
               dropping it just as abruptly when a mark flows clear would snap it
               back across the screen, so a shrinking push is released gradually
               instead. A reversal counts as new contact and is taken in full. */
            m.px = Math.abs(rx) > Math.abs(m.px) || rx * m.px < 0 ? rx : m.px + (rx - m.px) * RELEASE;
            m.py = Math.abs(ry) > Math.abs(m.py) || ry * m.py < 0 ? ry : m.py + (ry - m.py) * RELEASE;

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

            const g = gain.value;
            const sw = m.wave === 1 ? swell.wave1 : swell.wave2;
            const rot = Math.sin(t * m.freqR + m.phase) * (REST.rot + sw * SURGE.rot) * g;
            m.body.style.transform =
                `translate3d(${((cx - bx[i]) * g).toFixed(2)}px, ${((cy - by[i]) * g).toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg)`;
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
