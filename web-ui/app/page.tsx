'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import UploadArea from '@/components/UploadArea'
import ResultPanel from '@/components/ResultPanel'
import CompressionModal from '@/components/CompressionModal'
import { uploadImage, compressImage } from '@/lib/api'

const ThreeScene = dynamic(() => import('@/components/ThreeScene'), { ssr: false })

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [originalPreview, setOriginalPreview] = useState<string | null>(null)
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null)
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null)
  const [compressedSizeKB, setCompressedSizeKB] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [showCompressionModal, setShowCompressionModal] = useState(false)
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

  const handleCompress = async (quality: number, targetSizeMB: number) => {
    if (!enhancedUrl) return

    setShowCompressionModal(false)
    setIsCompressing(true)
    setError(null)

    try {
      const compressedBlob = await compressImage(enhancedUrl, { quality, format: 'jpeg' })
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

  return (
    <main className={isDarkMode ? "min-h-screen bg-gray-900" : "min-h-screen bg-gray-50"}>
      {/* Header with theme toggle */}
      <header className="py-8 px-4 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-content mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-title font-bold text-gray-900 dark:text-white">
              Image Enhancer
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
              Upload an image to upscale and compress it
            </p>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Main content - centered column */}
      <div className="max-w-content mx-auto px-4 py-section space-y-gap">
        {/* Upload Area */}
        <section>
          <UploadArea onFileSelect={handleFileSelect} isUploading={isUploading} />
        </section>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Three.js Scene - renders in background as soon as page loads */}
        {enhancedUrl && (
          <section>
            <ThreeScene afterUrl={enhancedUrl} />
          </section>
        )}

        {/* Results Panel */}
        {(enhancedUrl || isUploading) && (
          <section>
            <ResultPanel
              originalPreview={originalPreview || undefined}
              enhancedUrl={enhancedUrl || undefined}
              compressedUrl={compressedUrl || undefined}
              compressedSizeKB={compressedSizeKB || undefined}
              onCompressClick={() => setShowCompressionModal(true)}
              onReset={handleReset}
            />
          </section>
        )}
      </div>

      {/* Compression Modal */}
      <CompressionModal
        isOpen={showCompressionModal}
        onClose={() => setShowCompressionModal(false)}
        onCompress={handleCompress}
        isProcessing={isCompressing}
      />
    </main>
  )
}
