"use client"

import { useI18n } from "@/lib/i18n/context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { guides } from "@/lib/data/guides"
import { Globe } from "lucide-react"

export default function GuidesPage() {
  const { t } = useI18n()

  return (
    <>
      <Header />
      <main className="bg-background">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 bg-card border-b border-border">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">{t("guides.heroTitle")}</h1>
            <p className="text-lg text-muted-foreground">{t("guides.heroSubtitle")}</p>
          </div>
        </section>

        {/* Guides Grid */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {guides.map((guide) => (
                <div
                  key={guide.id}
                  className="space-y-4 p-6 rounded-lg bg-card border border-border hover:shadow-lg transition-shadow"
                >
                  {/* Image */}
                  <div className="w-full h-48 rounded-lg overflow-hidden bg-border">
                    <img
                      src={guide.image || "/placeholder.svg"}
                      alt={guide.name}
                      className="w-full h-full object-cover hover:brightness-110 transition-all"
                    />
                  </div>

                  {/* Name and role */}
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{guide.name}</h3>
                    <p className="text-orange-600 font-semibold">{guide.city}</p>
                  </div>

                  {/* Bio */}
                  <p className="text-muted-foreground leading-relaxed text-sm">{guide.bio}</p>

                  {/* Specialties */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">{t("guides.specialties")}</p>
                    <div className="flex flex-wrap gap-2">
                      {guide.specialties.map((specialty, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100 px-2 py-1 rounded"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
                      <Globe size={14} />
                      {t("guides.languages")}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {guide.languages.map((language, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-2 py-1 rounded"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tours count */}
                  <p className="text-sm text-muted-foreground border-t border-border pt-4">
                    <span className="font-semibold text-foreground">{guide.toursCount}</span> {t("guides.toursAvailable")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
