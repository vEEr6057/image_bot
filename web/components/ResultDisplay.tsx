'use client'

import { useState } from 'react'

interface ResultDisplayProps {
  originalImage: string
  resultImage: string
  onReset: () => void
}

export default function ResultDisplay({ originalImage, resultImage, onReset }: ResultDisplayProps) {
  const [showComparison, setShowComparison] = useState(true)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = resultImage
    link.download = `upscaled-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold gradient-text">Results</h2>
        <button
          onClick={onReset}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mb-6 flex justify-center">
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1">
          <button
            onClick={() => setShowComparison(true)}
            className={`px-4 py-2 rounded-md transition-all ${
              showComparison
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Comparison
          </button>
          <button
            onClick={() => setShowComparison(false)}
            className={`px-4 py-2 rounded-md transition-all ${
              !showComparison
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Result Only
          </button>
        </div>
      </div>

      {showComparison ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
              Original
            </h3>
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <img
                src={originalImage}
                alt="Original"
                className="w-full h-auto bg-gray-100 dark:bg-gray-700"
              />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
              Upscaled 4×
            </h3>
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <img
                src={resultImage}
                alt="Upscaled"
                className="w-full h-auto bg-gray-100 dark:bg-gray-700"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            Upscaled Result (4× Resolution)
          </h3>
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <img
              src={resultImage}
              alt="Upscaled"
              className="w-full h-auto bg-gray-100 dark:bg-gray-700"
            />
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={handleDownload}
          className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <span className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </span>
        </button>
        <button
          onClick={onReset}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <span className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Upscale Another
          </span>
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <span className="font-semibold">💡 Tip:</span> The upscaled image has been compressed to optimize file size while maintaining quality.
        </p>
      </div>
    </div>
  )
}
