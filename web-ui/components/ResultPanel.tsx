import React, { useState } from 'react'
import CosmicPortal from './CosmicPortal'
import LiquidButton from './LiquidButton'

interface ResultPanelProps {
  originalPreview?: string
  enhancedUrl?: string
  compressedUrl?: string
  compressedSizeKB?: number
  onCompress: (quality: number) => void
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
  const [quality, setQuality] = useState(80)

  const handleCompressClick = () => {
    onCompress(quality)
  }

  return (
    <div className="w-full h-full flex flex-col bg-black/50 overflow-hidden relative">

      {/* Enhancement Complete Badge - LARGE, Centered */}
      <div className="absolute top-6 md:top-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full max-w-[90%] md:max-w-[33%] px-4">
        <div className="glass-panel px-8 md:px-12 py-4 md:py-6 rounded-2xl flex items-center justify-center gap-4 bg-black/60 backdrop-blur-xl border-2 border-green-500/40 shadow-[0_0_40px_rgba(74,222,128,0.3)]">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-green-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(74,222,128,1)]" />
          <span className="text-sm md:text-lg font-mono text-green-400 tracking-[0.2em] font-bold drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]">
            ENHANCEMENT COMPLETE
          </span>
        </div>
      </div>

      {/* Main Display Area - Enhanced Image */}
      <div className="flex-1 relative min-h-0 w-full pt-24 md:pt-28 pb-4 px-4 md:px-8 flex items-center justify-center">
        <div className="w-full h-full max-w-6xl relative flex items-center justify-center">
          <CosmicPortal imageUrl={enhancedUrl} />
        </div>
      </div>

      {/* Compression Controls Section - Independent Card */}
      <div className="flex-none w-full px-4 pb-4 z-20">
        <div className="glass-panel rounded-2xl p-6 md:p-8 max-w-md mx-auto bg-black/60 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)]">

          {/* Slider */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs md:text-sm font-mono text-cyan-400 tracking-wider">COMPRESSION QUALITY</span>
              <span className="text-lg md:text-xl font-bold text-cyan-300 font-mono">{quality}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-cyan-900/50 to-cyan-700/50 rounded-full appearance-none cursor-pointer 
                [&::-webkit-slider-thumb]:appearance-none 
                [&::-webkit-slider-thumb]:w-6 
                [&::-webkit-slider-thumb]:h-6 
                [&::-webkit-slider-thumb]:rounded-full 
                [&::-webkit-slider-thumb]:bg-gradient-to-br 
                [&::-webkit-slider-thumb]:from-cyan-400 
                [&::-webkit-slider-thumb]:to-cyan-600 
                [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(6,182,212,1),0_0_30px_rgba(6,182,212,0.5)] 
                [&::-webkit-slider-thumb]:border-2 
                [&::-webkit-slider-thumb]:border-cyan-300
                hover:[&::-webkit-slider-thumb]:scale-110 
                hover:[&::-webkit-slider-thumb]:shadow-[0_0_20px_rgba(6,182,212,1),0_0_40px_rgba(6,182,212,0.7)]
                transition-all"
            />
          </div>

          {/* Compress Button */}
          <LiquidButton
            variant="primary"
            onClick={handleCompressClick}
            disabled={isCompressing}
            className="w-full !py-4"
          >
            {isCompressing ? 'PROCESSING...' : 'COMPRESS IMAGE'}
          </LiquidButton>

          {/* Size Indicator */}
          {compressedSizeKB && (
            <div className="mt-4 text-center">
              <span className="text-xs text-white/40 font-mono">COMPRESSED SIZE: </span>
              <span className="text-sm text-green-400 font-mono font-bold">{compressedSizeKB} KB</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Bottom Bar */}
      <div className="flex-none w-full px-4 pb-6 md:pb-8 z-20">
        <div className="flex items-center justify-center gap-4 md:gap-6 max-w-2xl mx-auto">

          {/* Reset Button Card */}
          <div className="glass-panel rounded-2xl p-2 bg-black/40 backdrop-blur-md border border-red-500/30 shadow-[0_0_20px_rgba(248,113,113,0.2)] hover:shadow-[0_0_30px_rgba(248,113,113,0.4)] transition-all">
            <LiquidButton variant="danger" onClick={onReset} className="!px-8 md:!px-12 !py-3 md:!py-4">
              RESET
            </LiquidButton>
          </div>

          {/* Save Button Card */}
          <div className="glass-panel rounded-2xl p-2 bg-black/40 backdrop-blur-md border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all">
            <a href={compressedUrl || enhancedUrl} download="enhanced_cosmic.png" className="no-underline block">
              <LiquidButton variant="primary" className="!px-8 md:!px-12 !py-3 md:!py-4">
                SAVE IMAGE
              </LiquidButton>
            </a>
          </div>

        </div>
      </div>

    </div>
  )
}
