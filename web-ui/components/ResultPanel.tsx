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

      {/* Status Header - Centered */}
      <div className="absolute top-8 left-0 w-full flex justify-center z-20 pointer-events-none">
        <div className="glass-panel px-6 py-2 rounded-full flex items-center gap-3 bg-black/40 backdrop-blur-md border border-green-500/30 shadow-[0_0_20px_rgba(74,222,128,0.2)]">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
          <span className="text-xs font-mono text-green-400 tracking-[0.2em] font-bold">ENHANCEMENT COMPLETE</span>
        </div>
      </div>

      {/* Main Display Area - Flex Grow to take available space */}
      <div className="flex-1 relative min-h-0 w-full p-4 md:p-8 flex items-center justify-center">
        <div className="w-full h-full max-w-6xl relative flex items-center justify-center">
          <CosmicPortal imageUrl={enhancedUrl} />
        </div>
      </div>

      {/* Control Deck - Fixed Height at Bottom */}
      <div className="flex-none w-full p-4 md:pb-8 z-30">
        <div className="glass-panel rounded-full p-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 backdrop-blur-xl bg-black/60 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-4xl mx-auto">

          {/* Reset Action */}
          <div className="flex-none">
            <LiquidButton variant="danger" onClick={onReset} className="!px-6 !py-3 text-xs">
              RESET
            </LiquidButton>
          </div>

          {/* Compression Controls - Centered Group */}
          <div className="flex-1 flex items-center justify-center gap-4 md:gap-8 border-x border-white/10 px-4 mx-2 min-w-[200px]">

            {/* Slider Group */}
            <div className="flex flex-col gap-2 w-full max-w-[200px]">
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
                className="w-full h-1.5 bg-cyan-900/50 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(6,182,212,0.8)] hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
              />
            </div>

            {/* Action Button - Always Visible */}
            <button
              onClick={handleCompressClick}
              disabled={isCompressing}
              className="text-xs font-bold text-cyan-300 hover:text-white transition-colors tracking-wider uppercase drop-shadow-[0_0_5px_rgba(6,182,212,0.8)] whitespace-nowrap px-4 py-2 rounded hover:bg-white/5"
            >
              {isCompressing ? 'PROCESSING...' : 'COMPRESS'}
            </button>

            {/* Size Indicator */}
            {compressedSizeKB && (
              <div className="flex flex-col items-end min-w-[60px]">
                <span className="text-[10px] text-white/40 font-mono">SIZE</span>
                <span className="text-xs text-green-400 font-mono font-bold">{compressedSizeKB} KB</span>
              </div>
            )}
          </div>

          {/* Download Action */}
          <div className="flex-none">
            <a href={compressedUrl || enhancedUrl} download="enhanced_cosmic.png" className="no-underline block">
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
