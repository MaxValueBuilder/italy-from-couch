export interface Tour {
  _id: string
  title: string
  city: "Rome" | "Florence" | "Venice"
  duration: number
  guide: string
  schedule: string
  highlights: string[]
  images: string[] // Array of image URLs for gallery
  // Streaming fields
  streamUrl?: string // YouTube Live URL or other streaming service URL
  isLive?: boolean // Whether the tour is currently streaming
  streamType?: "youtube" | "twitch" | "custom" // Type of streaming service
  description?: string // Tour description
  // Additional fields from Civitatis
  itinerary?: string // Detailed itinerary description
  meetingPoint?: string // Meeting point location
  bookingDates?: string[] // Available dates for booking (ISO date strings)
  details?: {
    duration?: string // Duration in text format (e.g., "2-2.5 hours")
    language?: string // Tour language
    groupSize?: string // Maximum group size
    included?: string[] // What's included in the tour
    notIncluded?: string[] // What's not included
  }
  createdAt?: Date
  updatedAt?: Date
}

export const tours: Tour[] = [
  {
    id: "rome-ancient",
    title: "Rome: Ancient Wonders Walk",
    city: "Rome",
    duration: 90,
    guide: "Marco",
    schedule: "Daily at 10:00 AM & 4:00 PM (CET)",
    highlights: ["Colosseum", "Roman Forum", "Palatine Hill"],
    images: ["/colosseum-rome-ancient-history.jpg"],
    streamUrl: "https://www.youtube.com/watch?v=Vp7j3J_C10s", // Will be added when streaming is set up
    isLive: true,
    streamType: "youtube",
    description:
      "Join us for a live walking tour through ancient Rome. Explore the Colosseum, Roman Forum, and Palatine Hill with a local guide. Experience the history and stories of the Eternal City in real-time from your couch.",
  },
  {
    id: "rome-food",
    title: "Rome: Trastevere Food & Culture",
    city: "Rome",
    duration: 90,
    guide: "Elena",
    schedule: "Daily at 12:00 PM (CET)",
    highlights: ["Local trattorias", "Artisan shops", "Neighborhood stories"],
    images: ["/rome-trastevere-food-culture.jpg"],
    streamUrl: "https://www.youtube.com/watch?v=Vp7j3J_C10s", // Will be added when streaming is set up
    isLive: true,
    streamType: "youtube",
    description:
      "Discover authentic Roman cuisine and culture in Trastevere, one of Rome's most charming neighborhoods. Follow our guide through local trattorias, artisan shops, and hidden gems while learning about Roman food traditions.",
  },
  {
    id: "rome-historic-center",
    title: "Rome: Historic Center & Hidden Gems",
    city: "Rome",
    duration: 75,
    guide: "Giovanni",
    schedule: "Daily at 2:00 PM (CET)",
    highlights: ["Pantheon", "Piazza Navona", "Hidden courtyards"],
    images: ["/colosseum-rome-ancient-history.jpg"],
    streamUrl: "https://www.youtube.com/watch?v=Vp7j3J_C10s", // Will be added when streaming is set up
    isLive: true,
    streamType: "youtube",
    description:
      "Explore Rome's historic center with a local guide. Visit the Pantheon, Piazza Navona, and discover hidden courtyards and secret spots that only locals know. Perfect for first-time visitors and those wanting to see beyond the tourist crowds.",
  },
  {
    id: "florence-art",
    title: "Florence: Renaissance Art & Architecture",
    city: "Florence",
    duration: 75,
    guide: "Sofia",
    schedule: "Daily at 11:00 AM & 3:00 PM (CET)",
    highlights: ["Duomo", "Ponte Vecchio", "Uffizi Gallery exterior"],
    images: ["/florence-duomo-renaissance-art.jpg"],
  },
  {
    id: "venice-canals",
    title: "Venice: Hidden Canals & Local Secrets",
    city: "Venice",
    duration: 60,
    guide: "Alessandro",
    schedule: "Daily at 9:00 AM & 5:00 PM (CET)",
    highlights: ["Secret canals", "Local neighborhoods", "Authentic bacari"],
    images: ["/venice-canals-hidden-secrets.jpg"],
  },
  {
    id: "florence-sunset",
    title: "Florence: Sunset Over the Arno",
    city: "Florence",
    duration: 60,
    guide: "Luca",
    schedule: "Daily at 6:00 PM (CET)",
    highlights: ["Golden hour views", "Oltrarno district", "Local life"],
    images: ["/florence-sunset-arno-golden-hour.jpg"],
  },
  {
    id: "venice-markets",
    title: "Venice: Morning Markets & Local Life",
    city: "Venice",
    duration: 75,
    guide: "Giulia",
    schedule: "Daily at 8:00 AM (CET)",
    highlights: ["Rialto Market", "Morning routines", "Authentic Venice"],
    images: ["/venice-rialto-market-morning.jpg"],
  },
]
