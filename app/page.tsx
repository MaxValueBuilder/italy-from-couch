"use client"

import { HeroSection } from "@/components/sections/hero-section"
import { HowItWorksSection } from "@/components/sections/how-it-works-section"
import { CitiesSection } from "@/components/sections/cities-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <CitiesSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </>
  )
}
