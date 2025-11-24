"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import MonitorScreen from "./MonitorScreen";

const RetroComputer = () => {
    const group = useRef<THREE.Group>(null);

    // Materials
    const beigePlastic = new THREE.MeshStandardMaterial({ color: "#e8e4d0", roughness: 0.6 });
    const darkPlastic = new THREE.MeshStandardMaterial({ color: "#222222", roughness: 0.8 });
    const blackPlastic = new THREE.MeshStandardMaterial({ color: "#111111", roughness: 0.5 });
    const screenGlass = new THREE.MeshPhysicalMaterial({
        color: "#000000",
        roughness: 0.2,
        metalness: 0.1,
        transmission: 0.1,
        thickness: 0.5,
    });

    return (
        <group ref={group} position={[0, -1, 0]}>
            {/* --- KEYBOARD UNIT --- */}
            <group position={[0, 0, 2]}>
                {/* Main Case Body (Wedge Shape) */}
                <mesh position={[0, 0.5, 0]} castShadow receiveShadow material={beigePlastic}>
                    <boxGeometry args={[8, 1.5, 5]} />
                </mesh>

                {/* Black Strip (Function Keys Area) */}
                <mesh position={[0, 1.26, -1.5]} receiveShadow material={blackPlastic}>
                    <boxGeometry args={[7.8, 0.1, 1.5]} />
                </mesh>

                {/* Keyboard Area (Recessed) */}
                <mesh position={[0, 1.26, 1]} receiveShadow material={darkPlastic}>
                    <boxGeometry args={[7.5, 0.1, 2.5]} />
                </mesh>

                {/* Keys (Simplified Rows) */}
                {/* Row 1 */}
                {[-3, -2, -1, 0, 1, 2, 3].map((x) => (
                    <mesh key={`r1-${x}`} position={[x * 0.8, 1.35, 0.5]} castShadow material={beigePlastic}>
                        <boxGeometry args={[0.6, 0.3, 0.6]} />
                    </mesh>
                ))}
                {/* Row 2 */}
                {[-3, -2, -1, 0, 1, 2, 3].map((x) => (
                    <mesh key={`r2-${x}`} position={[x * 0.8 + 0.4, 1.35, 1.3]} castShadow material={beigePlastic}>
                        <boxGeometry args={[0.6, 0.3, 0.6]} />
                    </mesh>
                ))}
            </group>

            {/* --- MONITOR --- */}
            <group position={[0, 2.5, -1]}>
                {/* Monitor Casing */}
                <mesh position={[0, 0, 0]} castShadow receiveShadow material={beigePlastic}>
                    <boxGeometry args={[6, 5, 5]} />
                </mesh>

                {/* Screen Bezel/Frame */}
                <mesh position={[0, 0.2, 2.51]} material={darkPlastic}>
                    <planeGeometry args={[5, 3.8]} />
                </mesh>

                {/* The Screen Content (HTML Overlay) */}
                <group position={[0, 0.2, 2.52]}>
                    <Html
                        transform
                        occlude
                        position={[0, 0, 0]}
                        style={{
                            width: "480px",
                            height: "360px",
                            backgroundColor: "black",
                            borderRadius: "20px", // Curved corners for CRT look
                        }}
                        scale={0.1} // Scale down to fit 3D world
                    >
                        <MonitorScreen />
                    </Html>
                </group>
            </group>

            {/* --- DESK --- */}
            <mesh position={[0, -0.8, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial color="#5c4033" roughness={0.9} />
            </mesh>
        </group>
    );
};

export default RetroComputer;
