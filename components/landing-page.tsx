"use client"

import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LandingPageProps {
  onStart: () => void
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/20 to-background p-4">
      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">Digital PhotoBooth</h1>

        <p className="text-xl text-muted-foreground">
          Capture moments, add fun filters, and create shareable photo strips
        </p>

        <div className="flex flex-col items-center space-y-4">
          <Button size="lg" className="text-lg px-8 py-6" onClick={onStart}>
            <Camera className="mr-2 h-5 w-5" />
            Get Started
          </Button>
        </div>
      </div>
    </div>
  )
}

