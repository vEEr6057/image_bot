'use client'

import { useState } from 'react'

interface CompressionModalProps {
  isOpen: boolean
  onClose: () => void
  onCompress: (quality: number, targetSizeMB: number) => void
  isProcessing?: boolean
}

export default function CompressionModal({ 
  isOpen, 
  onClose, 
  onCompress,
  isProcessing 
}: CompressionModalProps) {
  const [quality, setQuality] = useState(80)
  const [targetSizeMB, setTargetSizeMB] = useState(5)

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-custom p-8 w-full max-w-[480px] shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Compression Options
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Quality Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quality: {quality}%
            </label>
            <input
              type="range"
              min={10}
              max={100}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Lower quality</span>
              <span>Higher quality</span>
            </div>
          </div>

          {/* Target Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Size (MB)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0.1}
                max={20}
                step={0.1}
                value={targetSizeMB}
                onChange={(e) => setTargetSizeMB(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <input
                type="number"
                step={0.1}
                min={0.1}
                max={100}
                value={targetSizeMB}
                onChange={(e) => setTargetSizeMB(Number(e.target.value))}
                className="w-20 px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick presets
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 5, 10, 20].map((size) => (
                <button
                  key={size}
                  onClick={() => setTargetSizeMB(size)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    targetSizeMB === size
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {size}MB
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => onCompress(quality, targetSizeMB)}
              disabled={isProcessing}
              className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Compressing...' : 'Start Compression'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
