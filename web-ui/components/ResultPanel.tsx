import React, { useState } from 'react'
import CosmicPortal from './CosmicPortal'
import LiquidButton from './LiquidButton'

interface ResultPanelProps {
  originalPreview?: string
  enhancedUrl?: string
  compressedUrl?: string
  compressedSizeKB?: number
  onCompress: () => void
  onReset: () => void
  onResetCompression: () => void
  isCompressing: boolean
}

export default function ResultPanel({
  originalPreview,
  enhancedUrl,
  compressedUrl,
  compressedSizeKB,
  onCompress,
  onReset,
  onResetCompression,
  isCompressing,
}: ResultPanelProps) {

  return (
    <div className="w-full h-full flex flex-col bg-black/50 overflow-hidden relative">

      {/* Enhancement Complete - NO FRAME, Own Space */}
      <div className="flex-none w-full pt-8 pb-4 flex justify-center z-20">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(74,222,128,1)]" />
          <span className="text-lg md:text-xl font-mono text-green-400 tracking-[0.3em] font-bold drop-shadow-[0_0_15px_rgba(74,222,128,0.8)]">
            ENHANCEMENT COMPLETE
          </span>
        </div>
      </div>

      {/* Main Display Area - Enhanced Image */}
      <div className="flex-1 relative min-h-0 w-full px-4 md:px-8 pb-4 flex items-center justify-center">
        <div className="w-full h-full max-w-6xl relative flex items-center justify-center">
          <CosmicPortal imageUrl={enhancedUrl} />
        </div>
      </div>

      {/* Action Buttons - Bottom */}
      <div className="flex-none w-full px-4 pb-6 md:pb-8 z-20">
        <div className="flex items-center justify-center gap-4 md:gap-6 max-w-2xl mx-auto flex-wrap">

          {/* Reset Button */}
          <LiquidButton variant="danger" onClick={onReset} className="!px-8 md:!px-12 !py-3 md:!py-4">
            RESET
          </LiquidButton>

          {/* Compress Button */}
          <LiquidButton
            variant="primary"
            onClick={onCompress}
            disabled={isCompressing}
            className="!px-8 md:!px-12 !py-3 md:!py-4"
          >
            {isCompressing ? 'COMPRESSING...' : 'COMPRESS'}
          </LiquidButton>

          {/* Save Button */}
          <a href={compressedUrl || enhancedUrl} download="enhanced_image.png" className="no-underline block">
            <LiquidButton variant="primary" className="!px-8 md:!px-12 !py-3 md:!py-4">
              SAVE IMAGE
            </LiquidButton>
          </a>

        </div>
      </div>

    </div>
  )
}
