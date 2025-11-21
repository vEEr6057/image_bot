'use client'

import { useState, useRef, useEffect } from 'react'
import HolographicDisplay from './HolographicDisplay'

interface ResultPanelProps {
  originalPreview?: string
  enhancedUrl?: string
  compressedUrl?: string
  compressedSizeKB?: number
  onCompress: (targetSizeMB: number) => void
  onReset: () => void
  onResetCompression: () => void
  isCompressing?: boolean
}

export default function ResultPanel({
  originalPreview,
  enhancedUrl,
  compressedUrl,
  compressedSizeKB,
  onCompress,
  onReset,
  onResetCompression,
  isCompressing = false,
}: ResultPanelProps) {
  const [targetSizeMB, setTargetSizeMB] = useState(5)
  const [isDragging, setIsDragging] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const handleSliderStart = () => {
    setIsDragging(true)
  }

  const handleSliderChange = (value: number) => {
    setTargetSizeMB(value)

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleSliderEnd = (value: number) => {
    setIsDragging(false)

    // Trigger compression after user releases slider
    if (enhancedUrl && !compressedUrl) {
      // Small delay to ensure smooth UI
      timeoutRef.current = setTimeout(() => {
        onCompress(value)
      }, 300)
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* Mobile-responsive grid - stacks on small screens, side-by-side on medium+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Enhanced (Original Quality) - Left */}
        <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
          <h3 className="text-base font-semibold mb-2 text-purple-200 text-center tracking-wider">
            ENHANCED HOLOGRAM
          </h3>
          {enhancedUrl ? (
            <>
              <div className="rounded-lg overflow-hidden border border-white/10 mb-3 relative group">
                <HolographicDisplay imageUrl={enhancedUrl} />
              </div>
              <a href={enhancedUrl} download="enhanced-original.png" className="block">
                <button className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] tracking-wide">
                  DOWNLOAD ENHANCED
                </button>
              </a>
            </>
          ) : (
            <div className="flex items-center justify-center h-[200px] bg-black/20 rounded-lg border border-white/5">
              <p className="text-purple-400/50 text-sm font-mono animate-pulse">AWAITING DATA...</p>
            </div>
          )}
        </div>

        {/* Compressed - Right with inline slider */}
        <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
          <h3 className="text-base font-semibold mb-2 text-blue-200 text-center tracking-wider">
            COMPRESSED DATA
          </h3>
          {enhancedUrl ? (
            <>
              {compressedUrl ? (
                <>
                  {/* Show compressed image preview */}
                  <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-3 cursor-pointer group relative">
                    <img
                      src={compressedUrl}
                      alt="Compressed"
                      className="w-full h-auto max-h-[200px] object-contain bg-gray-50 dark:bg-gray-900"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-sm font-medium">Click to download</p>
                    </div>
                  </div>
                  <a href={compressedUrl} download="enhanced-compressed.png" className="block mb-2">
                    <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors text-sm shadow-md">
                      Download Compressed PNG
                      {compressedSizeKB && ` (${(compressedSizeKB / 1024).toFixed(2)} MB)`}
                    </button>
                  </a>
                  <button
                    onClick={onResetCompression}
                    className="w-full py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium transition-colors text-xs shadow-md"
                  >
                    Adjust Compression
                  </button>
                </>
              ) : (
                <>
                  {/* Show slider before compression */}
                  <div className="flex items-center justify-center h-[200px] bg-gray-100 dark:bg-gray-900 rounded-lg mb-3">
                    {isCompressing ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Compressing...</p>
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {isDragging ? 'Release to compress' : 'Drag slider to set size'}
                      </p>
                    )}
                  </div>

                  {/* Inline Slider */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Size: {targetSizeMB} MB
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="20"
                      step="0.5"
                      value={targetSizeMB}
                      onMouseDown={handleSliderStart}
                      onTouchStart={handleSliderStart}
                      onChange={(e) => handleSliderChange(Number(e.target.value))}
                      onMouseUp={(e) => handleSliderEnd(Number(e.currentTarget.value))}
                      onTouchEnd={(e) => handleSliderEnd(Number(e.currentTarget.value))}
                      disabled={isCompressing}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>0.5 MB</span>
                      <span>20 MB</span>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-[200px] bg-gray-100 dark:bg-gray-900 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Upload image first</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom button - reset */}
      <div className="flex justify-center">
        <button
          onClick={onReset}
          className="py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors text-sm shadow-md"
        >
          Upscale Another Image
        </button>
      </div>
    </div>
  )
}
