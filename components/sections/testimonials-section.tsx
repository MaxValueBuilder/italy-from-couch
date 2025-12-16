"use client"

import { useI18n } from "@/lib/i18n/context"

export function TestimonialsSection() {
  const { t } = useI18n()

  const testimonials = [
    {
      name: "Sarah M.",
      location: "New York",
      rating: 5,
      quote:
        "I've always dreamed of visiting Rome. This was the next best thing! Marco's tour was incredible—I felt like I was really there.",
      tour: "Rome: Ancient Wonders Walk",
    },
    {
      name: "James T.",
      location: "London",
      rating: 5,
      quote:
        "Sofia's art tour of Florence was mesmerizing. Her passion for the city is contagious. Already booked my next tour!",
      tour: "Florence: Renaissance Art & Architecture",
    },
    {
      name: "Maria G.",
      location: "Sydney",
      rating: 5,
      quote:
        "Alessandro showed us parts of Venice I never knew existed. The hidden canals tour was magical. Worth every tip!",
      tour: "Venice: Hidden Canals & Local Secrets",
    },
    {
      name: "David L.",
      location: "Toronto",
      rating: 5,
      quote:
        "Elena's food tour was amazing! She took us to places only locals know. I'm planning my actual trip to Rome now.",
      tour: "Rome: Trastevere Food & Culture",
    },
    {
      name: "Emma K.",
      location: "Berlin",
      rating: 5,
      quote:
        "Luca's sunset tour of Florence was breathtaking. The golden hour views were incredible. This is the future of travel!",
      tour: "Florence: Sunset Over the Arno",
    },
    {
      name: "Michael R.",
      location: "Los Angeles",
      rating: 5,
      quote:
        "Giulia's morning market tour was so authentic. I felt like I was experiencing real Venetian life. Can't wait for more cities!",
      tour: "Venice: Morning Markets & Local Life",
    },
  ]

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-background px-4 scroll-mt-16">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section header */}
        <div className="text-center space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {t("testimonials.label")}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t("testimonials.title")}</h2>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="bg-card rounded-lg p-6 border border-border space-y-4 hover:shadow-lg transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-lg text-orange-500">
                    ★
                  </span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground leading-relaxed italic">"{testimonial.quote}"</p>

              {/* Author */}
              <div className="border-t border-border pt-4">
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                <p className="text-xs text-muted-foreground mt-2">{testimonial.tour}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
