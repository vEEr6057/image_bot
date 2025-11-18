'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import ImageUploader from '@/components/ImageUploader'
import ColorGradingSelector from '@/components/ColorGradingSelector'
import ResultDisplay from '@/components/ResultDisplay'

const ProcessingAnimation = dynamic(() => import('@/components/ProcessingAnimation'), { ssr: false })

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [selectedGrading, setSelectedGrading] = useState<string>('none')
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Check system preference on mount
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true)
    }
  }, [])

  const handleUpscale = async () => {
    if (!uploadedImage) return

    setIsProcessing(true)
    setError(null)

    const formData = new FormData()
    formData.append('image', uploadedImage)
    formData.append('grading', selectedGrading)

    try {
      const response = await fetch('/api/upscale', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upscaling failed')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setResultImage(url)
    } catch (err) {
      setError('Failed to process image. Please try again.')
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setUploadedImage(null)
    setSelectedGrading('none')
    setResultImage(null)
    setError(null)
  }

  return (
    <main className={isDarkMode ? "min-h-screen bg-gray-900" : "min-h-screen bg-white"}>
      {/* Header */}
      <header className="py-8 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-5xl font-bold" style={{ color: isDarkMode ? 'white' : 'black' }}>
            Quality improver
          </h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}
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

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {!resultImage ? (
          <div className="space-y-4">
            {/* Upload Section */}
            <div className={`rounded-xl shadow-md p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Upload Image
              </h2>
              <ImageUploader
                onImageSelect={setUploadedImage}
                currentImage={uploadedImage}
              />
            </div>

            {/* Color Grading Section */}
            {uploadedImage && (
              <div className={`rounded-xl shadow-md p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Color Grading (Optional)
                </h2>
                <ColorGradingSelector
                  selected={selectedGrading}
                  onSelect={setSelectedGrading}
                />
              </div>
            )}

            {/* Action Button */}
            {uploadedImage && (
              <>
                <button
                  onClick={handleUpscale}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    '🚀 Upscale Image'
                  )}
                </button>

                {isProcessing && (
                  <div className="mt-6">
                    <ProcessingAnimation />
                    <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-300">Upscaling in progress — this may take a moment on large images.</p>
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>
        ) : (
          <ResultDisplay
            originalImage={URL.createObjectURL(uploadedImage!)}
            resultImage={resultImage!}
            onReset={handleReset}
          />
        )}
      </div>
    </main>
  )
}
