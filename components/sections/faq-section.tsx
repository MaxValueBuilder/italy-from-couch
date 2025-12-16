"use client"

import { useI18n } from "@/lib/i18n/context"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQSection() {
  const { t } = useI18n()

  const faqSections = [
    {
      category: t("faq.categoryGettingStarted"),
      questions: [
        {
          q: t("faq.q1"),
          a: t("faq.a1"),
        },
        {
          q: t("faq.q2"),
          a: t("faq.a2"),
        },
        {
          q: t("faq.q3"),
          a: t("faq.a3"),
        },
      ],
    },
    {
      category: t("faq.categoryToursBooking"),
      questions: [
        {
          q: t("faq.q4"),
          a: t("faq.a4"),
        },
        {
          q: t("faq.q5"),
          a: t("faq.a5"),
        },
        {
          q: t("faq.q6"),
          a: t("faq.a6"),
        },
        {
          q: t("faq.q7"),
          a: t("faq.a7"),
        },
      ],
    },
    {
      category: t("faq.categoryTippingPricing"),
      questions: [
        {
          q: t("faq.q8"),
          a: t("faq.a8"),
        },
        {
          q: t("faq.q9"),
          a: t("faq.a9"),
        },
        {
          q: t("faq.q10"),
          a: t("faq.a10"),
        },
      ],
    },
  ]

  return (
    <section id="faq" className="py-16 md:py-24 bg-background px-4 scroll-mt-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Section header */}
        <div className="text-center space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {t("faq.label")}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t("faq.heroTitle")}</h2>
          <p className="text-lg text-muted-foreground">{t("faq.heroSubtitle")}</p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {faqSections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">{section.category}</h3>
              <Accordion type="single" collapsible className="w-full">
                {section.questions.map((item, qIdx) => (
                  <AccordionItem key={qIdx} value={`${idx}-${qIdx}`} className="border-border">
                    <AccordionTrigger className="hover:text-orange-600 transition-colors text-left">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

