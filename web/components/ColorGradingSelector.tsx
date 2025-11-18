'use client'

interface ColorGradingSelectorProps {
  selected: string
  onSelect: (grading: string) => void
}

const gradingPresets = [
  { id: 'none', name: 'None', description: 'Original colors' },
  { id: 'warm', name: 'Warm', description: 'Cozy & inviting' },
  { id: 'cool', name: 'Cool', description: 'Fresh & calm' },
  { id: 'vibrant', name: 'Vibrant', description: 'Bold & saturated' },
  { id: 'muted', name: 'Muted', description: 'Soft & subtle' },
  { id: 'cinematic', name: 'Cinematic', description: 'Film-like teal & orange' },
  { id: 'vintage', name: 'Vintage', description: 'Nostalgic & faded' },
  { id: 'bw', name: 'Black & White', description: 'Classic monochrome' },
  { id: 'sepia', name: 'Sepia', description: 'Warm brown tones' },
  { id: 'dramatic', name: 'Dramatic', description: 'High contrast & moody' },
]

export default function ColorGradingSelector({ selected, onSelect }: ColorGradingSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {gradingPresets.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onSelect(preset.id)}
          className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
            selected === preset.id
              ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
          }`}
        >
          <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
            {preset.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {preset.description}
          </p>
        </button>
      ))}
    </div>
  )
}
