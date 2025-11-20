'use client'

import { useState, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Float, Stars } from '@react-three/drei'
import * as THREE from 'three'

function Asteroid({ initialPos, onHit }: { initialPos: [number, number, number], onHit: () => void }) {
    const ref = useRef<THREE.Group>(null)
    const [hovered, setHover] = useState(false)
    const speed = useRef(2 + Math.random() * 2)

    useFrame((state, delta) => {
        if (!ref.current) return

        // Move forward
        ref.current.position.z += delta * speed.current

        // Rotate
        ref.current.rotation.x += delta
        ref.current.rotation.y += delta

        // Reset if passed camera
        if (ref.current.position.z > 8) {
            resetPosition()
        }
    })

    const resetPosition = () => {
        if (!ref.current) return
        ref.current.position.z = -30 - Math.random() * 20
        ref.current.position.x = (Math.random() - 0.5) * 20
        ref.current.position.y = (Math.random() - 0.5) * 12
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
                    color={hovered ? "#ff0055" : "#888888"}
                    emissive={hovered ? "#ff0055" : "#444444"}
                    emissiveIntensity={hovered ? 2 : 0.5}
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>
        </group>
    )
}

function Crosshair() {
    const ref = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (ref.current) {
            ref.current.position.x = state.pointer.x * 10
            ref.current.position.y = state.pointer.y * 6
        }
    })

    return (
        <group ref={ref} position={[0, 0, 2]}>
            <mesh>
                <ringGeometry args={[0.2, 0.25, 32]} />
                <meshBasicMaterial color="#00ff00" transparent opacity={0.5} />
            </mesh>
            <mesh>
                <circleGeometry args={[0.05, 32]} />
                <meshBasicMaterial color="#00ff00" transparent opacity={0.8} />
            </mesh>
        </group>
    )
}

export default function AsteroidShooter() {
    const [score, setScore] = useState(0)

    // Generate initial asteroids
    const asteroids = useMemo(() => {
        return new Array(15).fill(0).map(() => [
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 12,
            -10 - Math.random() * 20
        ] as [number, number, number])
    }, [])

    return (
        <div className="w-full h-[350px] rounded-2xl overflow-hidden border-2 border-green-500/30 relative bg-black/80 shadow-[0_0_30px_rgba(0,255,0,0.1)]">
            {/* UI Overlay */}
            <div className="absolute top-4 left-4 z-10 flex flex-col pointer-events-none">
                <span className="text-green-400 font-mono text-xs tracking-widest mb-1">DEFENSE SYSTEM ACTIVE</span>
                <span className="text-white font-mono text-2xl font-bold drop-shadow-[0_0_10px_rgba(0,255,0,0.8)]">
                    SCORE: {score.toString().padStart(6, '0')}
                </span>
            </div>

            <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
                <span className="text-green-500/50 font-mono text-xs">CLICK TO DESTROY TARGETS</span>
            </div>

            <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
                <color attach="background" args={['#050505']} />
                <fog attach="fog" args={['#050505', 10, 50]} />

                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, 5]} intensity={0.5} color="#00ff00" />

                <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />

                {asteroids.map((pos, i) => (
                    <Asteroid
                        key={i}
                        initialPos={pos}
                        onHit={() => setScore(s => s + 150)}
                    />
                ))}

                <Crosshair />
            </Canvas>
        </div>
    )
}
