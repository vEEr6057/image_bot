'use client'

import { useState } from 'react'

interface ResultDisplayProps {
  originalImage: string
  resultImage: string
  onReset: () => void
}

export default function ResultDisplay({ originalImage, resultImage, onReset }: ResultDisplayProps) {
  const [showComparison, setShowComparison] = useState(true)
  const [compressedImage, setCompressedImage] = useState<string | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [targetSizeMB, setTargetSizeMB] = useState<number>(5)
  const [compressedSizeKB, setCompressedSizeKB] = useState<number | null>(null)
  const [showCompressionDialog, setShowCompressionDialog] = useState(false)

  const handleDownloadOriginal = () => {
    const link = document.createElement('a')
    link.href = resultImage
    link.download = `upscaled-original-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadCompressed = () => {
    if (compressedImage) {
      const link = document.createElement('a')
      link.href = compressedImage
      link.download = `upscaled-compressed-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const compressImage = async () => {
    setIsCompressing(true)
    setShowCompressionDialog(false)

    try {
      // Fetch the image
      const response = await fetch(resultImage)
      const blob = await response.blob()
      
      // Create an image element
      const img = new Image()
      const imgUrl = URL.createObjectURL(blob)
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = imgUrl
      })

      // Create canvas
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0)

      // Compress with quality adjustment
      let compressedBlob: Blob | null = null
      const targetBytes = Math.max(100 * 1024, Math.round(targetSizeMB * 1024 * 1024)) // at least 100KB

      // Try different quality levels (start high, go lower)
      for (let q = 0.95; q >= 0.05; q -= 0.05) {
        compressedBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((blob) => resolve(blob), 'image/jpeg', q)
        })

        if (compressedBlob && compressedBlob.size <= targetBytes) {
          break
        }
      }

      // If we didn't reach target, use the last blob anyway
      if (!compressedBlob) {
        compressedBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.5)
        })
      }

      if (compressedBlob) {
        const compressedUrl = URL.createObjectURL(compressedBlob)
        setCompressedImage(compressedUrl)
        setCompressedSizeKB(Math.round(compressedBlob.size / 1024))
      }

      URL.revokeObjectURL(imgUrl)
    } catch (error) {
      console.error('Compression error:', error)
    } finally {
      setIsCompressing(false)
    }
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

      {/* Compression Dialog */}
      {showCompressionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Compress Image</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Choose target file size (MB) or type a value.</p>

                <div className="mb-4">
                  <input
                    type="range"
                    min={0.1}
                    max={20}
                    step={0.1}
                    value={targetSizeMB}
                    onChange={(e) => setTargetSizeMB(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex items-center gap-3 mt-2">
                    <input
                      type="number"
                      step={0.1}
                      min={0.1}
                      max={100}
                      value={targetSizeMB}
                      onChange={(e) => setTargetSizeMB(Number(e.target.value))}
                      className="w-24 px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300">MB</span>
                    <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">Current target: {targetSizeMB.toFixed(1)} MB</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[1, 2, 5, 10, 20].map((size) => (
                    <button
                      key={size}
                      onClick={() => setTargetSizeMB(size)}
                      className={`py-2 px-3 rounded-lg transition-colors ${
                        targetSizeMB === size ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {size} MB
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCompressionDialog(false)}
                    className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={compressImage}
                    className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Compress
                  </button>
                </div>
              </div>
        </div>
      )}

      <div className="space-y-3">
        {/* Download Original */}
        <button
          onClick={handleDownloadOriginal}
          className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <span className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Original Quality
          </span>
        </button>

        {/* Compress or Download Compressed */}
        {!compressedImage ? (
          <button
            onClick={() => setShowCompressionDialog(true)}
            disabled={isCompressing}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center">
              {isCompressing ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Compressing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Compress & Download
                </>
              )}
            </span>
          </button>
        ) : (
          <button
            onClick={handleDownloadCompressed}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {compressedSizeKB ? `Download Compressed (${(compressedSizeKB / 1024).toFixed(2)} MB)` : `Download Compressed (${targetSizeMB} MB)`}
            </span>
          </button>
        )}

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
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
    </div>
  )
}
