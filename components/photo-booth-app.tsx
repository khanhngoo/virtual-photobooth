"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Camera, Download, Share2, Clock, Home, RefreshCw, Info, QrCode } from "lucide-react"
import PhotoStrip from "@/components/photo-strip"
import FilterSelector from "@/components/filter-selector"
import CountdownTimer from "@/components/countdown-timer"
import WebcamCapture from "@/components/webcam-capture"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import QRCode from "qrcode"
import Webcam from "react-webcam"

// Add this function to convert DOM node to image
const domToImage = async (node: HTMLElement): Promise<string> => {
  // Simple implementation using canvas
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  // Set canvas dimensions to match the node
  const { width, height } = node.getBoundingClientRect();
  canvas.width = width;
  canvas.height = height;
  
  // Draw a background
  if (context) {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    
    // Use foreignObject to render HTML to canvas
    const data = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          ${node.outerHTML}
        </div>
      </foreignObject>
    </svg>`;
    
    // Create an image from the SVG
    const img = document.createElement('img');
    const blob = new Blob([data], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    // Return a promise that resolves with the data URL
    return new Promise((resolve) => {
      img.onload = () => {
        context.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = url;
    });
  }
  
  return '';
};

interface PhotoBoothAppProps {
  onReset: () => void
}

export default function PhotoBoothApp({ onReset }: PhotoBoothAppProps) {
  const [photos, setPhotos] = useState<string[]>([])
  const [selectedFilter, setSelectedFilter] = useState("normal")
  const [countdownTime, setCountdownTime] = useState(3)
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [stripColor, setStripColor] = useState("#f43f5e")
  const [activeTab, setActiveTab] = useState("capture")
  const [autoCapture, setAutoCapture] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  const [showQRCode, setShowQRCode] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("")

  const webcamRef = useRef<Webcam>(null)
  const photoStripRef = useRef<HTMLDivElement>(null)

  // Define generateQRCode with useCallback to avoid dependency issues
  const generateQRCode = useCallback(async () => {
    try {
      if (!photoStripRef.current || photos.length !== 4) return;
      
      // Generate a data URL for the photo strip
      // Store the dataUrl in a variable that will be used
      const stripDataUrl = await domToImage(photoStripRef.current);
      console.log("Generated photo strip data URL:", stripDataUrl.substring(0, 50) + "...");
      
      // In a real app, you would upload this to a server and get a shareable URL
      // For this demo, we'll just create a QR code with some text
      const demoShareableUrl = "This would be a real URL in a production app";
      
      const qrCodeUrl = await QRCode.toDataURL(demoShareableUrl, {
        width: 150,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      setQrCodeDataUrl(qrCodeUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
      // Create a fallback QR code with an error message
      const fallbackUrl = await QRCode.toDataURL("Error generating QR code", {
        width: 150,
        margin: 1,
      });
      setQrCodeDataUrl(fallbackUrl);
    }
  }, [photos]);

  // Generate QR code when photo strip is complete
  useEffect(() => {
    if (photos.length === 4 && photoStripRef.current) {
      generateQRCode();
    }
  }, [photos, generateQRCode]); // Add generateQRCode to dependencies

  const capturePhoto = () => {
    if (photos.length >= 4) {
      setPhotos([])
      return
    }

    try {
      // Make sure webcam is ready before starting countdown
      if (webcamRef.current && webcamRef.current.stream) {
        setIsCountingDown(true)
      } else {
        console.error("Webcam not ready")
      }
    } catch (error) {
      console.error("Error starting capture:", error)
    }
  }

  const handlePhotoTaken = (photoDataUrl: string | null) => {
    if (photoDataUrl) {
      setPhotos((prev) => [...prev, photoDataUrl])
      setIsCountingDown(false)

      // If auto-capture is enabled and we haven't taken 4 photos yet, take another one
      if (autoCapture && photos.length + 1 < 4) {
        setTimeout(() => {
          if (webcamRef.current) {
            capturePhoto()
          }
        }, 1500) // Increased delay to 1.5 seconds for better stability
      }

      if (photos.length + 1 >= 4) {
        setActiveTab("photostrip")
      }
    } else {
      console.error("Failed to capture photo: photoDataUrl is null")
      setIsCountingDown(false)
    }
  }

  const downloadPhotoStrip = async () => {
    if (photoStripRef.current && photos.length === 4) {
      try {
        // Create a temporary container to render the photo strip
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        document.body.appendChild(container);
        
        // Clone the photo strip node
        const clone = photoStripRef.current.cloneNode(true) as HTMLElement;
        container.appendChild(clone);
        
        // Wait for images to load
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Convert to image
        const dataUrl = await domToImage(clone);
        
        // Create download link
        const link = document.createElement('a');
        link.download = `photo-strip-${new Date().getTime()}.png`;
        link.href = dataUrl;
        link.click();
        
        // Clean up
        document.body.removeChild(container);
      } catch (error) {
        console.error('Error downloading photo strip:', error);
        alert('Failed to download photo strip. Please try again.');
      }
    }
  };

  const shareToSocial = (platform: string) => {
    if (photos.length !== 4) return;
    
    // In a real app, you would implement proper social media sharing
    // For now, we'll just show an alert
    alert(`Sharing to ${platform} is not implemented in this demo. In a real app, this would open a ${platform} sharing dialog.`);
  };

  return (
    <>
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>How to use the PhotoBooth</DialogTitle>
            <DialogDescription>Follow these simple steps to create your photo strip</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">1. Capture Photos</h3>
              <p>Take 4 photos with your webcam. You can use manual capture or auto-capture mode.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">2. Apply Filters</h3>
              <p>Choose from various filters to enhance your photos. Preview them in real-time.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">3. Customize Your Photo Strip</h3>
              <p>Select colors for your photo strip.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">4. Share Your Memories</h3>
              <p>Download your photo strip or share directly to social media.</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setShowInstructions(false)}>Got it!</Button>
          </div>
        </DialogContent>
      </Dialog>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Digital PhotoBooth</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setShowInstructions(true)}>
              <Info className="h-5 w-5" />
            </Button>
            <Button variant="ghost" onClick={onReset}>
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="capture">
              <Camera className="mr-2 h-4 w-4" />
              Capture
            </TabsTrigger>
            <TabsTrigger value="photostrip" disabled={photos.length < 4}>
              <Download className="mr-2 h-4 w-4" />
              Photo Strip
            </TabsTrigger>
          </TabsList>

          <TabsContent value="capture" className="mt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="relative rounded-lg overflow-hidden bg-black aspect-[4/3]">
                  {isCountingDown ? (
                    <CountdownTimer
                      seconds={countdownTime}
                      onComplete={() => {
                        if (webcamRef.current) {
                          const photoDataUrl = webcamRef.current.getScreenshot()
                          handlePhotoTaken(photoDataUrl)
                        }
                      }}
                    />
                  ) : null}

                  <WebcamCapture ref={webcamRef} filter={selectedFilter} />
                </div>

                <div className="flex justify-center space-x-2">
                  <FilterSelector selectedFilter={selectedFilter} onSelectFilter={setSelectedFilter} />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button onClick={capturePhoto} disabled={isCountingDown || photos.length >= 4} size="lg">
                      <Camera className="mr-2 h-4 w-4" />
                      {photos.length >= 4 ? "Reset" : "Take Photo"}
                      {photos.length < 4 ? ` (${photos.length}/4)` : ""}
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <select
                      value={countdownTime}
                      onChange={(e) => setCountdownTime(Number(e.target.value))}
                      className="p-2 rounded border"
                      disabled={isCountingDown}
                    >
                      <option value="3">3s</option>
                      <option value="5">5s</option>
                      <option value="10">10s</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-capture"
                    checked={autoCapture}
                    onCheckedChange={setAutoCapture}
                    disabled={isCountingDown}
                  />
                  <Label htmlFor="auto-capture">Auto-capture all 4 photos</Label>
                </div>

                {autoCapture && photos.length === 0 && !isCountingDown && (
                  <Button onClick={capturePhoto} variant="secondary" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Start Auto-Capture
                  </Button>
                )}
              </div>

              <div className="md:col-span-1">
                <div className="bg-muted p-4 rounded-lg h-full">
                  <h3 className="text-lg font-medium mb-3">Preview</h3>
                  <div className="flex flex-col space-y-2">
                    {photos.map((photo, index) => (
                      <div key={index} className="aspect-[4/3] bg-black rounded overflow-hidden">
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
                    ))}
                    {Array.from({ length: Math.max(1, 4 - photos.length) }).map((_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="aspect-[4/3] bg-gray-800 rounded flex items-center justify-center text-gray-500"
                      >
                        {photos.length === 0 ? "No photos yet" : `Photo ${photos.length + index + 1}`}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="photostrip" className="mt-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="md:col-span-1">
                <PhotoStrip photos={photos} color={stripColor} ref={photoStripRef} />
              </div>

              <div className="md:col-span-1 space-y-6">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">Customize</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-1">Strip Color</label>
                      <div className="flex space-x-2">
                        {["#f43f5e", "#3b82f6", "#10b981", "#8b5cf6", "#000000"].map((color) => (
                          <button
                            key={color}
                            onClick={() => setStripColor(color)}
                            className={`w-8 h-8 rounded-full ${stripColor === color ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                            style={{ backgroundColor: color }}
                            aria-label={`Select ${color} color`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">Share</h3>

                  <div className="space-y-3">
                    <Button onClick={downloadPhotoStrip} className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" />
                      Download Photo Strip
                    </Button>

                    <Button
                      onClick={() => {
                        setShowQRCode(!showQRCode)
                        if (!qrCodeDataUrl) {
                          generateQRCode()
                        }
                      }}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      {showQRCode ? "Hide QR Code" : "Share via QR Code"}
                    </Button>

                    {showQRCode && (
                      <div className="flex flex-col items-center justify-center p-4 bg-background rounded-lg">
                        {qrCodeDataUrl ? (
                          <>
                            <div className="relative w-32 h-32 mx-auto">
                              <div 
                                className="w-full h-full"
                                style={{
                                  backgroundImage: `url(${qrCodeDataUrl})`,
                                  backgroundSize: 'contain',
                                  backgroundPosition: 'center',
                                  backgroundRepeat: 'no-repeat'
                                }}
                                aria-label="QR Code"
                              />
                            </div>
                            <p className="text-sm text-center mt-2">Scan to download on your phone</p>
                          </>
                        ) : (
                          <div className="w-32 h-32 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                            Generating...
                          </div>
                        )}
                      </div>
                    )}

                    <Separator />

                    <Button
                      variant="outline"
                      onClick={() => shareToSocial("instagram")}
                      className="w-full justify-start"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share to Instagram
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => shareToSocial("facebook")}
                      className="w-full justify-start"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share to Facebook
                    </Button>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  onClick={() => {
                    setPhotos([])
                    setActiveTab("capture")
                    setShowQRCode(false)
                  }}
                  className="w-full"
                >
                  Start New Photo Strip
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}

