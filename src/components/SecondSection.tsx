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
            gsap.set(cards, { xPercent: 120, autoAlpha: 0 });
            cards.forEach((c) => {
                const s = c.querySelector('.cs-stats');
                if (s) gsap.set(s, { autoAlpha: 0 });
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
                tl.to(stats, { autoAlpha: 1, duration: 0.25, ease: 'power2.out' }, '+=0.05');
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
                    end: () => '+=' + window.innerHeight * (n + 3),
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

                // Every card enters from the right and stops at centre.
                tl.to(card, { xPercent: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' });

                // Counter panel reveals on scroll: numbers count up alongside their labels.
                revealStats(stats);

                // Then slide the card out (last one stays).
                if (i < n - 1) {
                    tl.to(card, { xPercent: -170, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, '+=0.1');
                }
            }
            // The last card stays centred; pin then releases → next section.
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
