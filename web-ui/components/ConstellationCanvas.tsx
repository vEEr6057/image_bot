import React, { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

function Stars({ isHovering, forceHover }: { isHovering: boolean; forceHover?: boolean }) {
    const ref = useRef<any>(null)

    // Generate random star positions
    const sphere = useMemo(() => {
        const positions = new Float32Array(800 * 3)
        for (let i = 0; i < 800; i++) {
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
        const positions = new Float32Array(800 * 3)
        for (let i = 0; i < 800; i++) {
            // Simple arrow shape logic
            let x, y, z
            if (i < 200) {
                // Shaft (Wider and Taller)
                x = (Math.random() - 0.5) * 2
                y = (Math.random() - 0.5) * 6 - 2
                z = (Math.random() - 0.5) * 2
            } else {
                // Head (Larger)
                const t = Math.random()
                y = 1 + t * 4
                x = (Math.random() - 0.5) * (3 - t * 3) * 3
                z = (Math.random() - 0.5) * 2
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
        const speed = 6 * delta

        for (let i = 0; i < 800; i++) {
            const ix = i * 3
            const iy = i * 3 + 1
            const iz = i * 3 + 2

            if (isHovering || forceHover) {
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
                    color={(isHovering || forceHover) ? "#00ffff" : "#ffffff"}
                    size={0.12}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </Points>
        </group>
    )
}

export default function ConstellationCanvas({ onHover, forceHover }: { onHover?: (hovering: boolean) => void; forceHover?: boolean }) {
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
            className="w-full h-full absolute inset-0 pointer-events-none"
        >
            <Canvas
                camera={{ position: [0, 0, 10], fov: 60 }}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                className="pointer-events-auto"
            >
                <ambientLight intensity={0.5} />
                <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
                    <Stars isHovering={hovered} forceHover={forceHover} />
                </Float>
            </Canvas>
        </div>
    )
}
