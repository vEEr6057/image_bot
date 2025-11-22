import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { shaderMaterial, Image } from '@react-three/drei'
import * as THREE from 'three'

// --- Reveal Shader Material ---
const RevealMaterial = shaderMaterial(
    {
        uTime: 0,
        uTexture: new THREE.Texture(),
        uProgress: 0, // 0 = noise, 1 = clear image
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
    uniform float uProgress;
    
    varying vec2 vUv;

    // Simple noise function
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      vec2 uv = vUv;
      
      // Pixelate effect based on progress (starts blocky, becomes smooth)
      float pixels = mix(50.0, 2000.0, uProgress);
      vec2 pixelUv = floor(uv * pixels) / pixels;
      
      // Noise dissolve
      float noise = random(pixelUv + floor(uTime));
      
      vec4 color = texture2D(uTexture, uv);
      
      // Mix between noise color and texture color
      vec3 noiseColor = vec3(noise * 0.2); // Dark noise
      
      // Reveal logic
      float reveal = smoothstep(0.0, 1.0, uProgress);
      
      // If progress is low, show noise/particles
      // As progress increases, show image
      vec3 finalColor = mix(noiseColor, color.rgb, reveal);
      
      // Add a scanning line effect during transition
      float scan = sin(uv.y * 50.0 - uTime * 5.0) * 0.1 * (1.0 - reveal);
      finalColor += scan;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
)

extend({ RevealMaterial })

function RevealMesh({ imageUrl }: { imageUrl: string }) {
    const materialRef = useRef<any>(null)
    const [progress, setProgress] = useState(0)

    // Animate progress from 0 to 1 on mount
    useEffect(() => {
        let start = 0
        const interval = setInterval(() => {
            start += 0.02
            if (start >= 1) {
                start = 1
                clearInterval(interval)
            }
            setProgress(start)
        }, 30)
        return () => clearInterval(interval)
    }, [imageUrl])

    useFrame((state, delta) => {
        if (materialRef.current) {
            materialRef.current.uTime += delta
            materialRef.current.uProgress = progress
        }
    })

    const texture = new THREE.TextureLoader().load(imageUrl)

    return (
        <mesh>
            <planeGeometry args={[5, 3, 64, 64]} />
            {/* @ts-ignore */}
            <revealMaterial
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
        <div className="w-full h-full relative rounded-2xl overflow-hidden border-2 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.3)] bg-black">
            {/* Use standard Image component for guaranteed visibility, overlay shader if needed */}
            {/* Actually, let's use the Shader for the effect, but ensure aspect ratio is handled */}
            <Canvas camera={{ position: [0, 0, 3.5], fov: 50 }}>
                <ambientLight intensity={1} />
                <RevealMesh imageUrl={imageUrl} />
            </Canvas>

            {/* Decorative Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />
        </div>
    )
}
