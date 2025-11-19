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
      {/* Void Background with blinking stars */}
      <VoidBackground />

      <main className="min-h-screen relative">
        {/* Main content - single column centered */}
        <div className="max-w-[800px] mx-auto px-4 py-8">
          
          {/* BEFORE UPLOADING STATE */}
          {!enhancedUrl && !isUploading && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-white text-center mb-8">
                BEFORE UPLOADING
              </h2>
              
              {/* Upload Area - Compact size like mockup */}
              <div className="w-full max-w-[350px] mx-auto">
                <UploadArea onFileSelect={handleFileSelect} isUploading={isUploading} />
              </div>

              {/* Tic-Tac-Toe Game - Same size as upload */}
              <div className="w-full max-w-[350px] mx-auto">
                <TicTacToe />
              </div>
            </div>
          )}

          {/* AFTER UPLOADING STATE */}
          {(enhancedUrl || isUploading) && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-white text-center mb-8">
                AFTER UPLOADING
              </h2>

              {/* Error message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Results Panel - Before/After comparison */}
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

              {/* Tic-Tac-Toe Game - Always visible at bottom */}
              <div className="w-full max-w-[350px] mx-auto mt-8">
                <TicTacToe />
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
