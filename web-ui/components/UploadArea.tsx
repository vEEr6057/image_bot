'use client'

import { useRef, useState } from 'react'

interface UploadAreaProps {
  onFileSelect: (file: File, previewUrl: string) => void
  isUploading?: boolean
}

export default function UploadArea({ onFileSelect, isUploading }: UploadAreaProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    const url = URL.createObjectURL(file)
    setPreview(url)
    setFileName(file.name)
    onFileSelect(file, url)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      {!preview ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-custom p-10 text-center cursor-pointer transition-colors min-h-[160px] flex flex-col items-center justify-center ${
            isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
          }`}
        >
          <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-base text-gray-600 dark:text-gray-400">
            {isUploading ? 'Uploading...' : 'Click or drag to upload an image'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-custom overflow-hidden border border-gray-200 dark:border-gray-700">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto max-h-[240px] object-contain bg-gray-50 dark:bg-gray-800 mx-auto"
            />
          </div>
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{fileName}</p>
            </div>
            <button
              onClick={() => {
                setPreview(null)
                setFileName(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
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
