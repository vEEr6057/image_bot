'use client'

import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useTexture, Float, PresentationControls, Html } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Glitch } from '@react-three/postprocessing'
import * as THREE from 'three'

function Hologram({ url }: { url: string }) {
    const texture = useTexture(url)
    const materialRef = useRef<THREE.MeshBasicMaterial>(null)

    const aspect = texture.image ? texture.image.width / texture.image.height : 1
    const width = 3
    const height = width / aspect

    const finalWidth = height > 4 ? 4 * aspect : width
    const finalHeight = height > 4 ? 4 : height

    useFrame((state) => {
        if (materialRef.current) {
            const flicker = Math.random() > 0.98 ? 0.5 : 1
            materialRef.current.opacity = (0.8 + Math.sin(state.clock.elapsedTime * 3) * 0.1) * flicker
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
                <mesh position={[0, 0, -0.05]}>
                    <planeGeometry args={[finalWidth + 0.2, finalHeight + 0.2]} />
                    <meshBasicMaterial color="#a855f7" transparent opacity={0.5} blending={THREE.AdditiveBlending} toneMapped={false} />
                </mesh>

                {/* Scanlines */}
                <mesh position={[0, 0, 0.01]}>
                    <planeGeometry args={[finalWidth, finalHeight, 1, 50]} />
                    <meshBasicMaterial
                        color="#d8b4fe"
                        transparent
                        opacity={0.1}
                        blending={THREE.AdditiveBlending}
                        side={THREE.DoubleSide}
                        wireframe
                        toneMapped={false}
                    />
                </mesh>
            </group>
        </Float>
    )
}

export default function HolographicDisplay({ imageUrl }: { imageUrl: string }) {
    return (
        <div className="w-full h-[600px] rounded-3xl overflow-hidden bg-black/30 border border-white/5 backdrop-blur-md relative shadow-2xl">
            <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_#a855f7]" />
                <span className="text-xs text-purple-300 font-mono tracking-[0.2em]">HOLOGRAM_VIEW_V2.0</span>
            </div>

            <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
                {/* <color attach="background" args={['#050505']} /> Removed for transparency */}

                <Suspense fallback={<Html center><div className="text-purple-400 font-mono animate-pulse tracking-widest">INITIALIZING PROJECTION...</div></Html>}>
                    <PresentationControls
                        global
                        rotation={[0, 0, 0]}
                        polar={[-Math.PI / 4, Math.PI / 4]}
                        azimuth={[-Math.PI / 4, Math.PI / 4]}
                        cursor={true}
                    >
                        <Hologram url={imageUrl} />
                    </PresentationControls>

                    <EffectComposer>
                        <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.2} radius={0.4} />
                        <Noise opacity={0.05} />
                        <Glitch
                            delay={new THREE.Vector2(5, 10)}
                            duration={new THREE.Vector2(0.1, 0.3)}
                            strength={new THREE.Vector2(0.1, 0.2)}
                            ratio={0.1}
                        />
                    </EffectComposer>
                </Suspense>
            </Canvas>
        </div>
    )
}
