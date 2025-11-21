'use client'

import { useState, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Float, Stars, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

function Asteroid({ initialPos, onHit }: { initialPos: [number, number, number], onHit: () => void }) {
    const ref = useRef<THREE.Group>(null)
    const [hovered, setHover] = useState(false)
    const speed = useRef(2 + Math.random() * 2)
    const rotSpeed = useRef({ x: Math.random() * 2, y: Math.random() * 2 })

    useFrame((state, delta) => {
        if (!ref.current) return

        // Move forward
        ref.current.position.z += delta * speed.current

        // Rotate
        ref.current.rotation.x += delta * rotSpeed.current.x
        ref.current.rotation.y += delta * rotSpeed.current.y

        // Reset if passed camera
        if (ref.current.position.z > 8) {
            resetPosition()
        }
    })

    const resetPosition = () => {
        if (!ref.current) return
        ref.current.position.z = -40 - Math.random() * 20
        ref.current.position.x = (Math.random() - 0.5) * 25
        ref.current.position.y = (Math.random() - 0.5) * 15
        speed.current = 2 + Math.random() * 3
    }

    const handleClick = (e: any) => {
        e.stopPropagation()
        onHit()
        resetPosition()
    }

    return (
        <group ref={ref} position={initialPos}>
            <mesh
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
                onClick={handleClick}
            >
                <dodecahedronGeometry args={[0.8, 0]} />
                <meshStandardMaterial
                    color={hovered ? "#ff0055" : "#222222"}
                    emissive={hovered ? "#ff0055" : "#444444"}
                    emissiveIntensity={hovered ? 4 : 0.2}
                    roughness={0.2}
                    metalness={0.8}
                    wireframe={!hovered}
                />
            </mesh>
            {/* Core glow */}
            <mesh scale={0.7}>
                <dodecahedronGeometry args={[0.8, 0]} />
                <meshBasicMaterial color={hovered ? "#ffaaaa" : "#000000"} />
            </mesh>
        </group>
    )
}

function Crosshair() {
    const ref = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (ref.current) {
            ref.current.position.x = state.pointer.x * 12
            ref.current.position.y = state.pointer.y * 7
        }
    })

    return (
        <group ref={ref} position={[0, 0, 2]}>
            <mesh>
                <ringGeometry args={[0.3, 0.35, 32]} />
                <meshBasicMaterial color="#00ffaa" transparent opacity={0.8} toneMapped={false} />
            </mesh>
            <mesh>
                <circleGeometry args={[0.05, 32]} />
                <meshBasicMaterial color="#00ffaa" transparent opacity={1} toneMapped={false} />
            </mesh>
        </group>
    )
}

export default function AsteroidShooter() {
    const [score, setScore] = useState(0)

    // Generate initial asteroids
    const asteroids = useMemo(() => {
        return new Array(20).fill(0).map(() => [
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 15,
            -10 - Math.random() * 30
        ] as [number, number, number])
    }, [])

    return (
        <div className="w-full h-[400px] rounded-3xl overflow-hidden relative bg-black/40 backdrop-blur-md shadow-[0_0_50px_rgba(0,255,100,0.1)] border border-white/5">
            {/* UI Overlay */}
            <div className="absolute top-6 left-6 z-10 flex flex-col pointer-events-none select-none">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-400 font-mono text-xs tracking-[0.2em]">DEFENSE SYSTEM</span>
                </div>
                <span className="text-white font-mono text-4xl font-bold drop-shadow-[0_0_15px_rgba(0,255,100,0.5)]">
                    {score.toString().padStart(6, '0')}
                </span>
            </div>

            <div className="absolute bottom-6 right-6 z-10 pointer-events-none select-none">
                <span className="text-green-500/50 font-mono text-xs tracking-widest">TARGET LOCK: ACTIVE</span>
            </div>

            <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 2]}>
                <color attach="background" args={['#020202']} />
                <fog attach="fog" args={['#020202', 10, 60]} />

                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
                <Sparkles count={50} scale={10} size={2} speed={0.4} opacity={0.5} color="#00ffaa" />

                {asteroids.map((pos, i) => (
                    <Asteroid
                        key={i}
                        initialPos={pos}
                        onHit={() => setScore(s => s + 150)}
                    />
                ))}

                <Crosshair />

                <EffectComposer>
                    <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.5} />
                </EffectComposer>
            </Canvas>
        </div>
    )
}
