"use client"

import { useI18n } from "@/lib/i18n/context"
import Link from "next/link"

export function CitiesSection() {
  const { t } = useI18n()

  const cities = [
    {
      id: "rome",
      name: "Rome",
      description: t("cities.rome"),
      image: "/rome-colosseum.png",
    },
    {
      id: "florence",
      name: "Florence",
      description: t("cities.florence"),
      image: "/florence-duomo-renaissance.jpg",
    },
    {
      id: "venice",
      name: "Venice",
      description: t("cities.venice"),
      image: "/venice-canals-gondola.jpg",
    },
  ]

  return (
    <section id="cities" className="py-16 md:py-24 bg-card px-4 scroll-mt-16">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section header */}
        <div className="text-center space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">{t("cities.label")}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t("cities.title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("cities.subtitle")}</p>
        </div>

        {/* Cities grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cities.map((city) => (
            <Link
              key={city.id}
              href={`/cities/${city.id}`}
              className="group cursor-pointer transition-transform duration-300 hover:scale-105"
            >
              <div className="space-y-4">
                {/* Image */}
                <div className="relative h-64 rounded-lg overflow-hidden bg-border">
                  <img
                    src={city.image || "/placeholder.svg"}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground group-hover:text-orange-600 transition-colors">
                    {city.name}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{city.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
