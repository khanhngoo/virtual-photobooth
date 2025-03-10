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
            <div key={index} className="rounded overflow-hidden">
              <img 
                src={photo} 
                alt={`Photo ${index + 1}`} 
                className="w-full h-auto"
                onError={(e) => {
                  // If image fails to load, show a colored background with text
                  const target = e.target as HTMLImageElement;
                  target.style.height = '120px';
                  target.style.backgroundColor = '#333';
                  target.style.display = 'flex';
                  target.style.alignItems = 'center';
                  target.style.justifyContent = 'center';
                  target.style.color = '#fff';
                  target.style.padding = '10px';
                  target.style.textAlign = 'center';
                }}
              />
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

