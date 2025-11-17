'use client'

import { useCallback } from 'react'

interface ImageUploaderProps {
  onImageSelect: (file: File | null) => void
  currentImage: File | null
}

export default function ImageUploader({ onImageSelect, currentImage }: ImageUploaderProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        onImageSelect(file)
      }
    },
    [onImageSelect]
  )

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImageSelect(file)
    }
  }

  return (
    <div className="w-full">
      {!currentImage ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-4 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 transition-all duration-300"
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/*"
            onChange={handleFileInput}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center">
              <svg
                className="w-12 h-12 text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Drop your image here
              </p>
              <p className="text-gray-500 mb-3">or</p>
              <span className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Browse Files
              </span>
              <p className="text-sm text-gray-400 mt-3">
                Supports: JPG, PNG, WebP
              </p>
            </div>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden">
            <img
              src={URL.createObjectURL(currentImage)}
              alt="Preview"
              className="w-full h-auto max-h-80 object-contain bg-gray-100"
            />
          </div>
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-gray-800">
                  {currentImage.name}
                </p>
                <p className="text-sm text-gray-500">
                  {(currentImage.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={() => onImageSelect(null)}
              className="text-red-600 hover:text-red-700 font-semibold transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
