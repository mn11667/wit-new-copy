import React, { useMemo } from 'react';

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

// Get phase name and description
const getPhaseInfo = (phase: number) => {
    // Phase is 0..1
    // 0 = New Moon
    // 0.25 = First Quarter
    // 0.5 = Full Moon
    // 0.75 = Last Quarter

    if (phase < 0.03 || phase > 0.97) return { name: "New Moon", icon: "🌑" };
    if (phase < 0.22) return { name: "Waxing Crescent", icon: "Vk" };
    if (phase < 0.28) return { name: "First Quarter", icon: "Vc" };
    if (phase < 0.47) return { name: "Waxing Gibbous", icon: "Vm" };
    if (phase < 0.53) return { name: "Full Moon", icon: "🌕" };
    if (phase < 0.72) return { name: "Waning Gibbous", icon: "Wm" };
    if (phase < 0.78) return { name: "Last Quarter", icon: "Wc" };
    return { name: "Waning Crescent", icon: "Wk" };
};

export const MoonPhase: React.FC = () => {
    const today = new Date();
    const phase = getMoonPhase(today); // 0 to 1
    const { name } = getPhaseInfo(phase);

    // Calculate shadow coverage
    // We want to overlay a shadow on the moon texture.
    // SVG approach:
    // We draw a path that represents the shadow.
    // The moon is a circle radius 50 (viewBox 0 0 100 100).
    // The illuminated part is determined by the phase.

    // Instead of complex math, we can use a simpler visual approximation using lighting angle?
    // Let's use the 'scanline' or 'mask' approach which is robust for 2D.
    // However, for high aesthetics, let's use a semantic HTML/CSS trick with 3D transforms if possible, 
    // OR simply an SVG mask that moves.

    // Let's use a proven SVG path calculation for the terminator line.
    // x varies from -50 (left) to 50 (right).
    // The curve is an elliptical arc.

    // Simplification:
    // 0 -> 0.5 (Waxing): Light grows from Right side? No, New Moon is dark. Waxing Crescent = Right sliver.
    // Actually, in Northern Hemisphere:
    // New Moon: Dark
    // Waxing: Right side lit.
    // Full: All lit.
    // Waning: Left side lit.

    // We will render the SHADOW.
    // New Moon (0): Shadow covers everything.
    // First Quarter (0.25): Shadow covers Left Half.
    // Full Moon (0.5): Shadow is gone.
    // Last Quarter (0.75): Shadow covers Right Half.

    // Let's model the SHADOW path on a 100x100 grid centered at 50,50. 
    // Radius R = 50.

    // We construct a path for the shadow.
    // Outer circle is always the bound.

    // This is hard to perfect in one go without testing. 
    // Alternative: Use a high-quality library-free CSS snippet approach.

    // Strategy:
    // 1. Layer 1: Moon Image (Full)
    // 2. Layer 2: Shadow Overlay (SVG)

    // Calculating the "bulge" of the terminator:
    // p goes 0 -> 1.
    // angle = p * 2 * PI.
    // x projection = cos(angle) * R.

    const R = 48; // slightly less than 50 to avoid edge artifacts
    const C = 50;

    // Calculate the 'x' control point for the curve
    // Cycle 0..0.5 (Waxing) -> Light grows from Right. Shadow retreats to Left.
    // Cycle 0.5..1 (Waning) -> Light retreats to Left. Shadow grows from Right.

    // Let's assume we simply draw the LIT part for easier composite.
    // We'll have a Black Circle background. We overlay the Lit Part.
    // Lit Part shape:
    // It's always a semi-circle + a semi-ellipse.

    // For 0 to 0.5 (Waxing):
    // Right semi-circle is fixed? No.
    // At 0: No light.
    // At 0.25: Right semi-circle is lit.
    // At 0.5: Full circle is lit (Right semi + Left semi).

    // Setup for SVG Path (The Lit Area):
    // Start at Top (50, 2).
    // Arc to Bottom (50, 98).
    // Then curve back to Top depending on phase.

    // Let sweep = calculated based on phase.
    const getPath = (p: number) => {
        // Normalize p to 0..1

        // Northern Hemisphere view
        // 0.0 - 0.5: Waxing (Light on Right)
        // 0.5 - 1.0: Waning (Light on Left)

        const isWaxing = p <= 0.5;
        const progress = isWaxing ? p / 0.5 : (p - 0.5) / 0.5;
        // progress 0 -> 1 in both half-cycles

        // The terminator 'x' coordinate varies.
        // x goes from -R to +R.
        // Actually it's simpler:
        // Use a mask approach.

        // Let's leave the complex SVG math and use a simpler visual approximation using CSS 'border-radius' on a pseudo elements,
        // or just use 3 simple SVGs for shadow.
        // Actually, user wants "looks similar to this" (image).
        // The image is a detailed texture.
        // I will use `mix-blend-mode: multiply` with a generated shadow map.
        // Since I can't generate a dynamic shadow map image easily, I will use the SVG path which is standard.

        // SVG Path for the LIT area:
        // M 50 0 (Top)
        // A 50 50 0 0 1 50 100 (Right Semi-circle arc) - IF Waxing
        // A 50 50 0 0 0 50 100 (Left Semi-circle arc) - IF Waning

        // Return null to use the "Shadow" logic below instead which is easier to mentally model.
        return "";
    };

    // Shadow calculation
    // We draw the SHADOW.
    // 0.0 (New): Full Shadow (Circle).
    // 0.25 (1st Q): Left Half Shadow.
    // 0.5 (Full): No Shadow.
    // 0.75 (3rd Q): Right Half Shadow.

    // Path string builder
    const shadowPath = useMemo(() => {
        // p is 0..1
        // We need to determine the curve of the terminator.
        // xOffset varies from -R to R.
        // xOffset = R * cos(phase * 2 * PI)

        // This math is actually: x = -R * cos(2 * PI * p)
        // New Moon (0): x = -R * 1 = -R. (Wait, at New moon, shadow is full? Yes.)
        // Full Moon (0.5): x = -R * -1 = +R. (Shadow is empty? Yes.)

        // Let's refine:
        // We draw the SHADOW shape.
        // Phase 0->0.5 (Waxing): Shadow is on the LEFT. It shrinks from Full to Half to None.
        // Phase 0.5->1 (Waning): Shadow is on the RIGHT. It grows from None to Half to Full.

        const r = 50;
        const cx = 50;
        const cy = 50;

        // Angle in radians (0 to 2PI)
        const rad = phase * 2 * Math.PI;

        // x coordinate of the terminator center
        // At 0 (New): We want full black.
        // At 0.25 (Half): Terminator is at 0 (center).
        // At 0.5 (Full): We want no black.

        // We use an elliptical arc for the terminator.
        // The radius of the ellipse on x-axis: rx = 50 * cos(rad)
        const rx = 50 * Math.cos(rad);
        const absRx = Math.abs(rx);
        const sweep = phase > 0.5 ? 0 : 1; // Flip the arc direction based on waning/waxing?

        // It's tricky. Let's simpler logic:
        // Use a mask.
        // The mask consists of two parts: a semi-circle and a semi-ellipse.
        return "";
    }, [phase]);

    // FALLBACK: Use a CSS trick that's robust.
    // Use the `lunar-phase` CSS class logic simplified.
    // 1. Texture.
    // 2. Overlay div with 50% border radius.
    // 3. Rotate and adjust opacity.

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-black/40 border border-white/10 rounded-3xl backdrop-blur-md">
            <h3 className="text-white font-mono text-xs uppercase tracking-widest mb-4 opacity-70">Current Lunar Phase</h3>

            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.1)] mb-4 bg-black overflow-hidden">
                {/* 1. Base Texture (Full Moon) */}
                <img
                    src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=600&auto=format&fit=crop"
                    alt="Moon Texture"
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                />

                {/* 2. Phase Shadow Mask */}
                {/* We use an SVG that covers the moon partially */}
                <MoonShadowOverlay phase={phase} />

                {/* 3. Shine/Glow Effect */}
                <div className="absolute inset-0 rounded-full shadow-[inset_-10px_-10px_30px_rgba(0,0,0,0.8),inset_10px_10px_30px_rgba(255,255,255,0.1)] pointer-events-none mix-blend-overlay"></div>
            </div>

            <div className="text-center space-y-1">
                <div className="text-2xl font-bold text-white tracking-wide font-serif">{name}</div>
                <div className="text-xs text-slate-400 font-mono">
                    {Math.round(phase * 100)}% Cycle • Age: {(phase * 29.53).toFixed(1)} days
                </div>
            </div>
        </div>
    );
};

