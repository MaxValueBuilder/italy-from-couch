"use client"

import { useParams } from "next/navigation"
import { cities } from "@/lib/data/cities"
import { tours } from "@/lib/data/tours"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { MapPin } from "lucide-react"

export default function CityPage() {
  const params = useParams()
  const cityId = params.city as string
  const city = cities[cityId]

  if (!city) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-2xl text-muted-foreground">City not found</p>
        </main>
        <Footer />
      </>
    )
  }

  const cityTours = tours.filter((tour) => tour.city === city.name)

  return (
    <>
      <Header />
      <main className="bg-background">
        {/* Hero Section with Image */}
        <section className="relative h-96 md:h-[500px] overflow-hidden">
          <img src={city.image || "/placeholder.svg"} alt={city.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-5xl md:text-6xl font-bold">{city.name}</h1>
              <p className="text-xl mt-2">{city.description}</p>
            </div>
          </div>
        </section>

        {/* City Overview */}
        <section className="py-16 md:py-24 px-4 border-b border-border">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground">History & Significance</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">{city.history}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 bg-card rounded-lg p-6 border border-border">
                <h3 className="text-xl font-bold text-foreground">Best Time to Visit</h3>
                <p className="text-muted-foreground leading-relaxed">{city.bestTime}</p>
              </div>

              <div className="space-y-4 bg-orange-50 dark:bg-orange-950 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
                <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100">Quick Tip</h3>
                <p className="text-orange-800 dark:text-orange-200 leading-relaxed">
                  Join one of our live tours to experience {city.name} like a local without the planning stress.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="py-16 md:py-24 px-4 bg-card border-b border-border">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">{city.name} Highlights</h2>
              <p className="text-lg text-muted-foreground">Must-see attractions and experiences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {city.highlights.map((highlight, idx) => (
                <div key={idx} className="space-y-3 p-6 rounded-lg bg-background border border-border">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{highlight.title}</h3>
                      <p className="text-muted-foreground mt-2">{highlight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Available Tours */}
        {cityTours.length > 0 && (
          <section className="py-16 md:py-24 px-4 border-b border-border">
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">Available Tours in {city.name}</h2>
                <p className="text-lg text-muted-foreground">Experience {city.name} with our local guides</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {cityTours.map((tour) => (
                  <Link
                    key={tour.id}
                    href={`/tours/${tour.id}`}
                    className="group cursor-pointer p-6 rounded-lg border border-border bg-card hover:shadow-lg hover:border-orange-600 transition-all"
                  >
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-orange-600 transition-colors">
                        {tour.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {tour.duration} min • Guide: {tour.guide}
                      </p>
                      <p className="text-sm text-orange-600 font-semibold">{tour.schedule}</p>
                      <div className="pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground font-semibold mb-2">Highlights:</p>
                        <div className="flex flex-wrap gap-2">
                          {tour.highlights.slice(0, 2).map((h, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100 px-2 py-1 rounded"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Local Tips */}
        <section className="py-16 md:py-24 px-4 bg-card">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Local Tips for {city.name}</h2>

              <div className="space-y-3">
                {city.tips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 rounded-lg bg-background border border-border hover:border-orange-600 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                      {idx + 1}
                    </div>
                    <p className="text-foreground leading-relaxed mt-1">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
