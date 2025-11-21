import React, { useState } from 'react'
import CosmicPortal from './CosmicPortal'

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
    <div className="w-full h-full flex flex-col items-center justify-center relative">

      {/* Main Display Area - Cosmic Portal */}
      <div className="w-full max-w-4xl h-[60vh] relative z-10">
        <CosmicPortal imageUrl={enhancedUrl} />
      </div>

      {/* Control Deck - Floating Glass Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[600px]">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-6">

          {/* Reset / New Upload */}
          <button
            onClick={onReset}
            className="group flex flex-col items-center gap-1 min-w-[80px] hover:scale-110 transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center group-hover:bg-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <span className="text-[10px] font-mono text-red-400 tracking-widest opacity-70 group-hover:opacity-100">RESET</span>
          </button>

          {/* Compression Controls */}
          <div className="flex flex-col items-center gap-2 flex-1 border-x border-white/10 px-4">
            <div className="flex items-center gap-4 w-full">
              <span className="text-[10px] font-mono text-blue-400">QUAL: {quality}%</span>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="flex-1 h-1 bg-blue-900/50 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(59,130,246,0.8)]"
              />
            </div>
            <button
              onClick={handleCompressClick}
              disabled={isCompressing}
              className="text-xs font-bold text-blue-300 hover:text-blue-100 transition-colors tracking-wider uppercase drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]"
            >
              {isCompressing ? 'COMPRESSING...' : 'INITIATE COMPRESSION'}
            </button>
          </div>

          {/* Download Action */}
          <a href={enhancedUrl} download="enhanced_cosmic.png">
            <button className="group flex flex-col items-center gap-1 min-w-[80px] hover:scale-110 transition-transform">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center group-hover:bg-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <svg className="w-6 h-6 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 tracking-widest opacity-70 group-hover:opacity-100">SAVE</span>
            </button>
          </a>

        </div>
      </div>

    </div>
  )
}
