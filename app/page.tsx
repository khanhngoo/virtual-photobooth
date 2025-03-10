"use client"

import { useState } from "react"
import LandingPage from "@/components/landing-page"
import PhotoBoothApp from "@/components/photo-booth-app"

export default function Home() {
  const [started, setStarted] = useState(false)

  if (!started) {
    return <LandingPage onStart={() => setStarted(true)} />
  }

  return <PhotoBoothApp onReset={() => setStarted(false)} />
}

