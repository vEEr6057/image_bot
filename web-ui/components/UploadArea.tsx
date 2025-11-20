'use client'

import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
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
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={mesh} scale={isHovering ? 1.2 : 1}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <MeshDistortMaterial
          color={isHovering ? "#a855f7" : "#4c1d95"} // Purple
          speed={isHovering ? 5 : 2}
          distort={0.4}
          radius={1}
        />
      </mesh>
    </Float>
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
          relative h-[300px] w-full rounded-2xl overflow-hidden 
          border-2 transition-all duration-500 cursor-pointer
          ${isDragging
            ? 'border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.5)]'
            : 'border-white/10 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]'
          }
        `}
      >
        {/* Background Scene */}
        <div className="absolute inset-0 -z-10 bg-black/40 backdrop-blur-sm">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <BlackHole isHovering={isDragging} />
          </Canvas>
        </div>

        {/* Foreground Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className={`
            transform transition-all duration-300
            ${isDragging ? 'scale-110' : 'scale-100'}
          `}>
            <svg className="w-12 h-12 mb-4 text-white/80 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-lg font-medium text-white/90 drop-shadow-md">
            {isUploading ? 'Initiating Warp...' : 'Drop Image to Horizon'}
          </p>
          <p className="text-sm text-white/50 mt-2">
            or click to browse
          </p>
        </div>
      </div>
    </div>
  )
}
