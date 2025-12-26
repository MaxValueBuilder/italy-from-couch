"use client"

import { useI18n } from "@/lib/i18n/context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { fetchTours } from "@/lib/api/tours"
import { Tour } from "@/lib/data/tours"
import Link from "next/link"
import { Clock, MapPin, User } from "lucide-react"
import { LiveBadge } from "@/components/streaming/live-badge"
import { useEffect, useState } from "react"

export default function ToursPage() {
  const { t } = useI18n()
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTours() {
      try {
        const toursData = await fetchTours()
        setTours(toursData)
      } catch (error) {
        console.error("Error loading tours:", error)
      } finally {
        setLoading(false)
      }
    }
    loadTours()
  }, [])

  return (
    <>
      <Header />
      <main className="bg-background">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 bg-card border-b border-border">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">{t("tours.heroTitle")}</h1>
            <p className="text-lg text-muted-foreground">{t("tours.heroSubtitle")}</p>
          </div>
        </section>

        {/* Tours Grid */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-6xl mx-auto space-y-12">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading tours...</p>
              </div>
            ) : tours.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tours available at the moment.</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tours.map((tour) => (
                <Link
                  key={tour._id}
                  href={`/tours/${tour._id}`}
                  className="group cursor-pointer transition-all duration-300 hover:scale-105"
                >
                  <div className="space-y-4 h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-48 rounded-lg overflow-hidden bg-border flex-shrink-0">
                      <img
                        src={tour.images && tour.images.length > 0 ? tour.images[0] : "/placeholder.svg"}
                        alt={tour.title}
                        className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
                      />
                      {/* Live Badge */}
                      <div className="absolute top-3 left-3">
                        <LiveBadge isLive={tour.isLive || false} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3 flex-1 flex flex-col">
                      <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-orange-600 transition-colors">
                        {tour.title}
                      </h3>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <span>
                            {tour.duration} {t("tours.duration")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          <span>
                            {t("tours.guide")}: {tour.guide}
                          </span>
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="pt-2 border-t border-border mt-auto">
                        <p className="text-xs text-muted-foreground font-semibold mb-2">{t("tours.highlights")}:</p>
                        <div className="flex flex-wrap gap-2">
                          {tour.highlights.map((highlight, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100 px-2 py-1 rounded"
                            >
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
