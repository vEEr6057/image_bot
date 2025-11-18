'use client'

import { useState } from 'react'

interface ResultPanelProps {
  originalPreview?: string
  enhancedUrl?: string
  compressedUrl?: string
  compressedSizeKB?: number
  onCompress: (targetSizeMB: number) => void
  onReset: () => void
  onShowGame: () => void
}

export default function ResultPanel({
  originalPreview,
  enhancedUrl,
  compressedUrl,
  compressedSizeKB,
  onCompress,
  onReset,
  onShowGame,
}: ResultPanelProps) {
  const [targetSizeMB, setTargetSizeMB] = useState(5)

  const handleSliderChange = (value: number) => {
    setTargetSizeMB(value)
    if (enhancedUrl) {
      onCompress(value)
    }
  }

  return (
    <div className="space-y-4">
      {/* Mobile-responsive grid - stacks on small screens, side-by-side on medium+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Enhanced (Original Quality) - Left */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
          <h3 className="text-base font-semibold mb-2 text-gray-800 dark:text-white text-center">
            Enhanced (Original Quality)
          </h3>
          {enhancedUrl ? (
            <>
              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-3">
                <img
                  src={enhancedUrl}
                  alt="Enhanced"
                  className="w-full h-auto max-h-[200px] object-contain bg-gray-50 dark:bg-gray-900"
                />
              </div>
              <a href={enhancedUrl} download="enhanced-original.png" className="block">
                <button className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors text-sm shadow-md">
                  Download Original
                </button>
              </a>
            </>
          ) : (
            <div className="flex items-center justify-center h-[200px] bg-gray-100 dark:bg-gray-900 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Processing...</p>
            </div>
          )}
        </div>

        {/* Compressed - Right with inline slider */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
          <h3 className="text-base font-semibold mb-2 text-gray-800 dark:text-white text-center">
            Compressed
          </h3>
          {enhancedUrl ? (
            <>
              {compressedUrl ? (
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-3">
                  <img
                    src={compressedUrl}
                    alt="Compressed"
                    className="w-full h-auto max-h-[200px] object-contain bg-gray-50 dark:bg-gray-900"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] bg-gray-100 dark:bg-gray-900 rounded-lg mb-3">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Adjust slider to compress</p>
                </div>
              )}
              
              {/* Inline Slider */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Size: {targetSizeMB} MB
                  {compressedSizeKB && ` (Current: ${(compressedSizeKB / 1024).toFixed(2)} MB)`}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="20"
                  step="0.5"
                  value={targetSizeMB}
                  onChange={(e) => handleSliderChange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>0.5 MB</span>
                  <span>20 MB</span>
                </div>
              </div>

              {compressedUrl && (
                <a href={compressedUrl} download="enhanced-compressed.jpg" className="block">
                  <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors text-sm shadow-md">
                    Download Compressed
                  </button>
                </a>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-[200px] bg-gray-100 dark:bg-gray-900 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Upload image first</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row - two square buttons side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={onReset}
          className="py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors text-sm shadow-md"
        >
          Upscale Another Image
        </button>
        <button
          onClick={onShowGame}
          className="py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition-colors text-sm shadow-md"
        >
          Play Tic-Tac-Toe
        </button>
      </div>
    </div>
  )
}
