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
    <div className="w-full h-full flex flex-col items-center relative">

      {/* Main Display Area - Dimensional Mirror */}
      {/* Takes up top 65% of the screen */}
      <div className="w-full h-[65%] flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-5xl h-full relative z-10">
          <CosmicPortal imageUrl={enhancedUrl} />
        </div>
      </div>

      {/* Control Deck - Floating Glass Bar */}
      {/* Takes up bottom area */}
      <div className="w-full h-[35%] flex flex-col items-center justify-start pt-4">
        <div className="glass-panel rounded-2xl p-6 w-[90%] max-w-[800px] flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Reset Action */}
          <LiquidButton variant="danger" onClick={onReset}>
            RESET
          </LiquidButton>

          {/* Compression Controls */}
          <div className="flex flex-col items-center gap-3 flex-1 w-full md:w-auto px-4 border-y md:border-y-0 md:border-x border-white/10 py-4 md:py-0">
            <div className="flex items-center gap-4 w-full max-w-[300px]">
              <span className="text-xs font-mono text-cyan-300 whitespace-nowrap">QUAL: {quality}%</span>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="flex-1 h-1 bg-cyan-900/50 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(6,182,212,0.8)]"
              />
            </div>
            <button
              onClick={handleCompressClick}
              disabled={isCompressing}
              className="text-xs font-bold text-cyan-300 hover:text-white transition-colors tracking-wider uppercase drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]"
            >
              {isCompressing ? 'COMPRESSING...' : 'INITIATE COMPRESSION'}
            </button>
            {compressedSizeKB && (
              <span className="text-xs text-green-400 font-mono">SIZE: {compressedSizeKB} KB</span>
            )}
          </div>

          {/* Download Action */}
          <a href={compressedUrl || enhancedUrl} download="enhanced_cosmic.png">
            <LiquidButton variant="primary">
              SAVE
            </LiquidButton>
          </a>

        </div>
      </div>

    </div>
  )
}
