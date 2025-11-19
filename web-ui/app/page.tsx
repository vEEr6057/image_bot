'use client'

import { useState, useEffect } from 'react'
import UploadArea from '@/components/UploadArea'
import ResultPanel from '@/components/ResultPanel'
import VoidBackground from '@/components/VoidBackground'
import TicTacToe from '@/components/TicTacToe'
import { uploadImage, compressImage } from '@/lib/api'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [originalPreview, setOriginalPreview] = useState<string | null>(null)
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null)
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null)
  const [compressedSizeKB, setCompressedSizeKB] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [showGame, setShowGame] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true)
    }
  }, [])

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
      {/* Void Background - Fixed behind everything */}
      <VoidBackground />

      <main className={isDarkMode ? "dark" : ""}>
        {/* Header with theme toggle */}
        <header className="py-6 px-4 border-b border-gray-200/20 dark:border-gray-800/20 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Image Enhancer
              </h1>
              <p className="text-sm md:text-base text-gray-300 mt-1">
                Upload an image to upscale and compress it
              </p>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg transition-colors bg-white/10 hover:bg-white/20 backdrop-blur-sm"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Main content - centered column */}
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Upload Area */}
          <section>
            <UploadArea onFileSelect={handleFileSelect} isUploading={isUploading} />
          </section>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Results Panel */}
          {(enhancedUrl || isUploading) && (
            <section>
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
            </section>
          )}

          {/* Tic-Tac-Toe Game - Always visible below results */}
          {(enhancedUrl || isUploading) && (
            <section className="flex justify-center mt-8">
              <TicTacToe />
            </section>
          )}
        </div>
      </main>
    </>
  )
}
