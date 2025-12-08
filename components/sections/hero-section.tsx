"use client"

import type React from "react"

import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function HeroSection() {
  const { t } = useI18n()
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Submit to Formspree
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
      setEmail("")
      setTimeout(() => setSubmitted(false), 3000)
    })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-12 md:py-20">
      {/* Background Image */}
      {/* 
        Image Sources for Italian Background Images:
        - Unsplash: https://unsplash.com/s/photos/italy-landscape (Free, high quality)
        - Pexels: https://www.pexels.com/search/italy/ (Free, high quality)
        - Pixabay: https://pixabay.com/images/search/italy/ (Free)
        
        Recommended search terms: "Italy landscape", "Italian countryside", "Tuscany", 
        "Italian architecture", "Rome skyline", "Florence", "Venice canals"
        
        Image should be placed in: /public/hero-italy-background.jpg
        Recommended size: 1920x1080px or larger, landscape orientation
      */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-italy-background.jpg"
          alt="Italian landscape"
          className="w-full h-full object-cover"
          style={{ objectPosition: "center" }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60" />
        {/* Additional gradient overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/50" />
      </div>

      {/* Pattern overlay (subtle) */}
      <div className="absolute inset-0 z-[1] opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, currentColor 0.5px, transparent 0.5px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
        {/* Main heading */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight drop-shadow-lg">
            {t("hero.title")}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
            {t("hero.subtitle")}
          </p>
        </div>

        {/* Key features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8">
          <div className="flex items-start gap-3 text-left md:text-center">
            <div className="w-6 h-6 rounded-full bg-orange-500 flex-shrink-0 mt-1 shadow-lg" />
            <p className="text-sm md:text-base text-white drop-shadow-md">{t("hero.feature1")}</p>
          </div>
          <div className="flex items-start gap-3 text-left md:text-center">
            <div className="w-6 h-6 rounded-full bg-orange-500 flex-shrink-0 mt-1 shadow-lg" />
            <p className="text-sm md:text-base text-white drop-shadow-md">{t("hero.feature2")}</p>
          </div>
          <div className="flex items-start gap-3 text-left md:text-center">
            <div className="w-6 h-6 rounded-full bg-orange-500 flex-shrink-0 mt-1 shadow-lg" />
            <p className="text-sm md:text-base text-white drop-shadow-md">{t("hero.feature3")}</p>
          </div>
        </div>

        {/* Email form
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              name="email"
              placeholder={t("hero.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white whitespace-nowrap">
              {submitted ? "✓ Submitted" : t("hero.submitButton")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{t("hero.spamNote")}</p>
        </form> */}
      </div>
    </section>
  )
}
