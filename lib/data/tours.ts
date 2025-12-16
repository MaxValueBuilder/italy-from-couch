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
  streamType?: "youtube" | "twitch" | "agora" | "custom" // Type of streaming service
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
