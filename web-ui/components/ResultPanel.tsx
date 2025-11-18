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
    <div className="space-y-gap">
      {/* Two-column grid on desktop, stack on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gap">
        {/* Non-compressed Result */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-custom shadow-card">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            Enhanced (Original Quality)
          </h3>
          {enhancedUrl ? (
            <>
              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-4">
                <img
                  src={enhancedUrl}
                  alt="Enhanced"
                  className="w-full h-auto max-h-[300px] object-contain bg-gray-50 dark:bg-gray-900"
                />
              </div>
              <a href={enhancedUrl} download="enhanced-original.png">
                <button className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-sm">
                  Download Original Quality
                </button>
              </a>
            </>
          ) : (
            <div className="flex items-center justify-center h-[300px] bg-gray-100 dark:bg-gray-900 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">Waiting for enhancement...</p>
            </div>
          )}
        </div>

        {/* Compressed Result */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-custom shadow-card">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            Compressed
          </h3>
          {compressedUrl ? (
            <>
              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-4">
                <img
                  src={compressedUrl}
                  alt="Compressed"
                  className="w-full h-auto max-h-[300px] object-contain bg-gray-50 dark:bg-gray-900"
                />
              </div>
              <a href={compressedUrl} download="enhanced-compressed.jpg">
                <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-sm">
                  Download Compressed
                  {compressedSizeKB && ` (${(compressedSizeKB / 1024).toFixed(2)} MB)`}
                </button>
              </a>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center h-[300px] bg-gray-100 dark:bg-gray-900 rounded-lg mb-4">
                <p className="text-gray-500 dark:text-gray-400">No compressed result yet</p>
              </div>
              <button
                onClick={onCompressClick}
                disabled={!enhancedUrl}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Choose Compression & Generate
              </button>
            </>
          )}
        </div>
      </div>

      {/* Reset button */}
      {enhancedUrl && (
        <button
          onClick={onReset}
          className="w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors shadow-sm"
        >
          <span className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Upscale Another Image
          </span>
        </button>
      )}
    </div>
  )
}
