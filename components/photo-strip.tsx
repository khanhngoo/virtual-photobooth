"use client"

import { forwardRef } from "react"

interface PhotoStripProps {
  photos: string[]
  color: string
}

const PhotoStrip = forwardRef<HTMLDivElement, PhotoStripProps>(({ photos, color }, ref) => {
  if (photos.length < 4) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <p>Take 4 photos to generate a photo strip</p>
      </div>
    )
  }

  // Calculate text color based on background color brightness
  const getTextColor = (bgColor: string) => {
    // Simple brightness formula (approximation)
    const isLight = bgColor === "#ffffff" || bgColor === "#f8fafc" || bgColor === "#10b981"
    return isLight ? "#000000" : "#ffffff"
  }

  const textColor = getTextColor(color)

  return (
    <div ref={ref} className="relative rounded-lg shadow-lg max-w-md mx-auto" style={{ backgroundColor: color }}>
      <div className="p-4 space-y-2">
        <div className="text-center mb-2">
          <h2 className="font-bold text-xl" style={{ color: textColor }}>
            PHOTO BOOTH
          </h2>
          <p className="text-xs opacity-80" style={{ color: textColor }}>
            {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-2">
          {photos.map((photo, index) => (
            <div key={index} className="rounded overflow-hidden relative aspect-[4/3]">
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                {/* Use a div with background image instead of Image component for data URLs */}
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${photo})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  aria-label={`Photo ${index + 1}`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <p className="text-xs opacity-80" style={{ color: textColor }}>
            Digital PhotoBooth
          </p>
        </div>
      </div>
    </div>
  )
})

PhotoStrip.displayName = "PhotoStrip"

export default PhotoStrip

