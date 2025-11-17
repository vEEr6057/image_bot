'use client'

import { useState } from 'react'
import ImageUploader from '@/components/ImageUploader'
import ColorGradingSelector from '@/components/ColorGradingSelector'
import ResultDisplay from '@/components/ResultDisplay'

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [selectedGrading, setSelectedGrading] = useState<string>('none')
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold text-center mb-4" style={{ color: 'black' }}>
            Quality improver
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {!resultImage ? (
          <div className="space-y-4">
            {/* Upload Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Upload Image
              </h2>
              <ImageUploader
                onImageSelect={setUploadedImage}
                currentImage={uploadedImage}
              />
            </div>

            {/* Color Grading Section */}
            {uploadedImage && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
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
            resultImage={resultImage}
            onReset={handleReset}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-600">
        <p>Built with Next.js</p>
      </footer>
    </main>
  )
}
