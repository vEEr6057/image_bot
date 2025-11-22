import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Particles({ count = 2000 }) {
    const ref = useRef<any>(null)

    const [positions, colors] = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const colors = new Float32Array(count * 3)
        const color = new THREE.Color()

        for (let i = 0; i < count; i++) {
            // Tunnel shape
            const r = 2 + Math.random() * 5
            const theta = Math.random() * Math.PI * 2
            const z = (Math.random() - 0.5) * 50

            positions[i * 3] = r * Math.cos(theta)
            positions[i * 3 + 1] = r * Math.sin(theta)
            positions[i * 3 + 2] = z

            // Cyberpunk colors
            if (Math.random() > 0.5) {
                color.set('#06b6d4') // Cyan
            } else {
                color.set('#a855f7') // Purple
            }

            colors[i * 3] = color.r
            colors[i * 3 + 1] = color.g
            colors[i * 3 + 2] = color.b
        }
        return [positions, colors]
    }, [count])

    useFrame((state, delta) => {
        if (!ref.current) return

        const positions = ref.current.geometry.attributes.position.array
        const speed = 20 * delta // Fast warp speed

        for (let i = 0; i < count; i++) {
            const iz = i * 3 + 2

            // Move particles towards camera
            positions[iz] += speed

            // Reset if behind camera
            if (positions[iz] > 10) {
                positions[iz] = -40
            }
        }

        ref.current.geometry.attributes.position.needsUpdate = true
        ref.current.rotation.z += delta * 0.5 // Spiral effect
    })

    return (
        <Points ref={ref} positions={positions} colors={colors} stride={3}>
            <PointMaterial
                transparent
                vertexColors
                size={0.15}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    )
}

export default function ParticleTransition() {
    return (
        <div className="w-full h-screen fixed inset-0 z-50 bg-black">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <Particles />
            </Canvas>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <h2 className="text-4xl font-bold text-white tracking-[1em] animate-pulse drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]">
                    PROCESSING
                </h2>
            </div>
        </div>
    )
}
