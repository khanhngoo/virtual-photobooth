"use client"

import { useState, useEffect, useRef } from "react"

interface CountdownTimerProps {
  seconds: number
  onComplete: () => void
}

export default function CountdownTimer({ seconds, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Reset timer when seconds prop changes
    setTimeLeft(seconds)
  }, [seconds])

  useEffect(() => {
    if (timeLeft <= 0) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      onComplete()
      return
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [timeLeft, onComplete])

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
      <div className="text-white text-9xl font-bold animate-pulse">{timeLeft}</div>
    </div>
  )
}

