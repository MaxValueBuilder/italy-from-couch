"use client"

import { useI18n } from "@/lib/i18n/context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQPage() {
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
    {
      category: t("faq.categoryTechnical"),
      questions: [
        {
          q: t("faq.q11"),
          a: t("faq.a11"),
        },
        {
          q: t("faq.q12"),
          a: t("faq.a12"),
        },
        {
          q: t("faq.q13"),
          a: t("faq.a13"),
        },
      ],
    },
    {
      category: t("faq.categoryAboutService"),
      questions: [
        {
          q: t("faq.q14"),
          a: t("faq.a14"),
        },
        {
          q: t("faq.q15"),
          a: t("faq.a15"),
        },
        {
          q: t("faq.q16"),
          a: t("faq.a16"),
        },
      ],
    },
  ]

  return (
    <>
      <Header />
      <main className="bg-background">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 bg-card border-b border-border">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">{t("faq.heroTitle")}</h1>
            <p className="text-lg text-muted-foreground">{t("faq.heroSubtitle")}</p>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-3xl mx-auto space-y-12">
            {faqSections.map((section, idx) => (
              <div key={idx} className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">{section.category}</h2>

                <Accordion type="single" collapsible className="w-full">
                  {section.questions.map((item, qIdx) => (
                    <AccordionItem key={qIdx} value={`${idx}-${qIdx}`} className="border-border">
                      <AccordionTrigger className="hover:text-orange-600 transition-colors">{item.q}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">{item.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
