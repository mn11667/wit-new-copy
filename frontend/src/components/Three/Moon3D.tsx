import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, Vector3, MathUtils, Mesh } from 'three';
import { OrbitControls } from '@react-three/drei';

function MoonSphere({ phase }: { phase: number }) {
    const meshRef = useRef<Mesh>(null);

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
// Helper to get phase
const getMoonPhaseValue = (date: Date = new Date()) => {
    const synodic = 29.53058867;
    const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 12, 24, 0));
    const diffTime = date.getTime() - knownNewMoon.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const phase = (diffDays % synodic) / synodic;
    return phase < 0 ? phase + 1 : phase;
};

import { ShaderMaterial, BufferGeometry, Float32BufferAttribute, AdditiveBlending, Color, Points } from 'three';

export const BackgroundMoon: React.FC = () => {
    const phase = useMemo(() => getMoonPhaseValue(new Date()), []);

    return (
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ mixBlendMode: 'screen' }}>
            <Canvas camera={{ position: [0, 0, 7], fov: 45 }} gl={{ alpha: true, antialias: true }}>
                <ambientLight intensity={0.1} />
                <StarField />
                <ShootingStarsController />
                <MoonSphere phase={phase} />
            </Canvas>
        </div>
    );
};

// --- STATIONARY TWINKLING STAR FIELD ---
function StarField({ count = 2000 }) {
    const mesh = useRef<Points>(null);

    const [positions, sizes, randoms] = useMemo(() => {
        const p = new Float32Array(count * 3);
        const s = new Float32Array(count);
        const r = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Distribute stars on a sphere but closer so they are visible
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 30 + Math.random() * 50; // Closer range [30, 80]

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = -Math.abs(radius * Math.cos(phi)); // Mostly in front hemisphere (Z negative is into screen)

            p[i * 3] = x;
            p[i * 3 + 1] = y;
            p[i * 3 + 2] = z;

            s[i] = 1.0 + Math.random() * 2.5; // Bigger base size
            r[i] = Math.random();
        }
        return [p, s, r];
    }, [count]);

    const materialRef = useRef<ShaderMaterial>(null);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    const shader = {
        vertex: `
        attribute float size;
        attribute float random;
        varying float vRandom;
        void main() {
            vRandom = random;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            // Increased scale factor for visibility
            gl_PointSize = size * (400.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
      `,
        fragment: `
        uniform float uTime;
        varying float vRandom;
        void main() {
            vec2 xy = gl_PointCoord.xy - vec2(0.5);
            float ll = length(xy);
            if(ll > 0.5) discard;
            
            // Faster, more noticeable twinkle
            float twinkle = sin(uTime * (3.0 + vRandom * 5.0) + vRandom * 10.0) * 0.5 + 0.5;
            float opacity = 0.4 + 0.6 * twinkle;
            
            float glow = 1.0 - (ll * 2.0);
            glow = pow(glow, 2.0);
            
            gl_FragColor = vec4(1.0, 1.0, 1.0, opacity * glow);
        }
      `
    };

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-size" count={sizes.length} array={sizes} itemSize={1} />
                <bufferAttribute attach="attributes-random" count={randoms.length} array={randoms} itemSize={1} />
            </bufferGeometry>
            <shaderMaterial
                ref={materialRef}
                vertexShader={shader.vertex}
                fragmentShader={shader.fragment}
                transparent
                depthWrite={false}
                blending={AdditiveBlending}
                uniforms={{ uTime: { value: 0 } }}
            />
        </points>
    );
}

// --- SHOOTING STARS SYSTEM ---
function ShootingStarsController() {
    const mesh = useRef<Mesh>(null);
    const [active, setActive] = useState(false);

    const starData = useRef({
        pos: new Vector3(),
        vel: new Vector3(),
        hasTail: false,
        life: 0,
        maxLife: 0,
        color: new Color()
    });

    const spawn = () => {
        // Spawn within view frustum bounds roughly
        const x = (Math.random() - 0.5) * 40;
        const y = 20 + Math.random() * 10; // Start hig
        const z = -10 - Math.random() * 20; // In front of camera (Z negative)

        // Velocity: Diagonally down
        const vx = (Math.random() - 0.5) * 10;
        const vy = -(15 + Math.random() * 10); // Downward speed
        const vz = (Math.random() - 0.5) * 5;

        starData.current.pos.set(x, y, z);
        starData.current.vel.set(vx, vy, vz);
        starData.current.hasTail = Math.random() > 0.4;
        starData.current.life = 0;
        starData.current.maxLife = 1.5 + Math.random(); // 1.5-2.5s duration

        setActive(true);

        if (mesh.current) {
            mesh.current.position.copy(starData.current.pos);
            const target = starData.current.pos.clone().add(starData.current.vel);
            mesh.current.lookAt(target);
            mesh.current.rotateX(Math.PI / 2); // Align cylinder
        }
    };

    useFrame((state, delta) => {
        if (!active) {
            // Increased spawn rate: ~1 per second (assuming 60fps, 0.015 chance)
            if (Math.random() < 0.015) {
                spawn();
            }
            return;
        }

        const data = starData.current;
        data.life += delta;
        data.pos.addScaledVector(data.vel, delta);

        if (mesh.current) {
            mesh.current.position.copy(data.pos);
        }

        if (data.life > data.maxLife) {
            setActive(false);
        }
    });

    if (!active) return null;

    return (
        <mesh ref={mesh}>
            {starData.current.hasTail ? (
                // Thicker tail for visibility
                <cylinderGeometry args={[0, 0.3, 10, 4]} />
            ) : (
                // Bright dot
                <sphereGeometry args={[0.3, 8, 8]} />
            )}
            <meshBasicMaterial
                color="#ffffff"
                transparent
                // Fade out at end of life
                opacity={Math.max(0, 1 - (starData.current.life / starData.current.maxLife))}
                blending={AdditiveBlending}
                toneMapped={false} // Maximum brightness
            />
        </mesh>
    );
}
