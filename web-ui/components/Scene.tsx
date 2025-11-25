"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import RetroComputer from "./RetroComputer";
import RetroEnvironment from "./RetroEnvironment";

const Scene = () => {
    return (
        <div className="w-full h-screen bg-black">
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 3, 10]} fov={50} />

                <ambientLight intensity={1.5} />
                {/* Key light for the computer */}
                <spotLight
                    position={[5, 10, 5]}
                    angle={0.5}
                    penumbra={1}
                    intensity={2}
                    castShadow
                    shadow-mapSize={1024}
                />
                {/* Fill light for the front/bottom */}
                <pointLight position={[0, 2, 5]} intensity={1} color="#ffffff" />
                {/* Rim light for that synthwave look */}
                <pointLight position={[-5, 2, -5]} color="#00ffff" intensity={2} />

                <Suspense fallback={null}>
                    <RetroEnvironment />
                    <RetroComputer />
                </Suspense>

                <EffectComposer>
                    <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={0.4} />
                    <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>

                <OrbitControls
                    enablePan={false}
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI} // Allow full vertical rotation
                    minDistance={4}
                    maxDistance={15}
                />
            </Canvas>

            {/* Overlay Instructions */}
            <div className="absolute bottom-4 left-4 text-green-500 font-mono text-sm opacity-70 pointer-events-none select-none">
                DRAG TO ROTATE • TYPE 'LOAD' TO UPLOAD
            </div>
        </div>
    );
};

export default Scene;
