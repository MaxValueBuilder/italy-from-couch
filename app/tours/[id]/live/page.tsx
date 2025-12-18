"use client"

import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { fetchTourById } from "@/lib/api/tours"
import { getTourStreamInfo } from "@/lib/api/streams"
import { VideoPlayer } from "@/components/streaming/video-player"
import { ChatPanel } from "@/components/streaming/chat-panel"
import { LiveBadge } from "@/components/streaming/live-badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth/context"

export default function LiveStreamPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const tourId = params.id as string
  const [tour, setTour] = useState<any>(null)
  const [streamInfo, setStreamInfo] = useState<{
    isActive: boolean
    bookingId?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        // Load tour data
        const tourData = await fetchTourById(tourId)
        if (!tourData) {
          setError("Tour not found")
          return
        }
        setTour(tourData)

        // Check for active stream
        const streamData = await getTourStreamInfo(tourId)
        setStreamInfo({
          isActive: streamData.isActive,
          bookingId: streamData.bookingId,
        })

        if (!streamData.isActive) {
          setError("No active stream available. The stream may have ended or not started yet.")
        }
      } catch (err: any) {
        console.error("Error loading stream:", err)
        setError(err.message || "Failed to load stream")
      } finally {
        setLoading(false)
      }
    }

    if (tourId) {
      loadData()
    }

    // Poll for stream updates every 10 seconds (optimized frequency)
    const interval = setInterval(async () => {
      if (!tourId) return
      try {
        const streamData = await getTourStreamInfo(tourId)
        setStreamInfo((prev) => {
          // Only update if status changed to avoid unnecessary re-renders
          if (prev?.isActive !== streamData.isActive || prev?.bookingId !== streamData.bookingId) {
            return {
              isActive: streamData.isActive,
              bookingId: streamData.bookingId,
            }
          }
          return prev
        })
      } catch (err) {
        // Silently fail polling
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [tourId])

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Loading stream...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !tour) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-md w-full text-center space-y-4">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground" />
            <h1 className="text-2xl font-bold text-foreground">
              {error || "Tour not found"}
            </h1>
            <p className="text-muted-foreground">
              {error || "The tour you're looking for doesn't exist."}
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
              <Button onClick={() => router.push(`/tours/${tourId}`)}>
                View Tour Details
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Stream Header */}
        <div className="bg-card border-b border-border sticky top-0 z-10 backdrop-blur-sm bg-card/95">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/tours/${tourId}`)}
                  className="gap-2 shrink-0"
                >
                  <ArrowLeft size={16} />
                  <span className="hidden sm:inline">Back to Tour</span>
                </Button>
                <div className="h-6 w-px bg-border hidden sm:block" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-semibold text-foreground truncate">{tour.title}</h1>
                  <p className="text-sm text-muted-foreground">{tour.city}</p>
                </div>
              </div>
              <LiveBadge isLive={streamInfo?.isActive || false} />
            </div>
          </div>
        </div>

        {/* Video Player Section */}
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            {streamInfo?.isActive && streamInfo.bookingId ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Video Player */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Video Player */}
                  <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
                    <VideoPlayer
                      streamType="agora"
                      isLive={true}
                      title={tour.title}
                      thumbnail={tour.images && tour.images.length > 0 ? tour.images[0] : undefined}
                      bookingId={streamInfo.bookingId}
                      userId={user?.uid}
                    />
                  </div>
                  
                  {/* Stream Info */}
                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                        <div>
                          <span className="font-semibold text-foreground block">Live Now</span>
                          <span className="text-sm text-muted-foreground">
                            {tour.title} • {tour.city}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/tours/${tourId}`)}
                        className="w-full sm:w-auto"
                      >
                        View Tour Details
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Chat Panel - Sidebar on desktop, full width on mobile */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24 h-[calc(100vh-8rem)]">
                    <ChatPanel bookingId={streamInfo.bookingId} className="h-full" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-12 text-center max-w-2xl mx-auto">
                <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Stream Not Available
                </h2>
                <p className="text-muted-foreground mb-6">
                  The stream has ended or hasn't started yet. Please check back later or view the tour details.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => router.push(`/tours/${tourId}`)}>
                    View Tour Details
                  </Button>
                  <Button variant="outline" onClick={() => router.back()}>
                    Go Back
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

