'use client'

interface ResultPanelProps {
  originalPreview?: string
  enhancedUrl?: string
  compressedUrl?: string
  compressedSizeKB?: number
  onCompressClick: () => void
  onReset: () => void
}

export default function ResultPanel({
  originalPreview,
  enhancedUrl,
  compressedUrl,
  compressedSizeKB,
  onCompressClick,
  onReset,
}: ResultPanelProps) {
  return (
    <div className="space-y-4">
      {/* Compact two-column grid - always side by side */}
      <div className="grid grid-cols-2 gap-4">
        {/* Enhanced (Original Quality) - Left */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-card">
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
              <a href={enhancedUrl} download="enhanced-original.png">
                <button className="w-full py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm">
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
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-card">
          <h3 className="text-base font-semibold mb-2 text-gray-800 dark:text-white text-center">
            Compressed
          </h3>
          {compressedUrl ? (
            <>
              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-3">
                <img
                  src={compressedUrl}
                  alt="Compressed"
                  className="w-full h-auto max-h-[200px] object-contain bg-gray-50 dark:bg-gray-900"
                />
              </div>
              <a href={compressedUrl} download="enhanced-compressed.jpg">
                <button className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm">
                  Download Compressed
                  {compressedSizeKB && ` (${(compressedSizeKB / 1024).toFixed(2)} MB)`}
                </button>
              </a>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center h-[200px] bg-gray-100 dark:bg-gray-900 rounded-lg mb-3">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Select size to compress</p>
              </div>
              <button
                onClick={onCompressClick}
                disabled={!enhancedUrl}
                className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Choose Compression
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom row - two buttons side by side */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onReset}
          className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors text-sm"
        >
          Upscale Another Image
        </button>
        <button
          className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm"
        >
          Tic-Tac-Toe Game
        </button>
      </div>
    </div>
  )
}
