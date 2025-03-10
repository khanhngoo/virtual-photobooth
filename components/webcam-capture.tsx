"use client"

import { forwardRef, useRef, useEffect, useState } from "react"
import Webcam from "react-webcam"

interface WebcamCaptureProps {
  filter: string
}

const WebcamCapture = forwardRef<Webcam, WebcamCaptureProps>(({ filter }, ref) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const animationRef = useRef<number | null>(null)

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  }

  useEffect(() => {
    // Check for camera permission
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false))

    // Cleanup function to stop animation frame and video
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null
        videoRef.current = null
      }
    }
  }, [])

  const applyFilter = (videoNode: HTMLVideoElement) => {
    if (!canvasRef.current || !videoNode || !isCameraReady) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    const { videoWidth, videoHeight } = videoNode
    canvasRef.current.width = videoWidth
    canvasRef.current.height = videoHeight

    // Draw the video frame to the canvas
    ctx.drawImage(videoNode, 0, 0, videoWidth, videoHeight)

    // Apply filter effects based on the selected filter
    switch (filter) {
      case "grayscale":
        const imageData = ctx.getImageData(0, 0, videoWidth, videoHeight)
        const data = imageData.data
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
          data[i] = avg // red
          data[i + 1] = avg // green
          data[i + 2] = avg // blue
        }
        ctx.putImageData(imageData, 0, 0)
        break
      case "sepia":
        ctx.filter = "sepia(100%)"
        ctx.drawImage(videoNode, 0, 0, videoWidth, videoHeight)
        ctx.filter = "none"
        break
      case "vintage":
        ctx.filter = "sepia(50%) contrast(120%) brightness(90%)"
        ctx.drawImage(videoNode, 0, 0, videoWidth, videoHeight)
        ctx.filter = "none"
        break
      case "blur":
        ctx.filter = "blur(4px)"
        ctx.drawImage(videoNode, 0, 0, videoWidth, videoHeight)
        ctx.filter = "none"
        break
      case "normal":
      default:
        // No filter applied
        break
    }

    // Request next animation frame
    animationRef.current = requestAnimationFrame(() => applyFilter(videoNode))
  }

  const handleUserMedia = () => {
    setIsCameraReady(true)
  }

  // Setup video element for filter processing
  useEffect(() => {
    if (!isCameraReady || filter === "normal") return

    const setupVideo = async () => {
      // Cancel any existing animation frame
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }

      // Get the webcam stream from the ref
      const webcamNode = (ref as any).current
      if (!webcamNode || !webcamNode.stream) return

      // Create or get the video element
      let videoNode = videoRef.current
      if (!videoNode) {
        videoNode = document.createElement("video")
        videoNode.muted = true
        videoNode.playsInline = true
        videoRef.current = videoNode
      }

      // Set the stream and play the video
      videoNode.srcObject = webcamNode.stream

      try {
        await videoNode.play()
        // Start the filter animation loop
        applyFilter(videoNode)
      } catch (error) {
        console.error("Error playing video:", error)
      }
    }

    setupVideo()

    // Cleanup when filter changes or component unmounts
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [isCameraReady, filter, ref])

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <p className="text-red-500 mb-2">Camera access denied</p>
        <p className="text-sm">Please allow camera access to use the photobooth</p>
      </div>
    )
  }

  if (hasPermission === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Requesting camera permission...</p>
      </div>
    )
  }

  return (
    <>
      <Webcam
        audio={false}
        ref={ref}
        videoConstraints={videoConstraints}
        screenshotFormat="image/jpeg"
        className={`w-full h-full object-cover ${filter !== "normal" ? "hidden" : ""}`}
        onUserMedia={handleUserMedia}
      />
      {filter !== "normal" && <canvas ref={canvasRef} className="w-full h-full object-cover" />}
    </>
  )
})

WebcamCapture.displayName = "WebcamCapture"

export default WebcamCapture

