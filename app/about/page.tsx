"use client"

import { useI18n } from "@/lib/i18n/context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function AboutPage() {
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

  const founders = [
    {
      name: "Marco Rossi",
      role: "Co-founder & Guide Lead",
      bio: "Born in Rome, Marco spent 15 years leading in-person tours before launching Italy From Couch.",
      image: "/marco-rossi-founder-italy-coach.jpg",
    },
    {
      name: "Sofia Bianchi",
      role: "Co-founder & Content Director",
      bio: "Florence native with a passion for art history and making culture accessible to everyone.",
      image: "/sofia-bianchi-founder-italy.jpg",
    },
  ]

  return (
    <>
      <Header />
      <main className="bg-background">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 bg-card border-b border-border">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">{t("about.heroTitle")}</h1>
            <p className="text-lg text-muted-foreground">{t("about.heroSubtitle")}</p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">{t("about.storyTitle")}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">{t("about.storyText")}</p>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 md:py-24 px-4 bg-card border-y border-border">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">{t("about.missionTitle")}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">{t("about.missionText")}</p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold text-foreground">{t("about.valuesTitle")}</h2>
              <p className="text-lg text-muted-foreground">{t("about.valuesSubtitle")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, idx) => (
                <div
                  key={idx}
                  className="space-y-4 p-6 rounded-lg bg-card border border-border hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-bold text-foreground">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 md:py-24 px-4 bg-card border-t border-border">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold text-foreground">{t("about.teamTitle")}</h2>
              <p className="text-lg text-muted-foreground">{t("about.teamSubtitle")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {founders.map((founder, idx) => (
                <div key={idx} className="space-y-4 text-center">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-border">
                    <img
                      src={founder.image || "/placeholder.svg"}
                      alt={founder.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{founder.name}</h3>
                    <p className="text-orange-600 font-semibold">{founder.role}</p>
                    <p className="text-muted-foreground mt-2 leading-relaxed">{founder.bio}</p>
                  </div>
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
