import React, { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

function Stars({ isHovering }: { isHovering: boolean }) {
    const ref = useRef<any>(null)

    // Generate random star positions
    const sphere = useMemo(() => {
        const positions = new Float32Array(500 * 3)
        for (let i = 0; i < 500; i++) {
            const theta = 2 * Math.PI * Math.random()
            const phi = Math.acos(2 * Math.random() - 1)
            const r = 10 * Math.cbrt(Math.random()) // Random spread

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            positions[i * 3 + 2] = r * Math.cos(phi)
        }
        return positions
    }, [])

    // Target shape (Upload Icon - Arrow Up)
    const targetShape = useMemo(() => {
        const positions = new Float32Array(500 * 3)
        for (let i = 0; i < 500; i++) {
            // Simple arrow shape logic
            let x, y, z
            if (i < 200) {
                // Shaft
                x = (Math.random() - 0.5) * 1
                y = (Math.random() - 0.5) * 4 - 1
                z = 0
            } else {
                // Head
                const t = Math.random()
                y = 1 + t * 2
                x = (Math.random() - 0.5) * (2 - t * 2) * 2
                z = 0
            }
            positions[i * 3] = x
            positions[i * 3 + 1] = y
            positions[i * 3 + 2] = z
        }
        return positions
    }, [])

    useFrame((state, delta) => {
        if (!ref.current) return

        const positions = ref.current.geometry.attributes.position.array
        const speed = 3 * delta

        for (let i = 0; i < 500; i++) {
            const ix = i * 3
            const iy = i * 3 + 1
            const iz = i * 3 + 2

            if (isHovering) {
                // Move towards target shape
                positions[ix] += (targetShape[ix] - positions[ix]) * speed
                positions[iy] += (targetShape[iy] - positions[iy]) * speed
                positions[iz] += (targetShape[iz] - positions[iz]) * speed
            } else {
                // Drift back to random sphere
                positions[ix] += (sphere[ix] - positions[ix]) * speed * 0.5
                positions[iy] += (sphere[iy] - positions[iy]) * speed * 0.5
                positions[iz] += (sphere[iz] - positions[iz]) * speed * 0.5
            }
        }

        ref.current.geometry.attributes.position.needsUpdate = true
        ref.current.rotation.y += delta * 0.1
    })

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color={isHovering ? "#06b6d4" : "#ffffff"}
                    size={0.1}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </Points>
        </group>
    )
}

export default function ConstellationCanvas({ onHover }: { onHover?: (hovering: boolean) => void }) {
    const [hovered, setHovered] = useState(false)

    const handlePointerOver = () => {
        setHovered(true)
        onHover?.(true)
    }

    const handlePointerOut = () => {
        setHovered(false)
        onHover?.(false)
    }

    return (
        <div
            className="w-full h-full absolute inset-0"
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
        >
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
                    <Stars isHovering={hovered} />
                </Float>
            </Canvas>
        </div>
    )
}