const MoonShadowOverlay: React.FC<{ phase: number }> = ({ phase }) => {
    // 0 = New, 0.5 = Full, 1.0 = New

    // Northern Hemisphere Logic
    // Waxing (0 -> 0.5): Lit from Right. Shadow on Left.
    // Waning (0.5 -> 1.0): Lit from Left. Shadow on Right.

    const isWaxing = phase <= 0.5;

    // Determine the curve width. 
    // At 0 or 0.5 or 1, curve is 0 (straight line or full circle).
    // We model the terminator as a semi-circle + semi-ellipse.

    // Simplified SVG representation:
    // We compose the SHADOW.

    if (phase === 0.5) return null; // Full moon, no shadow

    // For simplicity and visual impact, we can use a "disc" that slides? No, that looks like an eclipse.
    // We must use the curve.

    // Let's use a specialized path.
    // M 50 0 (Top)
    // A 50 50 0 1 1 50 100 (Right Semi-Circle)
    // A rx 50 0 0 [sweep] 50 0 (Terminator Ellipse back to top)

    // rx varies from 50 to 0 to 50.

    // Let's calculate purely based on illumination.
    // Check various phase states.

    // WAXING (0 to 0.5):
    // Shadow is on the LEFT. 
    // At 0 (New): Shadow is Full Circle.
    // At 0.25 (Quarter): Shadow is Left Hemisphere.
    // At 0.5 (Full): Shadow is None.

    // WANING (0.5 to 1.0):
    // Shadow is on the RIGHT.
    // At 0.5: None.
    // At 0.75 (Quarter): Shadow is Right Hemisphere.
    // At 1.0: Full.

    // Path Construction:
    // We will draw the SHADOW polygon.
    // Start Top (50,0).
    // Draw the "Outer" arc (Left or Right side).
    // Draw the "Inner" arc (Terminator).

    const r = 50;

    // Calculate rx of the terminator ellipse
    // Phase 0 -> rx = 50. Phase 0.25 -> rx = 0. Phase 0.5 -> rx = -50? 
    // Let's use Cosine mapping.
    // ill = illumination (0 to 1). 
    // But we have phase (0 to 1).
    // lightFraction = 0.5 * (1 - cos(phase * 2pi)) ? No that's area.

    // Let's stick to the visual geometry:
    // 'val' goes from -50 to 50.
    // angle = phase * 2PI.
    // x = -50 * cos(angle). 
    // 0 -> -50 (Left edge) (Wait, -50 is left edge?).
    // 0.25 -> 0 (Center).
    // 0.5 -> 50 (Right edge).

    // If x is negative, the terminator curves to the left.
    // If x is positive, the terminator curves to the right.

    // IS WAXING (Shadow Left):
    // Outer Arc: Left Semi-Circle (always covered by shadow part? No).
    // At 0: Full shadow.
    // At 0.1: Most shadow.
    // At 0.25: Left Half shadow.
    // At 0.4: Sliver shadow on left.

    // We need 4 cases or use a smart single path with varying sweep.

    // Case 1: Waxing Crescent (0 < p < 0.25) -- Shadow is dominant (Left Quarter + Bulge).
    // Case 2: Waxing Gibbous (0.25 <= p < 0.5) -- Shadow is recessive (Left Crescent).
    // Case 3: Waning Gibbous (0.5 <= p < 0.75) -- Shadow is recessive (Right Crescent).
    // Case 4: Waning Crescent (0.75 <= p < 1.0) -- Shadow is dominant (Right Quarter + Bulge).

    const x = 50 * Math.cos(phase * 2 * Math.PI); // -50 to 50
    const rx = Math.abs(x);
    // sweep flag for the elliptical arc depending on phase?

    let d = "";

    if (phase < 0.5) {
        // WAXING
        // Shadow is on the Left.
        // Outer arc is the Left semicircle: M 50 0 A 50 50 0 0 0 50 100
        // Inner arc connects 50 100 back to 50 0.
        // Its x-radius is |x|. 
        // If p < 0.25 (Crescent Light, Gibbous Shadow), shadow bulges right. 
        // If p > 0.25 (Gibbous Light, Crescent Shadow), shadow scoops left.

        const sweep = phase < 0.25 ? 1 : 0;
        d = `M 50 0 A 50 50 0 0 0 50 100 A ${rx} 50 0 0 ${sweep} 50 0`;
    } else {
        // WANING
        // Shadow is on the Right.
        // Outer arc is Right semicircle: M 50 0 A 50 50 0 0 1 50 100
        // Inner arc connects 50 100 back to 50 0.

        const sweep = phase < 0.75 ? 1 : 0;
        d = `M 50 0 A 50 50 0 0 1 50 100 A ${rx} 50 0 0 ${sweep} 50 0`;
    }

    return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <path d={d} fill="rgba(0,0,0,0.85)" />
        </svg>
    );
};
