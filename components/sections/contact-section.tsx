"use client"

import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function ContactSection() {
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
    <section id="contact" className="py-16 md:py-24 bg-card border-t border-border px-4 scroll-mt-16">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section header */}
        <div className="text-center space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Contact</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t("contact.heroTitle")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("contact.heroSubtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground">{t("contact.formTitle")}</h3>
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
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-background border border-border rounded-lg p-8 space-y-6">
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
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

