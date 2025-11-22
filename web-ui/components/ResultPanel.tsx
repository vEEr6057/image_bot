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
    <div className="w-full h-full flex flex-col bg-black/50 overflow-hidden">

      {/* Main Display Area - Flex Grow to take available space */}
      <div className="flex-1 relative min-h-0 w-full p-4 md:p-8 flex items-center justify-center">
        <div className="w-full h-full max-w-6xl relative flex items-center justify-center">
          <CosmicPortal imageUrl={enhancedUrl} />
        </div>
      </div>

      {/* Control Deck - Fixed Height at Bottom */}
      <div className="flex-none w-full p-4 md:pb-8 z-30">
        <div className="glass-panel rounded-full p-4 flex items-center justify-between gap-4 backdrop-blur-xl bg-black/40 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-4xl mx-auto">

          {/* Reset Action */}
          <div className="flex-none">
            <LiquidButton variant="danger" onClick={onReset} className="!px-6 !py-3 text-xs">
              RESET
            </LiquidButton>
          </div>

          {/* Compression Controls - Centered Group */}
          <div className="flex-1 flex items-center justify-center gap-6 border-x border-white/10 px-6 mx-2">

            {/* Slider Group */}
            <div className="flex flex-col gap-1 w-full max-w-[200px]">
              <div className="flex justify-between text-[10px] font-mono text-cyan-400 tracking-widest">
                <span>QUALITY</span>
                <span>{quality}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full h-1 bg-cyan-900/50 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(6,182,212,0.8)]"
              />
            </div>

            {/* Action Button */}
            <button
              onClick={handleCompressClick}
              disabled={isCompressing}
              className="hidden md:block text-xs font-bold text-cyan-300 hover:text-white transition-colors tracking-wider uppercase drop-shadow-[0_0_5px_rgba(6,182,212,0.8)] whitespace-nowrap"
            >
              {isCompressing ? 'PROCESSING...' : 'COMPRESS'}
            </button>

            {/* Size Indicator */}
            {compressedSizeKB && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-white/40 font-mono">SIZE</span>
                <span className="text-xs text-green-400 font-mono font-bold">{compressedSizeKB} KB</span>
              </div>
            )}
          </div>

          {/* Download Action */}
          <div className="flex-none">
            <a href={compressedUrl || enhancedUrl} download="enhanced_cosmic.png">
              <LiquidButton variant="primary" className="!px-8 !py-3">
                SAVE
              </LiquidButton>
            </a>
          </div>

        </div>
      </div>

    </div>
  )
}
