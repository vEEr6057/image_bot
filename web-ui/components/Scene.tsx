"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from "@react-three/drei";
import RetroComputer from "./RetroComputer";

const Scene = () => {
    return (
        <div className="w-full h-screen bg-black">
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 2, 12]} fov={45} />

                <ambientLight intensity={0.5} />
                <spotLight
                    position={[10, 10, 10]}
                    angle={0.15}
                    penumbra={1}
                    shadow-mapSize={2048}
                    castShadow
                />

                <Suspense fallback={null}>
                    <RetroComputer />
                    <Environment preset="night" />
                    <ContactShadows position={[0, -0.8, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
                </Suspense>

                <OrbitControls
                    enablePan={false}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 2}
                    minDistance={5}
                    maxDistance={15}
                />
            </Canvas>

            {/* Overlay Instructions */}
            <div className="absolute bottom-4 left-4 text-green-500 font-mono text-xs opacity-50 pointer-events-none">
                DRAG TO ROTATE • TYPE 'LOAD' TO UPLOAD
            </div>
        </div>
    );
};

export default Scene;
