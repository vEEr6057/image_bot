'use client'

import { useState, useEffect } from 'react'
import UploadArea from '@/components/UploadArea'
import ResultPanel from '@/components/ResultPanel'
import VoidBackground from '@/components/VoidBackground'
import { uploadImage, compressImage } from '@/lib/api'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [originalPreview, setOriginalPreview] = useState<string | null>(null)
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null)
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null)
  const [compressedSizeKB, setCompressedSizeKB] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (file: File, previewUrl: string) => {
    setSelectedFile(file)
    setOriginalPreview(previewUrl)
    setEnhancedUrl(null)
    setCompressedUrl(null)
    setError(null)

    // Auto-upload
    setIsUploading(true)
    try {
      const result = await uploadImage(file)
      setEnhancedUrl(result.enhanced_url)
    } catch (err) {
      setError('Upload failed: ' + (err as Error).message)
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleCompress = async (targetSizeMB: number) => {
    if (!enhancedUrl) return

    setIsCompressing(true)
    setError(null)

    try {
      // Calculate quality based on target size (iterative approach)
      // Using PNG format for best quality
      let quality = 90
      let compressedBlob = await compressImage(enhancedUrl, { quality, format: 'png' })
      let currentSizeMB = compressedBlob.size / (1024 * 1024)

      // Binary search for optimal quality
      let minQuality = 10
      let maxQuality = 100
      const maxIterations = 10
      let iterations = 0

      while (Math.abs(currentSizeMB - targetSizeMB) > 0.1 && iterations < maxIterations) {
        if (currentSizeMB > targetSizeMB) {
          maxQuality = quality
          quality = Math.floor((minQuality + quality) / 2)
        } else {
          minQuality = quality
          quality = Math.floor((quality + maxQuality) / 2)
        }

        compressedBlob = await compressImage(enhancedUrl, { quality, format: 'png' })
        currentSizeMB = compressedBlob.size / (1024 * 1024)
        iterations++
      }

      const url = URL.createObjectURL(compressedBlob)
      setCompressedUrl(url)
      setCompressedSizeKB(Math.round(compressedBlob.size / 1024))
    } catch (err) {
      setError('Compression failed: ' + (err as Error).message)
      console.error(err)
    } finally {
      setIsCompressing(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setOriginalPreview(null)
    setEnhancedUrl(null)
    setCompressedUrl(null)
    setCompressedSizeKB(null)
    setError(null)
  }

  const handleResetCompression = () => {
    setCompressedUrl(null)
    setCompressedSizeKB(null)
  }

  return (
    <>
      {/* Void Background with warp effect */}
      <VoidBackground warp={isUploading} />

      <main className="min-h-screen relative z-10 text-white pointer-events-none">

        {/* Main content - single column centered */}
        <div className="w-full h-screen flex flex-col items-center justify-center relative z-10 pointer-events-auto">

          {/* BEFORE UPLOADING STATE */}
          {!enhancedUrl && !isUploading && (
            <div className="space-y-12 text-center animate-in fade-in duration-1000">
              <h2 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-400 drop-shadow-[0_0_25px_rgba(168,85,247,0.5)] tracking-widest font-mono">
                PROJECT STARLIGHT
              </h2>
              <p className="text-cyan-300 text-sm tracking-[0.5em] uppercase opacity-80 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                Quantum Image Enhancement Protocol
              </p>

              {/* Upload Area - Centered */}
              <div className="w-full max-w-[500px] mx-auto transform hover:scale-105 transition-transform duration-500">
                <UploadArea onFileSelect={handleFileSelect} isUploading={isUploading} />
              </div>
            </div>
          )}

          {/* AFTER UPLOADING STATE */}
          {(enhancedUrl || isUploading) && (
            <div className="w-full h-full flex flex-col items-center justify-center">

              {/* Status Header - Floating Top */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center z-20">
                <h2 className="text-2xl font-bold text-cyan-300 tracking-[0.3em] drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-pulse">
                  {isUploading ? 'INITIALIZING RIFT...' : 'DIMENSIONAL GATE OPEN'}
                </h2>
              </div>

              {/* Error message */}
              {error && (
                <div className="absolute top-24 bg-red-500/20 border border-red-500/50 rounded-lg p-3 backdrop-blur-sm z-50">
                  <p className="text-red-200 text-sm font-mono">{error}</p>
                </div>
              )}

              {/* Results Panel - Cosmic Portal & Control Deck */}
              <div className="w-full h-full">
                <ResultPanel
                  originalPreview={originalPreview || undefined}
                  enhancedUrl={enhancedUrl || undefined}
                  compressedUrl={compressedUrl || undefined}
                  compressedSizeKB={compressedSizeKB || undefined}
                  onCompress={handleCompress}
                  onReset={handleReset}
                  onResetCompression={handleResetCompression}
                  isCompressing={isCompressing}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
