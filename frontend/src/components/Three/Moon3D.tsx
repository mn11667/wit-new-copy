import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, Vector3, MathUtils } from 'three';
import { OrbitControls } from '@react-three/drei';

function MoonSphere({ phase }: { phase: number }) {
    const meshRef = useRef<THREE.Mesh>(null);

    // High-res texture for realism
    const texture = useLoader(TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg');
    // Optional bump map for crater depth (reusing texture works reasonably well for simple bump if contrast is high, but dedicated is better)
    // For production, we'd use a separate normal map, but this is a solid start.

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Very slow axial rotation
            meshRef.current.rotation.y += delta * 0.05;
        }
    });

    // Calculate Sun Position based on Phase
    // Phase 0 = New Moon (Sun behind Moon) -> Light at Z = -10
    // Phase 0.5 = Full Moon (Sun behind Camera) -> Light at Z = 10
    // Phase 0.25 = First Quarter -> Light at X = 10 (Right side illuminated)
    // Logic: 
    // We want the light to orbit the moon.
    // Angle: 
    // New Moon (0) -> Sun is "behind" moon from Earth perspective.
    // Full Moon (0.5) -> Sun is "behind" Earth (camera).

    const sunPosition = useMemo(() => {
        // Convert phase (0..1) to angle (0..2*PI)
        // Phase 0 starts at angle PI (back) if we consider 0 is front? 
        // Let's model it: 
        // Camera is at (0, 0, 5). Moon at (0,0,0).
        // Sun orbit radius.
        const r = 20;

        // We map phase to sun angle.
        // New Moon (0.00): Sun at (0, 0, -r). Angle = PI.
        // Waxing Crescent -> Sun moves to right.
        // First Quarter (0.25): Sun at (r, 0, 0). Angle = PI/2? No, standard trig:
        // Let angle theta be 0 at Z+ (Full Moon).
        // Then theta = PI at Z- (New Moon).

        // Phase 0.5 (Full) -> Angle 0
        // Phase 0.0 (New) -> Angle PI
        // Phase 0.25 (First Q) -> Angle -PI/2 (Light from Right?) 
        // Let's refine.
        // Phase 0 -> Sun behind Moon -> Z negative.
        // Phase 0.5 -> Sun front -> Z positive.
        // As phase increases 0 -> 0.5, sun moves from behind to front. 
        // Usually Waxing is "Right side lit". So Light is at X+. 

        const angle = (phase - 0.5) * 2 * Math.PI;
        // If phase = 0.5 -> angle = 0. cos(0)=1 (Z+). Correct.
        // If phase = 0 -> angle = -PI. cos(-PI)=-1 (Z-). Correct.
        // If phase = 0.25 -> angle = -0.5PI. sin(-0.5PI) = -1. X is -r? That implies Left.
        // We want Right lit. So maybe `-(phase-0.5)` or flip the axis.

        const x = Math.sin(angle) * r; // Check: Phase 0.25 -> angle -PI/2 -> sin(-PI/2)=-1 -> X negative. (Left).
        // We want Right side illumination for First Quarter (northern hemisphere).
        // So let's invert the angle direction.

        const theta = (0.5 - phase) * 2 * Math.PI;
        // Phase 0.5 -> 0. Full.
        // Phase 0.25 -> 0.25 * 2PI = PI/2. sin(PI/2)=1. X+. Right side lit. Correct.

        return new Vector3(Math.sin(theta) * r, 0, Math.cos(theta) * r);
    }, [phase]);

    return (
        <>
            <directionalLight
                position={sunPosition}
                intensity={2.5}
                castShadow={false} // Performance
            />
            {/* Ambient light for the dark side (Earthshine) - very low */}
            <ambientLight intensity={0.05} color="#334455" />

            <mesh ref={meshRef} rotation={[0.1, 0, 0]}> {/* Slight tilt */}
                <sphereGeometry args={[2, 64, 64]} />
                <meshStandardMaterial
                    map={texture}
                    bumpMap={texture}
                    bumpScale={0.05}
                    roughness={0.8}
                    metalness={0.1}
                />
            </mesh>
        </>
    );
}

// Helper to get phase
const getMoonPhaseValue = (date: Date = new Date()) => {
    const synodic = 29.53058867;
    const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 12, 24, 0));
    const diffTime = date.getTime() - knownNewMoon.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const phase = (diffDays % synodic) / synodic;
    return phase < 0 ? phase + 1 : phase;
};

export const BackgroundMoon: React.FC = () => {
    const phase = useMemo(() => getMoonPhaseValue(new Date()), []);

    return (
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ mixBlendMode: 'screen' }}>
            <Canvas camera={{ position: [0, 0, 7], fov: 45 }} gl={{ alpha: true, antialias: true }}>
                <MoonSphere phase={phase} />
            </Canvas>
        </div>
    );
};
