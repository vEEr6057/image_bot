'use client'

import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useTexture, Float, PresentationControls, Html, Loader } from '@react-three/drei'
import * as THREE from 'three'

function Hologram({ url }: { url: string }) {
    const texture = useTexture(url)
    const materialRef = useRef<THREE.MeshBasicMaterial>(null)

    // Calculate aspect ratio to keep image not distorted
    // Default to 1 if not loaded yet (though Suspense handles this)
    const aspect = texture.image ? texture.image.width / texture.image.height : 1
    const width = 3
    const height = width / aspect

    // Limit height if it's too tall
    const finalWidth = height > 4 ? 4 * aspect : width
    const finalHeight = height > 4 ? 4 : height

    useFrame((state) => {
        if (materialRef.current) {
            // Holographic flicker effect
            const flicker = Math.random() > 0.95 ? 0.8 : 1
            materialRef.current.opacity = (0.9 + Math.sin(state.clock.elapsedTime * 2) * 0.05) * flicker
        }
    })

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <group>
                {/* Main Image */}
                <mesh>
                    <planeGeometry args={[finalWidth, finalHeight]} />
                    <meshBasicMaterial
                        ref={materialRef}
                        map={texture}
                        transparent
                        side={THREE.DoubleSide}
                        toneMapped={false}
                    />
                </mesh>

                {/* Holographic Glow/Border */}
                <mesh position={[0, 0, -0.02]}>
                    <planeGeometry args={[finalWidth + 0.1, finalHeight + 0.1]} />
                    <meshBasicMaterial color="#a855f7" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
                </mesh>

                {/* Scanlines */}
                <mesh position={[0, 0, 0.01]}>
                    <planeGeometry args={[finalWidth, finalHeight]} />
                    <meshBasicMaterial
                        color="#a855f7"
                        transparent
                        opacity={0.05}
                        blending={THREE.AdditiveBlending}
                        side={THREE.DoubleSide}
                        wireframe
                        wireframeLinewidth={1}
                    />
                </mesh>
            </group>
        </Float>
    )
}

export default function HolographicDisplay({ imageUrl }: { imageUrl: string }) {
    return (
        <div className="w-full h-[500px] rounded-2xl overflow-hidden bg-black/20 border border-white/10 backdrop-blur-sm relative">
            <div className="absolute top-4 left-4 z-10 bg-black/50 px-3 py-1 rounded-full border border-purple-500/30">
                <span className="text-xs text-purple-300 font-mono tracking-wider">HOLOGRAM_VIEW_V1.0</span>
            </div>

            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <Suspense fallback={<Html center><div className="text-purple-400 animate-pulse">Loading Hologram...</div></Html>}>
                    <PresentationControls
                        global
                        rotation={[0, 0, 0]}
                        polar={[-Math.PI / 4, Math.PI / 4]}
                        azimuth={[-Math.PI / 4, Math.PI / 4]}
                    >
                        <Hologram url={imageUrl} />
                    </PresentationControls>
                </Suspense>
            </Canvas>
        </div>
    )
}
