'use client';

/**
 * CaseStudySection — the case-study carousel on its own pinned stage.
 *
 * This used to be the second half of SecondSection. It now stands alone so it
 * can sit later in the page (where the testimonials used to be), while the
 * marquee + testimonials keep the earlier pinned stage to themselves.
 *
 * The beats: the left intro wipes in → each card swings in from the right,
 * holds while its counters tick up, then banks away left → once the last card
 * clears, the intro wipes out and the closing CTA lands.
 */

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import CaseStudy from './CaseStudy';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function CaseStudySection() {
    const rootRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const q = gsap.utils.selector(rootRef.current);
            const cards = q('.cs-card') as HTMLElement[];
            const n = cards.length;
            if (!n) return;

            // ── Initial states ─────────────────────────────────────────────
            gsap.set(q('.cs-left'), { clipPath: 'inset(0% 0% 0% 100%)' });
            // Cards wait off-right, angled away in depth, under-scaled and blurred,
            // so each swings toward the viewer as it lands. The hinge is the right
            // edge — the side they arrive from.
            gsap.set(cards, {
                xPercent: 120,
                autoAlpha: 0,
                scale: 0.82,
                rotationY: -18,
                filter: 'blur(6px)',
                transformPerspective: 1200,
                transformOrigin: 'right center',
            });
            gsap.set(q('.cs-outro'), { autoAlpha: 0 });
            gsap.set(q('.cs-outro-item'), { y: 40, autoAlpha: 0 });

            cards.forEach((c) => {
                const s = c.querySelector('.cs-stats');
                if (s) gsap.set(s, { autoAlpha: 0, y: 60 });
                gsap.set(c.querySelector('.cs-media'), { clipPath: 'inset(0% 0% 0% 100%)', scale: 1.18 });
                gsap.set(c.querySelector('.cs-title'), { yPercent: 115 });
                const values = Array.from(c.querySelectorAll('.cs-values li')) as HTMLElement[];
                const labels = Array.from(c.querySelectorAll('.cs-labels li')) as HTMLElement[];
                gsap.set([...values, ...labels], { autoAlpha: 0 });
                values.forEach((v) => {
                    const raw = v.getAttribute('data-value') || '';
                    const prefix = (raw.match(/^[^\d]*/) || [''])[0];
                    const suffix = (raw.match(/[^\d]*$/) || [''])[0];
                    v.textContent = prefix + '0' + suffix;
                });
            });

            const tl = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'top top',
                    end: () => '+=' + window.innerHeight * (n + 3),
                    pin: true,
                    scrub: 1,
                    anticipatePin: 1,
                },
            });

            /** Counter panel: each row appears, and the number counts to target. */
            const revealStats = (stats: Element | null) => {
                if (!stats) return;
                const values = Array.from(stats.querySelectorAll('.cs-values li')) as HTMLElement[];
                const labels = Array.from(stats.querySelectorAll('.cs-labels li')) as HTMLElement[];
                tl.to(stats, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out' }, '+=0.05');
                values.forEach((v, r) => {
                    const label = labels[r];
                    const raw = v.getAttribute('data-value') || '';
                    const prefix = (raw.match(/^[^\d]*/) || [''])[0];
                    const suffix = (raw.match(/[^\d]*$/) || [''])[0];
                    const target = parseFloat(raw.replace(/[^\d.]/g, '')) || 0;
                    const comma = raw.includes(',');
                    const counter = { v: 0 };
                    tl.to(label ? [v, label] : [v], { autoAlpha: 1, duration: 0.35, ease: 'power2.out' }, r === 0 ? '<' : '<0.2')
                        .to(counter, {
                            v: target,
                            duration: 0.9,
                            ease: 'power1.out',
                            onUpdate: () => {
                                const nn = Math.round(counter.v);
                                v.textContent = prefix + (comma ? nn.toLocaleString('en-US') : String(nn)) + suffix;
                            },
                        }, '<');
                });
            };

            // ── The left intro wipes in ────────────────────────────────────
            tl.to(q('.cs-left'), { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power2.out' });

            // ── Card carousel: enter → stop → counters → out ───────────────
            for (let i = 0; i < n; i += 1) {
                const card = cards[i];
                tl.to(card, {
                    xPercent: 0,
                    autoAlpha: 1,
                    scale: 1,
                    rotationY: 0,
                    filter: 'blur(0px)',
                    duration: 0.7,
                    ease: 'power3.out',
                })
                    .to(card.querySelector('.cs-media'), {
                        clipPath: 'inset(0% 0% 0% 0%)',
                        scale: 1,
                        duration: 0.6,
                        ease: 'power2.out',
                    }, '<0.15')
                    .to(card.querySelector('.cs-title'), {
                        yPercent: 0,
                        duration: 0.5,
                        ease: 'power3.out',
                    }, '<0.1');

                revealStats(card.querySelector('.cs-stats'));

                tl.to(card, {
                    xPercent: -170,
                    autoAlpha: 0,
                    scale: 0.82,
                    rotationY: 18,
                    filter: 'blur(6px)',
                    duration: 0.6,
                    ease: 'power2.in',
                }, '+=0.1');
            }

            // ── The story closes: intro wipes away, closing CTA lands ──────
            tl.to(q('.cs-left'), { clipPath: 'inset(0% 100% 0% 0%)', duration: 0.5, ease: 'power2.in' }, '<0.1')
                .to(q('.cs-outro'), { autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, '+=0.1')
                .to(q('.cs-outro-item'), {
                    y: 0,
                    autoAlpha: 1,
                    duration: 0.5,
                    ease: 'power3.out',
                    stagger: 0.15,
                }, '<');
        },
        { scope: rootRef }
    );

    return (
        <div ref={rootRef} className="relative h-screen w-full overflow-hidden bg-[#EEE8D9] transition-colors duration-300 dark:bg-[#0A0A0A]">
            <CaseStudy />
        </div>
    );
}
