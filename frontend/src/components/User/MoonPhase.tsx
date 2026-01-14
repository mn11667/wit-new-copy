import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// Accurate Moon Phase Calculation
// Based on simple synodic month cycle
const getMoonPhase = (date: Date) => {
    const synodic = 29.53058867;
    // Known New Moon: Jan 6, 2000 12:24 PM UTC
    const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 12, 24, 0));
    const diffTime = date.getTime() - knownNewMoon.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const phase = (diffDays % synodic) / synodic;
    return phase < 0 ? phase + 1 : phase;
};

const getPhaseInfo = (phase: number) => {
    if (phase < 0.03 || phase > 0.97) return { name: "New Moon", icon: "🌑" };
    if (phase < 0.22) return { name: "Waxing Crescent", icon: "🌒" };
    if (phase < 0.28) return { name: "First Quarter", icon: "🌓" };
    if (phase < 0.47) return { name: "Waxing Gibbous", icon: "🌔" };
    if (phase < 0.53) return { name: "Full Moon", icon: "🌕" };
    if (phase < 0.72) return { name: "Waning Gibbous", icon: "🌖" };
    if (phase < 0.78) return { name: "Last Quarter", icon: "🌗" };
    return { name: "Waning Crescent", icon: "🌘" };
};

export const MoonPhase: React.FC = () => {
    const today = new Date();
    const phase = getMoonPhase(today);
    const { name } = getPhaseInfo(phase);

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-black/40 border border-white/10 rounded-3xl backdrop-blur-md relative overflow-hidden group">

            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

            <h3 className="text-white font-mono text-xs uppercase tracking-widest mb-6 opacity-70 z-10">Current Lunar Phase</h3>

            {/* 3D Moon Container */}
            <div className="relative w-56 h-56 md:w-64 md:h-64 z-10">

                {/* 1. Base Sphere & Texture */}
                <motion.div
                    initial={{ rotate: -5 }}
                    animate={{ rotate: 5 }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                    className="relative w-full h-full rounded-full overflow-hidden shadow-[0_0_50px_rgba(200,200,255,0.15)] bg-black"
                    style={{
                        // 3D Sphere Effect via Box Shadows
                        boxShadow: `
                            inset -20px -20px 50px rgba(0,0,0,0.9),
                            inset 10px 10px 30px rgba(255,255,255,0.1),
                            0 0 20px rgba(0,0,0,0.5)
                        `
                    }}
                >
                    {/* Realistic Texture Map (NASA Clementine or similar high-contrast) */}
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg"
                        alt="Moon Surface"
                        className="absolute inset-0 w-full h-full object-cover scale-[1.05] contrast-[1.1] grayscale-[0.2]"
                    />

                    {/* 2. Dynamic Shadow Mask (The Terminator) */}
                    <MoonShadowOverlay phase={phase} />

                    {/* 3. Surface Detail Enhancer (Crater pops) */}
                    <div className="absolute inset-0 rounded-full mix-blend-overlay opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

                </motion.div>

                {/* 4. Atmosphere Glow (Outer) */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-transparent via-blue-300/5 to-transparent blur-md pointer-events-none"></div>
            </div>

            <div className="text-center space-y-2 mt-6 z-10">
                <div className="text-2xl font-bold text-white tracking-wide font-serif drop-shadow-md">{name}</div>
                <div className="text-xs text-slate-400 font-mono flex items-center justify-center gap-3">
                    <span className="bg-white/10 px-2 py-1 rounded">{(phase * 100).toFixed(0)}% Illumination</span>
                    <span className="bg-white/10 px-2 py-1 rounded">Age: {(phase * 29.53).toFixed(1)}d</span>
                </div>
            </div>
        </div>
    );
};

const MoonShadowOverlay: React.FC<{ phase: number }> = ({ phase }) => {
    // Advanced Shadow Logic with Soft Edge (Blur)

    // We use SVG filters to create a soft terminator line for realism.

    const r = 50;

    // Logic:
    // Waxing (0 -> 0.5): Shadow is on Left. Light grows from Right.
    // Waning (0.5 -> 1.0): Shadow is on Right. Light shrinks to Left.

    const angle = phase * 2 * Math.PI;
    const x = -50 * Math.cos(angle);

    let d = "";

    // Projection of the terminator onto the 2D disk.
    // The curve is a semi-ellipse with horizontal radius |rx|.

    const rx = Math.abs(50 * Math.cos(angle));

    if (phase <= 0.5) {
        // WAXING (Growing Light)
        const isCrescent = phase < 0.25;
        const sweep = isCrescent ? 1 : 0;

        // Outer Arc: Left Edge.
        d = `M 50 0 A 50 50 0 0 0 50 100 A ${rx} 50 0 0 ${sweep} 50 0`;

    } else {
        // WANING (Shrinking Light)
        const isGibbous = phase < 0.75;
        const sweep = isGibbous ? 0 : 1;

        // Outer Arc: Right Edge.
        d = `M 50 0 A 50 50 0 0 1 50 100 A ${rx} 50 0 0 ${sweep} 50 0`;
    }

    // Special 'Full Moon' visibility fix
    const opacity = (phase > 0.48 && phase < 0.52) ? 0 : 0.85;

    return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-20" style={{ opacity }}>
            <defs>
                <filter id="blurFilter">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
                </filter>
            </defs>
            {/* Primary Shadow */}
            <path d={d} fill="#0d0d12" filter="url(#blurFilter)" />
            {/* Harder Core Shadow for depth */}
            <path d={d} fill="#000000" opacity="0.6" />
        </svg>
    );
};
