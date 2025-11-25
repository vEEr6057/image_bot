"use client";

import React, { useRef } from "react";
import { Stars, Plane } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const RetroEnvironment = () => {
    const gridRef = useRef<THREE.Mesh>(null);

    // Animate grid movement for that "driving forward" feeling
    useFrame((state) => {
        if (gridRef.current) {
            gridRef.current.position.z = (state.clock.getElapsedTime() * 0.5) % 2;
        }
    });

    return (
        <group>
            {/* Starfield */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            {/* Retro Sun */}
            <mesh position={[0, 10, -50]}>
                <circleGeometry args={[15, 32]} />
                <meshBasicMaterial color={"#ff0055"} />
            </mesh>
            {/* Sun Glow */}
            <pointLight position={[0, 10, -40]} color="#ff0055" intensity={2} distance={100} />

            {/* Moving Grid Floor */}
            <group position={[0, -2, 0]}>
                <gridHelper
                    args={[100, 50, 0xff00ff, 0x220044]}
                    position={[0, 0, 0]}
                    scale={[1, 1, 1]}
                />
                {/* Second grid for infinite scrolling illusion if needed, 
             but simple gridHelper is often enough for static scenes. 
             Let's use a large plane with a grid shader or just a simple gridHelper for now.
         */}
            </group>

            {/* Fog to blend the floor into the distance */}
            <fog attach="fog" args={['#000000', 5, 60]} />
        </group>
    );
};

export default RetroEnvironment;
