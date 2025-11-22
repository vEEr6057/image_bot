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

  const handleCompress = async (quality: number) => {
    if (!enhancedUrl) return

    setIsCompressing(true)
    setError(null)

    try {
      const compressedBlob = await compressImage(enhancedUrl, { quality, format: 'png' })
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
        className={`absolute inset-0 transition-all duration-1000 ease-in-out flex flex-col items-center justify-center py-12
          ${viewState === 'HOME' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}
        `}
      >
        {/* Title Section */}
        <div className="flex-none text-center z-20 mb-8">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-3">
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-400 drop-shadow-[0_0_40px_rgba(6,182,212,0.8)] animate-text-reveal-1" style={{ textShadow: '0 0 60px rgba(6,182,212,0.5), 0 0 30px rgba(255,255,255,0.3)' }}>
              PROJECT STARLIGHT
            </span>
          </h1>
          <p className="text-cyan-300 text-base md:text-lg tracking-[0.5em] uppercase animate-text-reveal-2 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
            Quantum Image Enhancement
          </p>
        </div>

        {/* Upload Section - Centered */}
        <div className="flex-1 w-full max-w-4xl px-8 flex items-center justify-center">
          <div className="w-full h-full max-h-[500px]">
            <UploadArea onFileSelect={handleFileSelect} />
          </div>
        </div>
      </div>

      {/* --- RESULT STATE --- */}
      <div
        className={`absolute inset-0 transition-all duration-1000 ease-in-out
          ${viewState === 'RESULT' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}
        `}
      >
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
