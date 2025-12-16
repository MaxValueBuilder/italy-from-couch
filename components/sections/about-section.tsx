"use client"

import { useI18n } from "@/lib/i18n/context"

export function AboutSection() {
  const { t } = useI18n()

  const values = [
    {
      title: t("about.value1Title"),
      description: t("about.value1Desc"),
    },
    {
      title: t("about.value2Title"),
      description: t("about.value2Desc"),
    },
    {
      title: t("about.value3Title"),
      description: t("about.value3Desc"),
    },
  ]

  return (
    <section id="about" className="py-16 md:py-24 bg-card border-y border-border px-4 scroll-mt-16">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section header */}
        <div className="text-center space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">About Us</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t("about.heroTitle")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("about.heroSubtitle")}</p>
        </div>

        {/* Story */}
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-4">{t("about.storyTitle")}</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">{t("about.storyText")}</p>
          </div>
        </div>

        {/* Mission */}
        <div className="max-w-4xl mx-auto space-y-6 pt-8 border-t border-border">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-4">{t("about.missionTitle")}</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">{t("about.missionText")}</p>
          </div>
        </div>

        {/* Values */}
        <div className="space-y-8 pt-8">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-foreground">{t("about.valuesTitle")}</h3>
            <p className="text-muted-foreground">{t("about.valuesSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, idx) => (
              <div
                key={idx}
                className="space-y-3 p-6 rounded-lg bg-background border border-border hover:shadow-lg transition-shadow"
              >
                <h4 className="text-xl font-bold text-foreground">{value.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

