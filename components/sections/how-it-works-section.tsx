"use client"

import { useI18n } from "@/lib/i18n/context"

export function HowItWorksSection() {
  const { t } = useI18n()

  const steps = [
    {
      number: 1,
      title: t("howItWorks.step1Title"),
      description: t("howItWorks.step1Desc"),
    },
    {
      number: 2,
      title: t("howItWorks.step2Title"),
      description: t("howItWorks.step2Desc"),
    },
    {
      number: 3,
      title: t("howItWorks.step3Title"),
      description: t("howItWorks.step3Desc"),
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-background px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section header */}
        <div className="text-center space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {t("howItWorks.label")}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t("howItWorks.title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("howItWorks.subtitle")}</p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="relative space-y-4">
              {/* Step number */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed ml-16">{step.description}</p>

            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
