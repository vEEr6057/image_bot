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
        <div className="text-center">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/*"
            onChange={handleFileInput}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('file-upload')?.click()
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Upload from Device
            </button>
          </label>
          <p className="text-xs text-gray-500 mt-3">
            Supports: JPG, PNG, WebP
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={URL.createObjectURL(currentImage)}
              alt="Preview"
              className="w-full h-auto max-h-64 object-contain bg-gray-100"
            />
          </div>
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-gray-800 text-sm">
                  {currentImage.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(currentImage.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={() => onImageSelect(null)}
              className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
