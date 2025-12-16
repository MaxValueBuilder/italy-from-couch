"use client"

import { useParams, useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n/context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { fetchTourById, fetchTours } from "@/lib/api/tours"
import { getTourStreamInfo } from "@/lib/api/streams"
import { Tour } from "@/lib/data/tours"
import { VideoPlayer } from "@/components/streaming/video-player"
import { LiveBadge } from "@/components/streaming/live-badge"
import { TourImageGallery } from "@/components/tours/tour-image-gallery"
import { BookingSection } from "@/components/booking/booking-section"
import { Clock, MapPin, User, ArrowLeft, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth/context"

export default function TourDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useI18n()
  const { user } = useAuth()
  const tourId = params.id as string
  const [tour, setTour] = useState<Tour | null>(null)
  const [relatedTours, setRelatedTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [streamInfo, setStreamInfo] = useState<{
    isActive: boolean
    bookingId?: string
  } | null>(null)

  console.log("[TOUR] Component rendered, tourId:", tourId, "loading:", loading, "hasTour:", !!tour)

  useEffect(() => {
    console.log("[TOUR] useEffect triggered, tourId:", tourId)
    
    async function loadTour() {
      try {
        console.log("[TOUR] Loading tour data for:", tourId)
        const tourData = await fetchTourById(tourId)
        console.log("[TOUR] Tour data loaded:", tourData?._id)
        setTour(tourData)

        // Check for active stream for this tour
        if (tourId) {
          try {
            console.log("[TOUR] Checking for active stream for tour:", tourId)
            const streamData = await getTourStreamInfo(tourId)
            console.log("[TOUR] Stream info received:", streamData)
            setStreamInfo({
              isActive: streamData.isActive,
              bookingId: streamData.bookingId,
            })
          } catch (error: any) {
            console.error("[TOUR] Error loading stream info:", error)
            console.error("[TOUR] Error details:", error.message, error.stack)
            setStreamInfo({ isActive: false })
          }
        } else {
          console.warn("[TOUR] No tourId provided, skipping stream check")
        }

        // Load related tours
        if (tourData) {
          const allTours = await fetchTours()
          const related = allTours.filter((t) => t._id !== tourId && t.city === tourData.city).slice(0, 2)
          setRelatedTours(related)
        }
      } catch (error) {
        console.error("Error loading tour:", error)
      } finally {
        setLoading(false)
      }
    }
    loadTour()

    // Poll for stream updates every 5 seconds
    const interval = setInterval(async () => {
      if (!tourId) return
      
      try {
        console.log("[TOUR] Polling for stream updates, tourId:", tourId)
        const streamData = await getTourStreamInfo(tourId)
        const wasActive = streamInfo?.isActive
        if (streamData.isActive !== wasActive) {
          console.log("[TOUR] Stream status changed:", { wasActive, isActive: streamData.isActive, streamData })
        }
        setStreamInfo({
          isActive: streamData.isActive,
          bookingId: streamData.bookingId,
        })
      } catch (error: any) {
        console.error("[TOUR] Error polling stream info:", error)
        console.error("[TOUR] Polling error details:", error.message)
      }
    }, 5000)

    return () => {
      console.log("[TOUR] Cleaning up interval")
      clearInterval(interval)
    }
  }, [tourId])

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Loading tour...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!tour) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Tour not found</h1>
            <Button onClick={() => router.push("/tours")}>Back to Tours</Button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="bg-background">
        {/* Hero Section with Tour Image */}
        <section className="relative h-64 md:h-96 overflow-hidden">
          <img
            src={tour.images && tour.images.length > 0 ? tour.images[0] : "/placeholder.svg"}
            alt={tour.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="w-full max-w-6xl mx-auto px-4 pb-8">
              <div className="flex items-center gap-3 mb-4">
                <LiveBadge isLive={streamInfo?.isActive || tour.isLive || false} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  className="bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back
                </Button>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{tour.title}</h1>
              <p className="text-white/90 text-lg">{tour.city}</p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 md:py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-8">
              {/* Image Gallery */}
              {tour.images && tour.images.length > 0 && (
                <div>
                  <TourImageGallery images={tour.images} title={tour.title} />
                </div>
              )}

              {/* Video Player */}
              <div className="space-y-4">
                {(() => {
                  const streamType = streamInfo?.isActive ? "agora" : (tour.streamType || "youtube")
                  const isLive = streamInfo?.isActive || tour.isLive || false
                  console.log("[TOUR] Rendering VideoPlayer:", {
                    streamType,
                    isLive,
                    bookingId: streamInfo?.bookingId,
                    streamInfoActive: streamInfo?.isActive,
                    hasStreamInfo: !!streamInfo,
                  })
                  return (
                    <VideoPlayer
                      streamUrl={tour.streamUrl}
                      streamType={streamType}
                      isLive={isLive}
                      title={tour.title}
                      thumbnail={tour.images && tour.images.length > 0 ? tour.images[0] : undefined}
                      bookingId={streamInfo?.bookingId}
                      userId={user?.uid}
                    />
                  )
                })()}

                {/* Stream Status */}
                <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    {streamInfo?.isActive || tour.isLive ? (
                      <>
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                        <span className="font-semibold text-foreground">{t("tours.currentlyLive")}</span>
                      </>
                    ) : tour.streamUrl ? (
                      <>
                        <Calendar size={16} className="text-muted-foreground" />
                        <span className="text-muted-foreground">{t("tours.tourScheduled")}</span>
                      </>
                    ) : (
                      <>
                        <Clock size={16} className="text-muted-foreground" />
                        <span className="text-muted-foreground">{t("tours.streamStarting")}</span>
                      </>
                    )}
                  </div>
                  {(streamInfo?.isActive || tour.isLive) && (
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                      {t("tours.watchLive")}
                    </Button>
                  )}
                </div>
              </div>

              {/* Description */}
              {tour.description && (
                <div className="p-6 bg-card border border-border rounded-lg">
                  <h2 className="text-2xl font-bold text-foreground mb-4">{t("tours.description")}</h2>
                  <p className="text-muted-foreground leading-relaxed text-lg">{tour.description}</p>
                </div>
              )}

              {/* Main Content Grid: Details (Left) + Booking (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Tour Information */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Tour Details Card */}
                  <div className="p-6 bg-card border border-border rounded-lg">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Tour Details</h2>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <Clock size={20} className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Duration</p>
                          <p className="text-lg font-bold text-foreground mt-1">
                            {tour.duration} {t("tours.duration")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <User size={20} className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t("tours.guide")}</p>
                          <p className="text-lg font-bold text-foreground mt-1">{tour.guide}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <MapPin size={20} className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Schedule</p>
                          <p className="text-lg font-bold text-foreground mt-1">{tour.schedule}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Highlights Card */}
                  <div className="p-6 bg-card border border-border rounded-lg">
                    <h2 className="text-2xl font-bold text-foreground mb-6">{t("tours.highlights")}</h2>
                    <div className="flex flex-wrap gap-3">
                      {tour.highlights.map((highlight, idx) => (
                        <span
                          key={idx}
                          className="text-sm bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100 px-4 py-2 rounded-lg font-medium"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Details */}
                  {tour.details && (
                    <div className="p-6 bg-card border border-border rounded-lg">
                      <h2 className="text-2xl font-bold text-foreground mb-6">Details</h2>
                      <div className="space-y-4">
                        {tour.details.duration && (
                          <div className="pb-4 border-b border-border last:border-0 last:pb-0">
                            <p className="text-sm font-semibold text-foreground mb-1">Duration</p>
                            <p className="text-muted-foreground">{tour.details.duration}</p>
                          </div>
                        )}
                        {tour.details.language && (
                          <div className="pb-4 border-b border-border last:border-0 last:pb-0">
                            <p className="text-sm font-semibold text-foreground mb-1">Language</p>
                            <p className="text-muted-foreground">{tour.details.language}</p>
                          </div>
                        )}
                        {tour.details.groupSize && (
                          <div className="pb-4 border-b border-border last:border-0 last:pb-0">
                            <p className="text-sm font-semibold text-foreground mb-1">Group Size</p>
                            <p className="text-muted-foreground">{tour.details.groupSize}</p>
                          </div>
                        )}
                        {tour.details.included && tour.details.included.length > 0 && (
                          <div className="pb-4 border-b border-border last:border-0 last:pb-0">
                            <p className="text-sm font-semibold text-foreground mb-2">Included</p>
                            <ul className="space-y-1.5">
                              {tour.details.included.map((item, idx) => (
                                <li key={idx} className="text-muted-foreground flex items-start gap-2">
                                  <span className="text-orange-600 dark:text-orange-400 mt-1.5">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {tour.details.notIncluded && tour.details.notIncluded.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-foreground mb-2">Not Included</p>
                            <ul className="space-y-1.5">
                              {tour.details.notIncluded.map((item, idx) => (
                                <li key={idx} className="text-muted-foreground flex items-start gap-2">
                                  <span className="text-red-500 dark:text-red-400 mt-1.5">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Meeting Point */}
                  {tour.meetingPoint && (
                    <div className="p-6 bg-card border border-border rounded-lg">
                      <h2 className="text-2xl font-bold text-foreground mb-4">Meeting Point</h2>
                      <p className="text-muted-foreground leading-relaxed">{tour.meetingPoint}</p>
                    </div>
                  )}

                  {/* Booking Dates */}
                  {tour.bookingDates && tour.bookingDates.length > 0 && (
                    <div className="p-6 bg-card border border-border rounded-lg">
                      <h2 className="text-2xl font-bold text-foreground mb-4">Available Dates</h2>
                      <div className="flex flex-wrap gap-3">
                        {tour.bookingDates.map((date, idx) => (
                          <span
                            key={idx}
                            className="text-sm bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100 px-4 py-2 rounded-lg font-medium"
                          >
                            {new Date(date).toLocaleDateString()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Join Tour Button */}
                  {(streamInfo?.isActive || (tour.isLive && tour.streamUrl)) && (
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg py-6">
                      {t("tours.joinTour")}
                    </Button>
                  )}

                  {/* Related Tours */}
                  {relatedTours.length > 0 && (
                    <div className="p-6 bg-card border border-border rounded-lg">
                      <h2 className="text-2xl font-bold text-foreground mb-6">More Tours</h2>
                      <div className="space-y-3">
                        {relatedTours.map((relatedTour) => (
                          <Link
                            key={relatedTour._id}
                            href={`/tours/${relatedTour._id}`}
                            className="block p-4 rounded-lg border border-border hover:border-orange-600 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all group"
                          >
                            <p className="font-semibold text-foreground group-hover:text-orange-600 transition-colors">
                              {relatedTour.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {relatedTour.duration} {t("tours.duration")} • {relatedTour.guide}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Booking Section (Sticky on desktop) */}
                <div className="lg:col-span-1">
                  <div className="lg:sticky lg:top-24">
                    <BookingSection tour={tour} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

