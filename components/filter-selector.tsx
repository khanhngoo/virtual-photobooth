"use client"
import Image from "next/image"

interface FilterSelectorProps {
  selectedFilter: string
  onSelectFilter: (filter: string) => void
}

const filters = [
  { id: "normal", name: "Normal" },
  { id: "grayscale", name: "B&W" },
  { id: "sepia", name: "Sepia" },
  { id: "vintage", name: "Vintage" },
  { id: "blur", name: "Blur" },
]

export default function FilterSelector({ selectedFilter, onSelectFilter }: FilterSelectorProps) {
  return (
    <div className="flex space-x-3 justify-center">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onSelectFilter(filter.id)}
          className={`flex flex-col items-center transition-all`}
        >
          <div
            className={`w-12 h-12 rounded-full overflow-hidden border-2 ${
              selectedFilter === filter.id
                ? "border-primary ring-2 ring-primary ring-offset-2"
                : "border-muted-foreground/20 hover:border-muted-foreground/50"
            }`}
          >
            <div className={`w-full h-full ${getFilterClass(filter.id)}`}>
              <div 
                className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500"
                style={{
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            </div>
          </div>
          <p className="text-xs mt-1 text-center">{filter.name}</p>
        </button>
      ))}
    </div>
  )
}

function getFilterClass(filterId: string): string {
  switch (filterId) {
    case "grayscale":
      return "filter grayscale"
    case "sepia":
      return "filter sepia"
    case "vintage":
      return "filter sepia brightness-90 contrast-120"
    case "blur":
      return "filter blur-sm"
    default:
      return ""
  }
}

