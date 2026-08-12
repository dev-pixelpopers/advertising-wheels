'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from '../app/CinematicStory.module.css';

gsap.registerPlugin(ScrollTrigger);

const CinematicStory = () => {
    const componentRef = useRef(null);

    useEffect(() => {
        if (!componentRef.current) return;

        let ctx = gsap.context(() => {
            // Single timeline controls pinning AND phase transitions synchronously
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: componentRef.current,
                    start: 'top top',
                    end: '+=300%', // 300% = 3 full screen heights of scroll space
                    pin: true,     // Pin the entire story component while scrubbing
                    scrub: 1,      // Smoothly link timeline progress to scroll
                    anticipatePin: 1,
                },
            });

            // ==========================================
            // PHASE 1: Studio & Wrap
            // ==========================================
            tl.fromTo(`.${styles.studioEnv}`, { opacity: 0 }, { opacity: 1, duration: 1 })
                .fromTo(
                    `.${styles.wrapGraphics}`,
                    { y: -100, opacity: 0 },
                    { y: 0, opacity: 1, stagger: 0.2, duration: 1 },
                    '<'
                )
                .fromTo(
                    `.${styles.narrativeStep}[data-step="1"]`,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 1 },
                    '<'
                );

            // ==========================================
            // PHASE 2: Transition to City & Route
            // ==========================================
            tl.to(`.${styles.narrativeStep}[data-step="1"]`, { opacity: 0, y: -30, duration: 1 }, '+=1')
                .to(`.${styles.studioEnv}`, { opacity: 0, duration: 1 }, '<')
                .fromTo(`.${styles.cityEnv}`, { opacity: 0 }, { opacity: 1, duration: 1 }, '<')
                .to(`.${styles.truckModel}`, { filter: 'brightness(1.1) contrast(1.1)', duration: 1 }, '<')
                .fromTo(
                    `.${styles.routeVisualization}`,
                    { opacity: 0, scale: 1.2 },
                    { opacity: 1, scale: 1, duration: 1 },
                    '<'
                )
                .fromTo(
                    `.${styles.narrativeStep}[data-step="2"]`,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 1 },
                    '<'
                );

            // ==========================================
            // PHASE 3: Data Dashboard Projection
            // ==========================================
            tl.to(`.${styles.narrativeStep}[data-step="2"]`, { opacity: 0, y: -30, duration: 1 }, '+=1')
                .to(`.${styles.cityEnv}`, { filter: 'blur(3px) brightness(0.6)', duration: 1 }, '<')
                .fromTo(
                    `.${styles.dataOverlay}`,
                    { opacity: 0, scale: 0.7, rotationX: 45 },
                    { opacity: 1, scale: 1, rotationX: 0, duration: 1 },
                    '<'
                )
                .fromTo(
                    `.${styles.narrativeStep}[data-step="3"]`,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 1 },
                    '<'
                );

        }, componentRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={componentRef} className={styles.storyContainer}>
            {/* Visual Stage */}
            <div className={styles.visualStage}>
                <div className={styles.studioEnv}></div>
                <div className={styles.cityEnv}></div>

                <div className={styles.truckModel}>
                    <Image
                        src="/images/aw-semi-truck.png"
                        alt="Advertising Wheels Truck"
                        width={800}
                        height={600}
                        loading="lazy"
                    />

                    <div className={styles.wrapGraphics}>
                        <div className={styles.graphicPanel}>Panel 1</div>
                        <div className={styles.graphicPanel}>Panel 2</div>
                    </div>

                    <div className={styles.routeVisualization}>
                        <div className={styles.routeLine}></div>
                    </div>

                    <div className={styles.dataOverlay}>
                        <h3>Live GPS Verification</h3>
                        <div className={styles.dataStats}>
                            <span>Impressions: <b className={styles.dataHighlight}>12.4M</b></span>
                            <span>Reach: <b>94%</b></span>
                        </div>
                    </div>
                </div>

                {/* Narrative Text Container (Overlayed on top of Visual Stage) */}
                <div className={styles.narrativeSection}>
                    <div className={styles.narrativeStep} data-step="1">
                        <h2>Vinyl Wrap to Spec</h2>
                        <p>We handle your creative with precision. Our specialists engineer heavy-duty, weather-resistant vinyl prints and install them on large-fleet surfaces.</p>
                    </div>

                    <div className={styles.narrativeStep} data-step="2">
                        <h2>Fleet Deployment</h2>
                        <p>We optimize targeted transit routes through high-traffic urban corridors. Synchronized with peak traffic hours.</p>
                    </div>

                    <div className={styles.narrativeStep} data-step="3">
                        <h2>GPS Data</h2>
                        <p>Never guess your impact. Receive real-time campaign visibility via GPS-verified deployment.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CinematicStory;