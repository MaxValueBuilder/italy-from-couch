"use client"

import { useAuth } from "@/lib/auth/context"
import { HeroSection } from "@/components/sections/hero-section"
import { HowItWorksSection } from "@/components/sections/how-it-works-section"
import { CitiesSection } from "@/components/sections/cities-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { FAQSection } from "@/components/sections/faq-section"
import { AboutSection } from "@/components/sections/about-section"
import { BlogSection } from "@/components/sections/blog-section"
import { ContactSection } from "@/components/sections/contact-section"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Loader2 } from "lucide-react"

export default function Home() {
  const { loading } = useAuth()

  // Show loading while checking auth
  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </>
    )
  }

  // Landing page - accessible to everyone (authenticated and unauthenticated)
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <CitiesSection />
        <TestimonialsSection />
        <FAQSection />
        <AboutSection />
        <BlogSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
