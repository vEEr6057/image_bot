"use client";

import React, { useRef } from "react";
import { Html, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import MonitorScreen from "./MonitorScreen";

const RetroComputer = () => {
    const group = useRef<THREE.Group>(null);

    // Materials
    const beigePlastic = new THREE.MeshStandardMaterial({ color: "#e8e4d0", roughness: 0.5, metalness: 0.1 });
    const darkPlastic = new THREE.MeshStandardMaterial({ color: "#222222", roughness: 0.7 });
    const keyMaterial = new THREE.MeshStandardMaterial({ color: "#333333", roughness: 0.4 });
    const redKeyMaterial = new THREE.MeshStandardMaterial({ color: "#880000", roughness: 0.4 });

    return (
        <group ref={group} position={[0, -1, 0]}>
            {/* --- KEYBOARD UNIT --- */}
            <group position={[0, 0, 2]}>
                {/* Main Case Body (Wedge Shape) - Using RoundedBox for smoother edges */}
                <RoundedBox args={[8, 1.5, 5]} radius={0.1} smoothness={4} position={[0, 0.5, 0]} castShadow receiveShadow material={beigePlastic}>
                    <meshStandardMaterial color="#e8e4d0" roughness={0.6} />
                </RoundedBox>

                {/* Black Strip (Function Keys Area) */}
                <mesh position={[0, 1.26, -1.5]} receiveShadow material={darkPlastic}>
                    <boxGeometry args={[7.8, 0.1, 1.5]} />
                </mesh>

                {/* Keyboard Area (Recessed) */}
                <mesh position={[0, 1.26, 1]} receiveShadow material={darkPlastic}>
                    <boxGeometry args={[7.5, 0.1, 2.5]} />
                </mesh>

                {/* Individual Keys */}
                {/* Function Keys Row */}
                {[-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5].map((x) => (
                    <RoundedBox key={`f-${x}`} args={[0.8, 0.2, 0.4]} radius={0.05} smoothness={2} position={[x, 1.35, -1.5]} castShadow material={redKeyMaterial} />
                ))}

                {/* Main Keys Rows */}
                {[0, 1, 2, 3].map((row) => (
                    <group key={`row-${row}`} position={[0, 0, row * 0.6]}>
                        {[-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5].map((x) => (
                            <RoundedBox key={`k-${row}-${x}`} args={[0.6, 0.3, 0.5]} radius={0.05} smoothness={2} position={[x, 1.4, 0]} castShadow material={keyMaterial} />
                        ))}
                    </group>
                ))}
            </group>

            {/* --- MONITOR --- */}
            <group position={[0, 2.5, -1]}>
                {/* Monitor Casing */}
                <RoundedBox args={[6, 5, 5]} radius={0.2} smoothness={4} position={[0, 0, 0]} castShadow receiveShadow material={beigePlastic} />

                {/* Screen Bezel/Frame */}
                <RoundedBox args={[5, 3.8, 0.2]} radius={0.1} smoothness={4} position={[0, 0.2, 2.51]} material={darkPlastic} />

                {/* The Screen Content (HTML Overlay) */}
                <group position={[0, 0.2, 2.63]}>
                    <Html
                        transform
                        occlude
                        position={[0, 0, 0]}
                        style={{
                            width: "480px",
                            height: "360px",
                            backgroundColor: "black",
                            borderRadius: "10px",
                            overflow: "hidden"
                        }}
                        scale={0.1}
                    >
                        <MonitorScreen />
                    </Html>
                </group>
            </group>
        </group>
    );
};

export default RetroComputer;
