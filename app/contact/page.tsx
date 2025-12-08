"use client"

import type React from "react"

import { useI18n } from "@/lib/i18n/context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function ContactPage() {
  const { t } = useI18n()
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formElement = e.currentTarget as HTMLFormElement
    const formData = new FormData(formElement)

    fetch("https://formspree.io/f/mrbnkene", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    }).then(() => {
      setSubmitted(true)
      formElement.reset()
      setTimeout(() => setSubmitted(false), 3000)
    })
  }

  return (
    <>
      <Header />
      <main className="bg-background">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 bg-card border-b border-border">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">{t("contact.heroTitle")}</h1>
            <p className="text-lg text-muted-foreground">{t("contact.heroSubtitle")}</p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Form */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">{t("contact.formTitle")}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">{t("contact.nameLabel")}</label>
                    <Input
                      type="text"
                      name="name"
                      placeholder={t("contact.namePlaceholder")}
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">{t("contact.emailLabel")}</label>
                    <Input
                      type="email"
                      name="email"
                      placeholder={t("contact.emailPlaceholder")}
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">{t("contact.subjectLabel")}</label>
                    <select
                      name="subject"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-600"
                    >
                      <option value="General Inquiry">{t("contact.subjectGeneral")}</option>
                      <option value="Tour Suggestion">{t("contact.subjectTourSuggestion")}</option>
                      <option value="Technical Support">{t("contact.subjectTechnical")}</option>
                      <option value="Partnership">{t("contact.subjectPartnership")}</option>
                      <option value="Media Inquiry">{t("contact.subjectMedia")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">{t("contact.messageLabel")}</label>
                    <textarea
                      name="message"
                      placeholder={t("contact.messagePlaceholder")}
                      rows={5}
                      required
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-600 resize-none"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                    {submitted ? t("contact.submitSuccess") : t("contact.submitButton")}
                  </Button>

                  <p className="text-xs text-muted-foreground">{t("contact.responseTime")}</p>
                </form>
              </div>

              {/* Contact Info */}
              <div className="space-y-8">
                <div className="bg-card border border-border rounded-lg p-8 space-y-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t("contact.emailTitle")}</h3>
                    <a
                      href="mailto:hello@italyfromcouch.com"
                      className="text-orange-600 hover:text-orange-700 transition-colors"
                    >
                      hello@italyfromcouch.com
                    </a>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t("contact.locationTitle")}</h3>
                    <p className="text-muted-foreground">{t("contact.locationText")}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-4">{t("contact.followTitle")}</h3>
                    <div className="flex gap-4">
                      <a
                        href="#"
                        className="w-10 h-10 rounded-lg bg-border hover:bg-orange-600 transition-colors flex items-center justify-center"
                      >
                        <span className="text-foreground hover:text-white">IG</span>
                      </a>
                      <a
                        href="#"
                        className="w-10 h-10 rounded-lg bg-border hover:bg-orange-600 transition-colors flex items-center justify-center"
                      >
                        <span className="text-foreground hover:text-white">FB</span>
                      </a>
                      <a
                        href="#"
                        className="w-10 h-10 rounded-lg bg-border hover:bg-orange-600 transition-colors flex items-center justify-center"
                      >
                        <span className="text-foreground hover:text-white">YT</span>
                      </a>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold text-foreground mb-2">{t("contact.responseTimeTitle")}</h3>
                    <p className="text-sm text-muted-foreground">{t("contact.responseTimeText")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
