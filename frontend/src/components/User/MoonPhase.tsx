import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

// Accurate Moon Phase Calculation
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

    // Track if detailed image loaded
    const [imgLoaded, setImgLoaded] = useState(false);

    const shadowPath = useMemo(() => {
        const angle = phase * 2 * Math.PI;
        const rx = Math.abs(50 * Math.cos(angle));
        let d = "";

        if (phase <= 0.5) {
            // WAXING
            const isCrescent = phase < 0.25;
            const sweep = isCrescent ? 1 : 0;
            d = `M 50 0 A 50 50 0 0 0 50 100 A ${rx} 50 0 0 ${sweep} 50 0`;
        } else {
            // WANING
            const isGibbous = phase < 0.75;
            const sweep = isGibbous ? 0 : 1;
            d = `M 50 0 A 50 50 0 0 1 50 100 A ${rx} 50 0 0 ${sweep} 50 0`;
        }
        return d;
    }, [phase]);

    // Use a unique ID for the mask to avoid conflicts
    const maskId = React.useId ? React.useId() : `moon-mask-${Math.random()}`;
    const safeMaskId = maskId.replace(/:/g, '');

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-black/40 border border-white/10 rounded-3xl backdrop-blur-md relative overflow-hidden group">

            {/* Ambient Background Glow - subtle blue */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full point-events-none" />

            <h3 className="text-white font-mono text-xs uppercase tracking-widest mb-6 opacity-70 z-10">Current Lunar Phase</h3>

            {/* Moon Container */}
            <div className="relative w-56 h-56 md:w-64 md:h-64 z-10 flex items-center justify-center">

                {/* SVG Mask Definition */}
                <svg className="absolute w-0 h-0 pointer-events-none">
                    <defs>
                        <mask id={safeMaskId} maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">
                            <rect x="0" y="0" width="1" height="1" fill="white" />
                            <path d={shadowPath} transform="scale(0.01)" fill="black" />
                        </mask>
                    </defs>
                </svg>

                {/* Textured Sphere with Mask applied */}
                <motion.div
                    initial={{ rotate: -5 }}
                    animate={{ rotate: 5 }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                    className="relative w-full h-full rounded-full bg-black shadow-[0_0_60px_rgba(255,255,255,0.1)] overflow-hidden"
                    style={{
                        mask: `url(#${safeMaskId})`,
                        WebkitMask: `url(#${safeMaskId})`,
                        // Realistic lighting: subtle inner shadow on the "dark" side of the lit portion
                        boxShadow: `
                            inset -20px -20px 60px rgba(0,0,0,0.8),
                            inset 5px 5px 20px rgba(255,255,255,0.2)
                        `
                    }}
                >
                    {/* 1. Real Image (Primary) */}
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg"
                        alt="Moon Surface"
                        className={`absolute inset-0 w-full h-full object-cover scale-[1.02] contrast-[1.1] brightness-110 transition-opacity duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setImgLoaded(true)}
                        onError={() => setImgLoaded(false)}
                    />

                    {/* 2. Fallback CSS Procedure (Only if image fails/loading) */}
                    {!imgLoaded && (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-300 to-slate-500 rounded-full">
                            <div className="absolute w-[20%] h-[20%] top-[25%] left-[20%] bg-slate-600/10 rounded-full shadow-inner blur-[1px]"></div>
                            <div className="absolute w-[30%] h-[30%] top-[40%] right-[15%] bg-slate-500/20 rounded-full shadow-inner blur-[2px]"></div>
                            {/* Noise */}
                            <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                        </div>
                    )}
                </motion.div>

                {/* Earthshine / Dark Side - VERY subtle, barely there */}
                <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none -z-10 bg-black/20"></div>
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
