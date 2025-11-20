'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function StarField({ speed = 0.1 }) {
  const ref = useRef<THREE.Points>(null);
  
  const count = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100; // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 100; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100; // z
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (!ref.current) return;
    
    const positions = ref.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      // Move stars towards camera (z axis)
      positions[i * 3 + 2] += speed * (delta * 50);
      
      // Reset if too close (camera is at 50)
      if (positions[i * 3 + 2] > 50) {
        positions[i * 3 + 2] = -50;
      }
    }
    
    ref.current.geometry.attributes.position.needsUpdate = true;
    
    // Rotate slightly
    ref.current.rotation.z += delta * 0.05;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.15}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export default function VoidBackground({ warp = false }: { warp?: boolean }) {
  return (
    <div className="fixed inset-0 -z-10 bg-black">
      <Canvas camera={{ position: [0, 0, 50], fov: 75 }}>
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 20, 60]} />
        <StarField speed={warp ? 1.5 : 0.1} />
      </Canvas>
    </div>
  );
}
