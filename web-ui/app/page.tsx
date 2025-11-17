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
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold text-center gradient-text mb-4">
            AI Image Upscaler
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 text-lg">
            Enhance your images 4× with Real-ESRGAN AI technology
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!resultImage ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 card-hover">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
                  Upload Image
                </h2>
                <ImageUploader
                  onImageSelect={setUploadedImage}
                  currentImage={uploadedImage}
                />
              </div>

              {/* Color Grading Section */}
              {uploadedImage && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 card-hover">
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
                    Color Grading (Optional)
                  </h2>
                  <ColorGradingSelector
                    selected={selectedGrading}
                    onSelect={setSelectedGrading}
                  />
                </div>
              )}
            </div>

            {/* Info & Action Section */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 card-hover">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
                  Features
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-green-500 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">4× Resolution</h3>
                      <p className="text-gray-600 dark:text-gray-400">Quadruple your image dimensions</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-green-500 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">AI Powered</h3>
                      <p className="text-gray-600 dark:text-gray-400">Real-ESRGAN neural network</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-green-500 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">Color Grading</h3>
                      <p className="text-gray-600 dark:text-gray-400">9 professional presets</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-green-500 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">GPU Accelerated</h3>
                      <p className="text-gray-600 dark:text-gray-400">Fast processing on T4 GPU</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Action Button */}
              {uploadedImage && (
                <button
                  onClick={handleUpscale}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
            </div>
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
      <footer className="py-8 text-center text-gray-600 dark:text-gray-400">
        <p>Powered by Real-ESRGAN AI • Built with Next.js</p>
      </footer>
    </main>
  )
}
