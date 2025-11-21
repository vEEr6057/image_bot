import React, { useRef } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { useTexture, shaderMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

// --- Portal Shader Material ---
const PortalMaterial = shaderMaterial(
    {
        uTime: 0,
        uColorStart: new THREE.Color('#ff00ff'),
        uColorEnd: new THREE.Color('#00ffff'),
        uTexture: new THREE.Texture(),
        uHasTexture: 0.0,
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
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;
    uniform sampler2D uTexture;
    uniform float uHasTexture;
    
    varying vec2 vUv;

    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 centeredUv = vUv - 0.5;
      float dist = length(centeredUv);
      float angle = atan(centeredUv.y, centeredUv.x);
      
      float noise = snoise(vec2(angle * 2.0 - uTime * 0.5, dist * 3.0 - uTime * 0.2));
      float ring = 0.05 / abs(dist - 0.4 + noise * 0.05);
      
      vec3 color = mix(uColorStart, uColorEnd, dist + noise);
      color *= ring;
      
      if (uHasTexture > 0.5 && dist < 0.4) {
          float distort = snoise(vec2(vUv.x * 10.0, vUv.y * 10.0 + uTime)) * 0.02;
          vec2 distortedUv = vUv + distort;
          float mask = smoothstep(0.4, 0.35, dist);
          vec4 img = texture2D(uTexture, distortedUv);
          color = mix(color, img.rgb, mask * 0.9);
      }

      gl_FragColor = vec4(color, 1.0);
    }
  `
)

extend({ PortalMaterial })

function PortalMesh({ imageUrl }: { imageUrl?: string }) {
    const materialRef = useRef<any>(null)
    const texture = useTexture(imageUrl || '/placeholder.png')

    useFrame((state, delta) => {
        if (materialRef.current) {
            materialRef.current.uTime += delta
            if (imageUrl) {
                materialRef.current.uTexture = texture
                materialRef.current.uHasTexture = 1.0
            } else {
                materialRef.current.uHasTexture = 0.0
            }
        }
    })

    return (
        <mesh scale={[1.5, 1.5, 1.5]}>
            <planeGeometry args={[4, 4, 64, 64]} />
            {/* @ts-ignore */}
            <portalMaterial
                ref={materialRef}
                transparent
                side={THREE.DoubleSide}
                uColorStart={new THREE.Color('#a855f7')}
                uColorEnd={new THREE.Color('#06b6d4')}
            />
        </mesh>
    )
}

export default function CosmicPortal({ imageUrl }: { imageUrl?: string }) {
    return (
        <div className="w-full h-[500px] relative">
            <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <PortalMesh imageUrl={imageUrl} />
                </Float>
            </Canvas>

            {!imageUrl && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-cyan-400 font-mono text-sm tracking-[0.5em] animate-pulse drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                        OPENING RIFT...
                    </p>
                </div>
            )}
        </div>
    )
}
