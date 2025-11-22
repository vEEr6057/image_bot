'use client'

import { useState, useEffect } from 'react'
import UploadArea from '@/components/UploadArea'
import ResultPanel from '@/components/ResultPanel'
import ParticleTransition from '@/components/ParticleTransition'
import { uploadImage, compressImage } from '@/lib/api'

type ViewState = 'HOME' | 'UPLOADING' | 'RESULT'

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>('HOME')

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [originalPreview, setOriginalPreview] = useState<string | null>(null)
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null)
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null)
  const [compressedSizeKB, setCompressedSizeKB] = useState<number | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (file: File, previewUrl: string) => {
    setSelectedFile(file)
    setOriginalPreview(previewUrl)
    setEnhancedUrl(null)
    setCompressedUrl(null)
    setError(null)

    // Transition to Uploading
    setViewState('UPLOADING')

    try {
      const result = await uploadImage(file)
      setEnhancedUrl(result.enhanced_url)

      // Fake delay for effect if needed, then transition to Result
      setTimeout(() => {
        setViewState('RESULT')
      }, 2000)

    } catch (err) {
      setError('Upload failed: ' + (err as Error).message)
      console.error(err)
      setViewState('HOME') // Go back on error
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
    setViewState('HOME')
  }

  const handleResetCompression = () => {
    setCompressedUrl(null)
    setCompressedSizeKB(null)
  }

  return (
    <main className="w-full h-screen overflow-hidden relative bg-black text-white">

      {/* --- UPLOADING STATE (Overlay) --- */}
      {viewState === 'UPLOADING' && (
        <div className="absolute inset-0 z-50">
          <ParticleTransition />
        </div>
      )}

      {/* --- HOME STATE --- */}
      <div
        className={`absolute inset-0 transition-all duration-1000 ease-in-out flex flex-col items-center justify-between py-12
          ${viewState === 'HOME' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}
        `}
      >
        {/* Title Section */}
        <div className="flex-none text-center z-20">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-400 drop-shadow-[0_0_25px_rgba(6,182,212,0.5)]">
            PROJECT STARLIGHT
          </h1>
          <p className="text-cyan-300/60 text-sm tracking-[0.5em] uppercase mt-2">
            Quantum Image Enhancement
          </p>
        </div>

        {/* Upload Section - Takes remaining space */}
        <div className="flex-1 w-full max-w-4xl p-8 relative min-h-[300px] flex items-center justify-center">
          <UploadArea onFileSelect={handleFileSelect} />
        </div>

        {/* Footer */}
        <div className="flex-none z-20">
          <p className="text-white/20 text-xs font-mono">SYSTEM READY // WAITING FOR INPUT</p>
        </div>
      </div>

      {/* --- RESULT STATE --- */}
      <div
        className={`absolute inset-0 transition-all duration-1000 ease-in-out
          ${viewState === 'RESULT' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}
        `}
      >
        {/* Status Header */}
        <div className="absolute top-6 left-8 z-20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs font-mono text-green-400 tracking-widest">ENHANCEMENT COMPLETE</span>
          </div>
        </div>

        {/* Result Panel */}
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

      {/* Error Toast */}
      {error && (
        <div className="fixed top-8 right-8 bg-red-500/20 border border-red-500/50 rounded-lg p-4 backdrop-blur-md z-[100] animate-in slide-in-from-right">
          <p className="text-red-200 text-sm font-mono">{error}</p>
          <button onClick={() => setError(null)} className="text-xs text-red-400 mt-2 hover:text-white">DISMISS</button>
        </div>
      )}

    </main>
  )
}
