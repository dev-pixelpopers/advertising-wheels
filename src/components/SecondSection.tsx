'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import CaseStudy from './CaseStudy';
import HomeMarquee from './HomeMarquee';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function SecondSection() {
    const rootRef = useRef<HTMLDivElement>(null);
    const marqueeRef = useRef<HTMLDivElement>(null);
    const caseRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const q = gsap.utils.selector(rootRef.current);
            const cards = q('.cs-card') as HTMLElement[];
            const n = cards.length;
            if (!n) return;

            // ── Initial states ─────────────────────────────────────────────
            // CaseStudy waits off to the right.
            gsap.set(caseRef.current, { xPercent: 100 });
            // Marquee content is clipped away (wipes in from the right).
            gsap.set(q('.hm-heading, .hm-row1, .hm-row2'), { clipPath: 'inset(0% 0% 0% 100%)', opacity: 0 });
            // CaseStudy left text clipped away; cards wait off-right; counters hidden.
            gsap.set(q('.cs-left'), { clipPath: 'inset(0% 0% 0% 100%)' });
            // All cards wait off-right — none pre-shown, so the left text reveals first.
            // They also sit angled away in depth, under-scaled and blurred, so each one
            // swings toward the viewer as it lands rather than sliding in flat. The hinge
            // is the right edge, the side they arrive from.
            gsap.set(cards, {
                xPercent: 120,
                autoAlpha: 0,
                scale: 0.82,
                rotationY: -18,
                filter: 'blur(6px)',
                transformPerspective: 1200,
                transformOrigin: 'right center',
            });
            // The closing CTA waits hidden until every card has passed through.
            gsap.set(q('.cs-outro'), { autoAlpha: 0 });
            gsap.set(q('.cs-outro-item'), { y: 40, autoAlpha: 0 });
            cards.forEach((c) => {
                const s = c.querySelector('.cs-stats');
                // Counter panel waits tucked under the card, ready to slide out.
                if (s) gsap.set(s, { autoAlpha: 0, y: 60 });
                // Media is wiped shut from the right and held over-scale, so it opens
                // and settles back to 1 as the card lands.
                gsap.set(c.querySelector('.cs-media'), { clipPath: 'inset(0% 0% 0% 100%)', scale: 1.18 });
                // Title rides up out of its mask.
                gsap.set(c.querySelector('.cs-title'), { yPercent: 115 });
                const values = Array.from(c.querySelectorAll('.cs-values li')) as HTMLElement[];
                const labels = Array.from(c.querySelectorAll('.cs-labels li')) as HTMLElement[];
                gsap.set([...values, ...labels], { autoAlpha: 0 });
                // Each counter starts at 0 (keeping any prefix/suffix like "+" or "%").
                values.forEach((v) => {
                    const raw = v.getAttribute('data-value') || '';
                    const prefix = (raw.match(/^[^\d]*/) || [''])[0];
                    const suffix = (raw.match(/[^\d]*$/) || [''])[0];
                    v.textContent = prefix + '0' + suffix;
                });
            });

            // Reveal a card's counter panel on scroll (scrubbed): each row (number +
            // label) appears together, staggered, and the number counts up to its target.
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

            const tl = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'top top',
                    end: () => '+=' + window.innerHeight * (n + 5),
                    pin: true,
                    scrub: 1,
                },
            });

            // ── Phase 1 — HomeMarquee content wipes in from the right ───────
            tl.to(q('.hm-heading'), { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 1, ease: 'power2.out' })
                .to(q('.hm-row1'), { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 1, ease: 'power2.out' }, '<0.35')
                .to(q('.hm-row2'), { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 1, ease: 'power2.out' }, '<0.1');

            // ── Phase 2 — Marquee slides left as CaseStudy comes from the right ──
            tl.to(marqueeRef.current, { xPercent: -100, duration: 1.2, ease: 'power2.inOut' }, '+=0.5')
                .to(caseRef.current, { xPercent: 0, duration: 1.2, ease: 'power2.inOut' }, '<');

            // ── Phase 3 — CaseStudy left text wipes in (right-to-left) ──────
            tl.to(q('.cs-left'), { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power2.out' }, '+=0.1');

            // ── Phase 4 — Card carousel (after the text): enter → stop → counter → out ─
            for (let i = 0; i < n; i += 1) {
                const card = cards[i];
                const stats = card.querySelector('.cs-stats');

                // Every card swings in from the right — angle, scale and blur all
                // resolving together as it lands centre.
                tl.to(card, {
                    xPercent: 0,
                    autoAlpha: 1,
                    scale: 1,
                    rotationY: 0,
                    filter: 'blur(0px)',
                    duration: 0.7,
                    ease: 'power3.out',
                })
                    // Media wipes open and eases out of its over-scale a beat behind.
                    .to(card.querySelector('.cs-media'), {
                        clipPath: 'inset(0% 0% 0% 0%)',
                        scale: 1,
                        duration: 0.6,
                        ease: 'power2.out',
                    }, '<0.15')
                    // Title clears its mask last, once the frame has settled.
                    .to(card.querySelector('.cs-title'), {
                        yPercent: 0,
                        duration: 0.5,
                        ease: 'power3.out',
                    }, '<0.1');

                // Counter panel slides out from under the card: numbers count up
                // alongside their labels.
                revealStats(stats);

                // Then the card banks away to the left, back into depth — the last one
                // leaves too, clearing the stage for the closing CTA.
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

            // ── Phase 5 — the story closes: the left intro wipes away and the CTA lands ──
            tl.to(q('.cs-left'), { clipPath: 'inset(0% 100% 0% 0%)', duration: 0.5, ease: 'power2.in' }, '<0.1')
                .to(q('.cs-outro'), { autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, '+=0.1')
                .to(q('.cs-outro-item'), {
                    y: 0,
                    autoAlpha: 1,
                    duration: 0.5,
                    ease: 'power3.out',
                    stagger: 0.15,
                }, '<');
            // The CTA holds centred; pin then releases → next section.
        },
        { scope: rootRef }
    );

    return (
        <div ref={rootRef} className="second-section relative h-screen w-full overflow-hidden">
            {/* HomeMarquee panel */}
            <div ref={marqueeRef} className="absolute inset-0 flex items-center justify-center">
                <HomeMarquee />
            </div>
            {/* CaseStudy panel — starts off to the right */}
            <div ref={caseRef} className="absolute inset-0">
                <CaseStudy />
            </div>
        </div>
    );
}
