'use client'

import { useRef, useState } from 'react'
import ConstellationCanvas from './ConstellationCanvas'

interface UploadAreaProps {
  onFileSelect: (file: File, previewUrl: string) => void
  isUploading?: boolean
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
    <div className="w-full h-full relative group p-4">
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
          relative w-full h-full cursor-pointer rounded-2xl overflow-hidden
          border-2 border-cyan-500/50 hover:border-cyan-400 transition-all duration-300
          bg-black/40 backdrop-blur-md
          shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:shadow-[0_0_50px_rgba(6,182,212,0.3)]
          group
        `}
      >
        {/* Background Constellation */}
        <div className="absolute inset-0 z-0">
          <ConstellationCanvas onHover={setIsDragging} />
        </div>

        {/* Foreground Content - Centered in the constellation */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <div className={`
            transform transition-all duration-500
            ${isDragging ? 'scale-110 opacity-100' : 'scale-100 opacity-80'}
          `}>
            <p className="text-cyan-300 font-display text-lg tracking-[0.3em] uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
              {isUploading ? 'INITIALIZING...' : 'INITIATE UPLOAD'}
            </p>
            <p className="text-center text-xs text-cyan-500/60 mt-2 font-mono tracking-widest">
              [DROP IMAGE TO ENGAGE]
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
