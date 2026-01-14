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

    // Calculate Shadow Path for Masking
    // We want to Mask OUT the shadow (make it transparent).
    // Mask Logic: White = Visible, Black = Hidden.
    // So we draw a White Rect (Background) and a Black Shadow Path.
    const shadowPath = useMemo(() => {
        const angle = phase * 2 * Math.PI;
        const rx = Math.abs(50 * Math.cos(angle));
        let d = "";

        // 0-100 coordinate system relative (SVG viewBox 0 0 100 100)
        if (phase <= 0.5) {
            // WAXING
            const isCrescent = phase < 0.25;
            const sweep = isCrescent ? 1 : 0;
            // Shadow Logic for Waxing: Left Edge Arc to Bottom, then Inner Arc to Top
            d = `M 50 0 A 50 50 0 0 0 50 100 A ${rx} 50 0 0 ${sweep} 50 0`;
        } else {
            // WANING
            const isGibbous = phase < 0.75;
            const sweep = isGibbous ? 0 : 1;
            // Shadow Logic for Waning: Right Edge Arc to Bottom, then Inner Arc to Top
            d = `M 50 0 A 50 50 0 0 1 50 100 A ${rx} 50 0 0 ${sweep} 50 0`;
        }
        return d;
    }, [phase]);

    // Use a unique ID for the mask to avoid conflicts
    const maskId = React.useId ? React.useId() : `moon-mask-${Math.random()}`;
    // Clean ID for CSS selection (remove colons if useId adds them)
    const safeMaskId = maskId.replace(/:/g, '');

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-black/40 border border-white/10 rounded-3xl backdrop-blur-md relative overflow-hidden group">

            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

            <h3 className="text-white font-mono text-xs uppercase tracking-widest mb-6 opacity-70 z-10">Current Lunar Phase</h3>

            {/* Moon Container */}
            <div className="relative w-56 h-56 md:w-64 md:h-64 z-10 flex items-center justify-center">

                {/* SVG for Mask Definition */}
                <svg className="absolute w-0 h-0 pointer-events-none">
                    <defs>
                        <mask id={safeMaskId} maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">
                            {/* Visible Area (White) - Full Square */}
                            <rect x="0" y="0" width="1" height="1" fill="white" />
                            {/* Hidden Area (Shadow -> Black) - Scaled 0-100 path to 0-1 coords */}
                            <path d={shadowPath} transform="scale(0.01)" fill="black" />
                        </mask>
                    </defs>
                </svg>

                {/* Textured Sphere with Mask applied */}
                <motion.div
                    initial={{ rotate: -5 }}
                    animate={{ rotate: 5 }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                    className="relative w-full h-full rounded-full bg-slate-800 shadow-[0_0_50px_rgba(200,200,255,0.15)] overflow-hidden"
                    style={{
                        mask: `url(#${safeMaskId})`,
                        WebkitMask: `url(#${safeMaskId})`, // Webkit support
                        // 3D Sphere Effect via Box Shadows applied to the masked element
                        boxShadow: `
                            inset -10px -10px 40px rgba(0,0,0,0.8),
                            inset 10px 10px 30px rgba(255,255,255,0.15),
                            0 0 30px rgba(200,200,255,0.2)
                        `
                    }}
                >
                    {/* CSS Procedural Texture */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-400 rounded-full">
                        {/* Craters */}
                        <div className="absolute w-[20%] h-[20%] top-[25%] left-[20%] bg-slate-500/10 rounded-full shadow-inner blur-[1px]"></div>
                        <div className="absolute w-[15%] h-[15%] top-[60%] left-[30%] bg-slate-500/20 rounded-full shadow-inner blur-[1px]"></div>
                        <div className="absolute w-[30%] h-[30%] top-[40%] right-[15%] bg-slate-400/20 rounded-full shadow-inner blur-[2px]"></div>
                        <div className="absolute w-[10%] h-[10%] bottom-[20%] right-[35%] bg-slate-600/10 rounded-full shadow-inner"></div>

                        {/* Noise */}
                        <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

                        {/* Image Overlay (blended) */}
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg"
                            alt="Moon Surface"
                            className="absolute inset-0 w-full h-full object-cover scale-[1.05] contrast-[1.1] grayscale-[0.2] mix-blend-multiply opacity-80"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                    </div>
                </motion.div>

                {/* Earthshine / Dark Side - Faint outline so we know the moon is there even if new moon */}
                <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none -z-10 bg-black/30"></div>
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
