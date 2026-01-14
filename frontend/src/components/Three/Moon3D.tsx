import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, Vector3, MathUtils, Mesh } from 'three';
import { OrbitControls } from '@react-three/drei';

function MoonSphere({ phase }: { phase: number }) {
    const meshRef = useRef<Mesh>(null);

    // High-quality moon texture with fallback
    const textureUrl = useMemo(() => {
        // Try multiple sources for best quality
        const urls = [
            'https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/lroc_color_poles_1k.jpg',
            'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/1024px-FullMoon2010.jpg'
        ];
        return urls[0]; // Primary high-quality source
    }, []);

    const texture = useLoader(TextureLoader, textureUrl, undefined, (error) => {
        console.warn('Moon texture failed to load, using fallback');
    });

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Very slow axial rotation
            meshRef.current.rotation.y += delta * 0.05;
        }
    });

    // Calculate Sun Position based on Phase
    const sunPosition = useMemo(() => {
        const r = 20;
        const theta = (0.5 - phase) * 2 * Math.PI;
        return new Vector3(Math.sin(theta) * r, 0, Math.cos(theta) * r);
    }, [phase]);

    return (
        <>
            <directionalLight
                position={sunPosition}
                intensity={3.0}
                castShadow={false}
            />
            {/* Ambient light for the dark side (Earthshine) */}
            <ambientLight intensity={0.08} color="#4a5f8a" />

            {/* Subtle rim light for depth */}
            <pointLight position={[-5, 2, 5]} intensity={0.3} color="#ffffff" distance={15} />

            <mesh ref={meshRef} rotation={[0.1, 0, 0]}>
                <sphereGeometry args={[2, 128, 128]} />
                <meshStandardMaterial
                    map={texture}
                    bumpMap={texture}
                    bumpScale={0.08}
                    roughness={0.9}
                    metalness={0.05}
                    emissive="#000000"
                    emissiveIntensity={0}
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
function StarField({ count = 2500 }) {
    const mesh = useRef<Points>(null);

    const [positions, sizes, randoms, brightness] = useMemo(() => {
        const p = new Float32Array(count * 3);
        const s = new Float32Array(count);
        const r = new Float32Array(count);
        const b = new Float32Array(count); // Base brightness

        for (let i = 0; i < count; i++) {
            // Distribute stars on a sphere but closer so they are visible
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 30 + Math.random() * 50;

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = -Math.abs(radius * Math.cos(phi));

            p[i * 3] = x;
            p[i * 3 + 1] = y;
            p[i * 3 + 2] = z;

            // Size variation: mostly small, few large
            const sizeRoll = Math.random();
            if (sizeRoll > 0.95) s[i] = 2.5 + Math.random() * 1.5; // Bright stars
            else if (sizeRoll > 0.85) s[i] = 1.8 + Math.random() * 1.0; // Medium
            else s[i] = 0.8 + Math.random() * 1.2; // Small/dim

            r[i] = Math.random();

            // Base brightness variation (0.3 to 1.0)
            // Power distribution favoring brighter stars but with good dim variety
            b[i] = 0.3 + Math.pow(Math.random(), 1.5) * 0.7;
        }
        return [p, s, r, b];
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
        attribute float brightness;
        varying float vRandom;
        varying float vBrightness;
        void main() {
            vRandom = random;
            vBrightness = brightness;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            // Increased scale factor for visibility
            gl_PointSize = size * (400.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
      `,
        fragment: `
        uniform float uTime;
        varying float vRandom;
        varying float vBrightness;
        void main() {
            vec2 xy = gl_PointCoord.xy - vec2(0.5);
            float ll = length(xy);
            if(ll > 0.5) discard;
            
            // Randomize phase significantly (vRandom * 100.0) so they don't blink together
            // Randomize speed (0.8 + vRandom * 3.5)
            float twinkle = sin(uTime * (0.8 + vRandom * 3.5) + vRandom * 100.0) * 0.5 + 0.5;
            
            // Apply base brightness + twinkle
            float opacity = vBrightness * (0.5 + 0.5 * twinkle);
            
            float glow = 1.0 - (ll * 2.0);
            glow = pow(glow, 2.0);
            
            // Subtle color tint for visual interest
            vec3 color = vec3(1.0);
            if (vBrightness > 0.8) {
                // Brighter stars have slight blue tint
                color = vec3(0.95, 0.97, 1.0);
            } else if (vBrightness < 0.5) {
                // Dimmer stars have slight warm tint
                color = vec3(1.0, 0.98, 0.95);
            }
            
            gl_FragColor = vec4(color, opacity * glow);
        }
      `
    };

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-size" count={sizes.length} array={sizes} itemSize={1} />
                <bufferAttribute attach="attributes-random" count={randoms.length} array={randoms} itemSize={1} />
                <bufferAttribute attach="attributes-brightness" count={brightness.length} array={brightness} itemSize={1} />
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

// --- SHOOTING STARS SYSTEM WITH MULTIPLE SIMULTANEOUS STARS ---
interface ShootingStar {
    pos: Vector3;
    vel: Vector3;
    hasTail: boolean;
    life: number;
    maxLife: number;
    color: Color;
    size: number;
    tailLength: number;
}

function ShootingStarsController() {
    const [stars, setStars] = useState<ShootingStar[]>([]);
    const nextId = useRef(0);

    const spawnStar = () => {
        const z = Math.random() * 5; // Increased range
        const dist = 7 - z;
        const halfH = dist * 0.414;

        // More varied spawn positions
        const x = (Math.random() - 0.5) * (halfH * 3);
        const y = halfH + 1 + Math.random() * 3;

        // More varied velocities
        const vx = (Math.random() - 0.5) * 8;
        const vy = -(6 + Math.random() * 12); // Faster falling
        const vz = (Math.random() - 0.5) * 3;

        // Varied colors - mostly white, some blue/gold tints
        const colorChoice = Math.random();
        let color = new Color('#ffffff');
        if (colorChoice > 0.85) color = new Color('#fff4e6'); // Warm
        else if (colorChoice > 0.7) color = new Color('#e6f3ff'); // Cool

        const newStar: ShootingStar = {
            pos: new Vector3(x, y, z),
            vel: new Vector3(vx, vy, vz),
            hasTail: Math.random() > 0.2, // 80% have tails
            life: 0,
            maxLife: 1.2 + Math.random() * 0.8,
            color,
            size: 0.15 + Math.random() * 0.25,
            tailLength: 6 + Math.random() * 8
        };

        setStars(prev => [...prev, newStar]);
    };

    useFrame((state, delta) => {
        // METEOR SHOWER STORM MODE: Spawn meteors very frequently
        // Adjusted spawn rate to quickly fill up to 200 meteors
        if (Math.random() < 0.35 && stars.length < 200) { // 35% spawn rate, max 200 simultaneous meteors!
            spawnStar();
        }

        // Update existing stars
        setStars(prev => {
            return prev
                .map(star => ({
                    ...star,
                    life: star.life + delta,
                    pos: star.pos.clone().addScaledVector(star.vel, delta)
                }))
                .filter(star => star.life < star.maxLife); // Remove expired stars
        });
    });

    return (
        <>
            {stars.map((star, index) => (
                <ShootingStar key={index} star={star} />
            ))}
        </>
    );
}

function ShootingStar({ star }: { star: ShootingStar }) {
    const meshRef = useRef<Mesh>(null);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.position.copy(star.pos);
            const target = star.pos.clone().add(star.vel);
            meshRef.current.lookAt(target);
            meshRef.current.rotateX(Math.PI / 2);
        }
    });

    const opacity = Math.max(0, 1 - (star.life / star.maxLife));
    const fadeIn = Math.min(1, star.life * 5); // Quick fade in
    const finalOpacity = opacity * fadeIn;

    return (
        <mesh ref={meshRef}>
            {star.hasTail ? (
                <cylinderGeometry args={[0, star.size, star.tailLength, 8]} />
            ) : (
                <sphereGeometry args={[star.size, 16, 16]} />
            )}
            <meshBasicMaterial
                color={star.color}
                transparent
                opacity={finalOpacity}
                blending={AdditiveBlending}
                toneMapped={false}
            />
        </mesh>
    );
}
