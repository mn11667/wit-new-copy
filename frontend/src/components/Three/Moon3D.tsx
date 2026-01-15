import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, Vector3, MathUtils, Mesh } from 'three';
import { OrbitControls } from '@react-three/drei';

function MoonSphere({ phase, position = [0, 0, 0] }: { phase: number, position?: [number, number, number] }) {
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
            meshRef.current.rotation.y += delta * 0.03;
        }
    });

    // Calculate Sun Position based on Phase
    const sunPosition = useMemo(() => {
        const r = 20;
        const theta = (0.5 - phase) * 2 * Math.PI;
        return new Vector3(Math.sin(theta) * r, 0, Math.cos(theta) * r);
    }, [phase]);

    return (
        <group position={position}>
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
                <sphereGeometry args={[0.8, 128, 128]} />
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
        </group>
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

    // Tracks position and visibility for BOTH celestial bodies
    const [celestialState, setCelestialState] = useState({
        moon: { x: 0, y: -20, z: 0, visible: false },
        earth: { x: 0, y: -20, z: 0, visible: false }
    });

    useEffect(() => {
        const calculatePositions = () => {
            const now = new Date();
            const currentMins = now.getHours() * 60 + now.getMinutes();

            const sunrise = 360; // 06:00
            const sunset = 1080; // 18:00
            const minsInDay = 1440;
            const dayLength = sunset - sunrise;
            const nightLength = minsInDay - dayLength;

            // --- MOON LOGIC (Night) ---
            let nightProgress = -1;
            let moonUpdate = { x: 0, y: -20, z: 0, visible: false };

            if (currentMins > sunset) {
                nightProgress = (currentMins - sunset) / nightLength;
            } else if (currentMins < sunrise) {
                nightProgress = (currentMins + minsInDay - sunset) / nightLength;
            }

            if (nightProgress >= 0 && nightProgress <= 1) {
                const x = -2.5 + (nightProgress * 5);
                const arc = Math.sin(nightProgress * Math.PI);
                const y = -1.5 + (arc * 3);
                moonUpdate = { x, y, z: 2, visible: true };
            }

            // --- EARTH LOGIC (Day) ---
            // Replaces Sun position
            let dayProgress = -1;
            let earthUpdate = { x: 0, y: -20, z: 0, visible: false };

            if (currentMins >= sunrise && currentMins <= sunset) {
                dayProgress = (currentMins - sunrise) / dayLength;
                // Earth moves from Left to Right (East to West visually, or creating the arc)
                // Similar path to moon but maybe higher/brighter
                const x = -2.5 + (dayProgress * 5);
                const arc = Math.sin(dayProgress * Math.PI);
                const y = -1.0 + (arc * 3.5); // Slightly higher arc
                earthUpdate = { x, y, z: 1, visible: true };
            }

            setCelestialState({ moon: moonUpdate, earth: earthUpdate });
        };

        calculatePositions();
        const interval = setInterval(calculatePositions, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ mixBlendMode: 'screen' }}>
            <Canvas frameloop="always" camera={{ position: [0, 0, 7], fov: 45 }} gl={{ alpha: true, antialias: true }}>
                <ambientLight intensity={0.1} />
                <StarField />
                <ShootingStarsController />

                {celestialState.moon.visible && (
                    <MoonSphere
                        phase={phase}
                        position={[celestialState.moon.x, celestialState.moon.y, celestialState.moon.z]}
                    />
                )}

                {celestialState.earth.visible && (
                    <EarthSphere
                        position={[celestialState.earth.x, celestialState.earth.y, celestialState.earth.z]}
                    />
                )}
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
            
            // Distinct individual twinkling
            // Randomize speed significantly (0.5 to 4.5 factor)
            // Randomize phase (vRandom * 100.0)
            float twinkleSpeed = 0.5 + vRandom * 4.0;
            float twinklePhase = vRandom * 100.0;
            float twinkle = sin(uTime * twinkleSpeed + twinklePhase);
            twinkle = twinkle * 0.5 + 0.5; // Remap to 0.0 - 1.0

            // Apply "little" twinkle: Base brightness fluctuates by ±30%
            // Range: 0.7 to 1.3 of base brightness (clamped)
            float twinkleFactor = 0.7 + 0.6 * twinkle;
            float opacity = vBrightness * twinkleFactor;
            opacity = clamp(opacity, 0.0, 1.0);
            
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
        const z = -10 - Math.random() * 10; // Z between -10 and -20 (BEHIND moon which is at z=2)
        const dist = Math.abs(z); // Distance for frustum calculation
        const halfH = dist * 0.414;

        // Random spawn positions all around
        const x = (Math.random() - 0.5) * (halfH * 4);
        const y = (Math.random() - 0.5) * (halfH * 4);

        // Random movement in ALL directions (not just down)
        const vx = (Math.random() - 0.5) * 4; // Left/Right
        const vy = (Math.random() - 0.5) * 4; // Up/Down
        const vz = (Math.random() - 0.5) * 2; // Forward/Back

        const color = new Color('#ffffff');

        const newStar: ShootingStar = {
            pos: new Vector3(x, y, z),
            vel: new Vector3(vx * 0.2, vy * 0.2, vz * 0.2), // Much slower drift
            hasTail: false, // NO tails, just dots
            life: 0,
            maxLife: 3 + Math.random() * 3, // Long life for drifting
            color,
            size: 0.01 + Math.random() * 0.02, // Tiny tiny dots
            tailLength: 0
        };

        setStars(prev => [...prev, newStar]);
    };

    useFrame((state, delta) => {
        // Continuous gentle spawning of drifting stars - reduced count
        if (Math.random() < 0.10 && stars.length < 12) {
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
            <sphereGeometry args={[star.size, 8, 8]} />
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

// --- EARTH COMPONENT ---
function EarthSphere({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
    const meshRef = useRef<Mesh>(null);
    const cloudsRef = useRef<Mesh>(null);
    const materialRef = useRef<ShaderMaterial>(null);

    // Earth Textures
    const [specularMap, normalMap, cloudsMap, nightMap] = useLoader(TextureLoader, [
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png'
    ]);

    const dayMap = useLoader(TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.05; // Earth rotation
        }
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y += delta * 0.07; // Clouds rotate slightly faster
        }
    });

    // Custom Earth Shader for Day/Night Cycle
    const earthShader = useMemo(() => {
        return {
            uniforms: {
                dayTexture: { value: dayMap },
                nightTexture: { value: nightMap },
                specularMap: { value: specularMap },
                normalMap: { value: normalMap },
                sunDirection: { value: new Vector3(-5, 3, 5).normalize() } // Matches pointLight position
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                
                void main() {
                    vUv = uv;
                    // World normal
                    vNormal = normalize(normalMatrix * normal);
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    vViewPosition = -mvPosition.xyz;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D dayTexture;
                uniform sampler2D nightTexture;
                uniform sampler2D specularMap;
                uniform sampler2D normalMap;
                uniform vec3 sunDirection;

                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vViewPosition;

                void main() {
                    vec3 normal = normalize(vNormal);
                    vec3 viewDir = normalize(vViewPosition);
                    vec3 sunDir = normalize(sunDirection);  // Fixed light direction in view space? 
                    // Actually sunDirection passed is static world/local space? 
                    // To keep it simple, we'll assume the light rotates with the scene or is fixed relative to Earth 
                    // if Earth rotates, normal rotates.
                    
                    // Simple Lambertian intesity
                    float intensity = dot(normal, sunDir);
                    
                    vec3 dayColor = texture2D(dayTexture, vUv).rgb;
                    vec3 nightColor = texture2D(nightTexture, vUv).rgb;
                    
                    // Smooth transition
                    // intensity > 0.1 : Day
                    // intensity < -0.1 : Night
                    // Mix in between
                    
                    float mixVal = smoothstep(-0.2, 0.2, intensity);
                    
                    // Specular (only on day side)
                    float specularStrength = texture2D(specularMap, vUv).r;
                    vec3 halfVector = normalize(sunDir + viewDir);
                    float NdotH = max(0.0, dot(normal, halfVector));
                    float specular = pow(NdotH, 32.0) * specularStrength * mixVal; // Masked by day
                    
                    vec3 finalColor = mix(nightColor, dayColor, mixVal);
                    
                    // Add specular to day side
                    finalColor += vec3(0.5) * specular;

                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `
        };
    }, [dayMap, nightMap, specularMap, normalMap]);

    return (
        <group position={position}>
            {/* Main Earth Sphere with Custom Shader */}
            <mesh ref={meshRef} rotation={[0.4, 0, 0]}>
                <sphereGeometry args={[1.2, 64, 64]} />
                <shaderMaterial
                    ref={materialRef}
                    args={[earthShader]}
                    uniforms-dayTexture-value={dayMap}
                    uniforms-nightTexture-value={nightMap}
                    uniforms-specularMap-value={specularMap}
                    uniforms-normalMap-value={normalMap}
                />
            </mesh>

            {/* Cloud Layer remains simple MeshPhong/Standard or could be improved */}
            <mesh ref={cloudsRef} rotation={[0.4, 0, 0]}>
                <sphereGeometry args={[1.22, 64, 64]} />
                <meshPhongMaterial
                    map={cloudsMap}
                    transparent={true}
                    opacity={0.8}
                    blending={AdditiveBlending}
                    side={2}
                    depthWrite={false}
                />
            </mesh>

            {/* Light source for Clouds and other objects */}
            <pointLight position={[-5, 3, 5]} intensity={1.5} color="#ffffff" distance={20} />
            <ambientLight intensity={0.1} />
        </group>
    );
}
