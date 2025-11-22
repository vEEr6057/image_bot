import React, { useRef, useState } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

// --- Mirror Shader Material ---
const MirrorMaterial = shaderMaterial(
    {
        uTime: 0,
        uTexture: new THREE.Texture(),
        uMouse: new THREE.Vector2(0, 0),
        uResolution: new THREE.Vector2(1, 1),
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment Shader
    `
    uniform float uTime;
    uniform sampler2D uTexture;
    uniform vec2 uMouse;
    
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      
      // Liquid distortion
      float dist = distance(uv, uMouse);
      float ripple = sin(dist * 20.0 - uTime * 2.0) * 0.01 * exp(-dist * 2.0);
      
      // Subtle constant flow
      float flow = sin(uv.y * 10.0 + uTime) * 0.005;
      
      vec2 distortedUv = uv + ripple + flow;
      
      vec4 color = texture2D(uTexture, distortedUv);
      
      // Edge glow
      float edge = smoothstep(0.0, 0.1, uv.x) * smoothstep(1.0, 0.9, uv.x) * 
                   smoothstep(0.0, 0.1, uv.y) * smoothstep(1.0, 0.9, uv.y);
                   
      gl_FragColor = color;
    }
  `
)

extend({ MirrorMaterial })

function MirrorMesh({ imageUrl }: { imageUrl: string }) {
    const materialRef = useRef<any>(null)
    const [mouse, setMouse] = useState(new THREE.Vector2(0.5, 0.5))

    useFrame((state, delta) => {
        if (materialRef.current) {
            materialRef.current.uTime += delta
            // Smooth mouse interpolation could go here
            materialRef.current.uMouse = mouse
        }
    })

    const handlePointerMove = (e: any) => {
        setMouse(new THREE.Vector2(e.uv.x, e.uv.y))
    }

    const texture = new THREE.TextureLoader().load(imageUrl)

    return (
        <mesh onPointerMove={handlePointerMove}>
            <planeGeometry args={[5, 3, 64, 64]} /> {/* Aspect ratio 5:3 roughly */}
            {/* @ts-ignore */}
            <mirrorMaterial
                ref={materialRef}
                uTexture={texture}
                transparent
            />
        </mesh>
    )
}

export default function CosmicPortal({ imageUrl }: { imageUrl?: string }) {
    if (!imageUrl) return null

    return (
        <div className="w-full h-full relative rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
            <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
                <ambientLight intensity={1} />
                <MirrorMesh imageUrl={imageUrl} />
            </Canvas>

            {/* Decorative Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />
        </div>
    )
}

