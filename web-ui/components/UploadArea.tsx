'use client'

import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

interface UploadAreaProps {
  onFileSelect: (file: File, previewUrl: string) => void
  isUploading?: boolean
}

function BlackHole({ isHovering }: { isHovering: boolean }) {
  const mesh = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * (isHovering ? 2 : 0.5)
      mesh.current.rotation.y += delta * (isHovering ? 2 : 0.5)
    }
  })

  return (
    <group>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <mesh ref={mesh} scale={isHovering ? 1.2 : 1}>
          <sphereGeometry args={[1.5, 64, 64]} />
          <MeshDistortMaterial
            color={isHovering ? "#d946ef" : "#581c87"} // Pink/Purple
            emissive={isHovering ? "#d946ef" : "#581c87"}
            emissiveIntensity={isHovering ? 2 : 0.5}
            speed={isHovering ? 5 : 2}
            distort={0.4}
            radius={1}
            toneMapped={false}
          />
        </mesh>
      </Float>
      {/* Accretion Disk Particles */}
      <Sparkles
        count={isHovering ? 200 : 100}
        scale={isHovering ? 5 : 4}
        size={isHovering ? 4 : 2}
        speed={isHovering ? 2 : 0.5}
        opacity={0.8}
        color={isHovering ? "#f0abfc" : "#a855f7"}
      />
    </group>
  )
}

export default function UploadArea({ onFileSelect, isUploading }: UploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    const url = URL.createObjectURL(file)
    onFileSelect(file, url)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  return (
    <div className="w-full relative group">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative h-[350px] w-full rounded-3xl overflow-hidden 
          transition-all duration-500 cursor-pointer
          ${isDragging
            ? 'shadow-[0_0_50px_rgba(217,70,239,0.4)] scale-[1.02]'
            : 'hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]'
          }
        `}
      >
        {/* Background Scene */}
        <div className="absolute inset-0 -z-10 bg-black/20 backdrop-blur-sm">
          <Canvas camera={{ position: [0, 0, 5] }} dpr={[1, 2]}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <BlackHole isHovering={isDragging} />
            <EffectComposer>
              <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} radius={0.6} />
            </EffectComposer>
          </Canvas>
        </div>

        {/* Foreground Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className={`
            transform transition-all duration-300
            ${isDragging ? 'scale-125 opacity-0' : 'scale-100 opacity-100'}
          `}>
            <svg className="w-16 h-16 mb-4 text-white/80 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className={`text-xl font-light tracking-widest text-white/90 drop-shadow-md transition-opacity duration-300 ${isDragging ? 'opacity-0' : 'opacity-100'}`}>
            {isUploading ? 'INITIATING WARP...' : 'DROP IMAGE'}
          </p>
        </div>
      </div>
    </div>
  )
}
