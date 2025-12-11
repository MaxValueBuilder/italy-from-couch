"use client"

import { useParams, useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n/context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { fetchTourById, fetchTours } from "@/lib/api/tours"
import { Tour } from "@/lib/data/tours"
import { VideoPlayer } from "@/components/streaming/video-player"
import { LiveBadge } from "@/components/streaming/live-badge"
import { TourImageGallery } from "@/components/tours/tour-image-gallery"
import { Clock, MapPin, User, ArrowLeft, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function TourDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useI18n()
  const tourId = params.id as string
  const [tour, setTour] = useState<Tour | null>(null)
  const [relatedTours, setRelatedTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTour() {
      try {
        const tourData = await fetchTourById(tourId)
        setTour(tourData)

        // Load related tours
        if (tourData) {
          const allTours = await fetchTours()
          const related = allTours.filter((t) => t.id !== tourId && t.city === tourData.city).slice(0, 2)
          setRelatedTours(related)
        }
      } catch (error) {
        console.error("Error loading tour:", error)
      } finally {
        setLoading(false)
      }
    }
    loadTour()
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
                <LiveBadge isLive={tour.isLive || false} />
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
        <section className="py-8 md:py-12 px-2">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-6">
                {/* Image Gallery */}
                {tour.images && tour.images.length > 0 && (
                  <div className="space-y-4">
                    <TourImageGallery images={tour.images} title={tour.title} />
                  </div>
                )}

                {/* Video Player */}
                <div className="space-y-4">
                  <VideoPlayer
                    streamUrl={tour.streamUrl}
                    streamType={tour.streamType}
                    isLive={tour.isLive}
                    title={tour.title}
                    thumbnail={tour.images && tour.images.length > 0 ? tour.images[0] : undefined}
                  />

                  {/* Stream Status */}
                  <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      {tour.isLive ? (
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
                    {tour.isLive && (
                      <Button className="bg-red-600 hover:bg-red-700 text-white">
                        {t("tours.watchLive")}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Description */}
                {tour.description && (
                  <div className="space-y-4 p-6 bg-card border border-border rounded-lg">
                    <h2 className="text-xl font-bold text-foreground">{t("tours.description")}</h2>
                    <p className="text-muted-foreground leading-relaxed">{tour.description}</p>
                  </div>
                )}

                {/* Tour Info Section */}
                <div className="space-y-6">
                  {/* Tour Details Card */}
                  <div className="p-6 bg-card border border-border rounded-lg space-y-4">
                    <h2 className="text-xl font-bold text-foreground">Tour Details</h2>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Clock size={18} className="text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="font-semibold text-foreground">
                            {tour.duration} {t("tours.duration")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <User size={18} className="text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">{t("tours.guide")}</p>
                          <p className="font-semibold text-foreground">{tour.guide}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MapPin size={18} className="text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Schedule</p>
                          <p className="font-semibold text-foreground">{tour.schedule}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Highlights Card */}
                  <div className="p-6 bg-card border border-border rounded-lg space-y-4">
                    <h2 className="text-xl font-bold text-foreground">{t("tours.highlights")}</h2>
                    <div className="flex flex-wrap gap-2">
                      {tour.highlights.map((highlight, idx) => (
                        <span
                          key={idx}
                          className="text-sm bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100 px-3 py-1.5 rounded"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Join Tour Button */}
                  {tour.isLive && tour.streamUrl && (
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg py-6">
                      {t("tours.joinTour")}
                    </Button>
                  )}

                  {/* Related Tours */}
                  {relatedTours.length > 0 && (
                    <div className="p-6 bg-card border border-border rounded-lg space-y-4">
                      <h2 className="text-xl font-bold text-foreground">More Tours</h2>
                      <div className="space-y-3">
                        {relatedTours.map((relatedTour) => (
                          <Link
                            key={relatedTour.id}
                            href={`/tours/${relatedTour.id}`}
                            className="block p-3 rounded-lg border border-border hover:border-orange-600 transition-colors group"
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

                {/* Itinerary
                {tour.itinerary && (
                  <div className="space-y-4 p-6 bg-card border border-border rounded-lg">
                    <h2 className="text-xl font-bold text-foreground">Itinerary</h2>
                    <div className="text-muted-foreground leading-relaxed whitespace-pre-line">{tour.itinerary}</div>
                  </div>
                )} */}

                {/* Details */}
                {tour.details && (
                  <div className="space-y-4 p-6 bg-card border border-border rounded-lg">
                    <h2 className="text-xl font-bold text-foreground">Details</h2>
                    <div className="space-y-3">
                      {tour.details.duration && (
                        <div>
                          <p className="text-sm font-semibold text-foreground">Duration</p>
                          <p className="text-muted-foreground">{tour.details.duration}</p>
                        </div>
                      )}
                      {tour.details.language && (
                        <div>
                          <p className="text-sm font-semibold text-foreground">Language</p>
                          <p className="text-muted-foreground">{tour.details.language}</p>
                        </div>
                      )}
                      {tour.details.groupSize && (
                        <div>
                          <p className="text-sm font-semibold text-foreground">Group Size</p>
                          <p className="text-muted-foreground">{tour.details.groupSize}</p>
                        </div>
                      )}
                      {tour.details.included && tour.details.included.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-foreground">Included</p>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {tour.details.included.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {tour.details.notIncluded && tour.details.notIncluded.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-foreground">Not Included</p>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {tour.details.notIncluded.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Meeting Point */}
                {tour.meetingPoint && (
                  <div className="space-y-4 p-6 bg-card border border-border rounded-lg">
                    <h2 className="text-xl font-bold text-foreground">Meeting Point</h2>
                    <p className="text-muted-foreground">{tour.meetingPoint}</p>
                  </div>
                )}

                {/* Booking Dates */}
                {tour.bookingDates && tour.bookingDates.length > 0 && (
                  <div className="space-y-4 p-6 bg-card border border-border rounded-lg">
                    <h2 className="text-xl font-bold text-foreground">Available Dates</h2>
                    <div className="flex flex-wrap gap-2">
                      {tour.bookingDates.map((date, idx) => (
                        <span
                          key={idx}
                          className="text-sm bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100 px-3 py-1.5 rounded"
                        >
                          {new Date(date).toLocaleDateString()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

