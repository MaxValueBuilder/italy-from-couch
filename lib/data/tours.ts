export interface TimeSlot {
  startTime: string // "HH:mm" format (e.g., "10:00")
  endTime: string // "HH:mm" format (e.g., "12:00")
}

export interface WeeklyRecurrencePattern {
  daysOfWeek: number[] // 0=Sunday, 1=Monday, ..., 6=Saturday
  timeSlots: TimeSlot[]
  timezone: string
}

export interface OneTimeSlot {
  date: string // ISO date "YYYY-MM-DD"
  timeSlots: TimeSlot[]
}

export interface Tour {
  _id: string
  title: string
  city: "Rome" | "Florence" | "Venice"
  duration: number
  guide: string
  highlights: string[]
  images: string[] // Array of image URLs for gallery
  // Streaming fields
  streamUrl?: string // YouTube Live URL or other streaming service URL
  isLive?: boolean // Whether the tour is currently streaming
  streamType?: "youtube" | "twitch" | "agora" | "custom" // Type of streaming service
  description?: string // Tour description
  // Additional fields from Civitatis
  itinerary?: string // Detailed itinerary description
  startingPoint?: string // Starting point location
  bookingDates?: string[] // Available dates for booking (ISO date strings) - DEPRECATED: use recurrencePattern/oneTimeSlots
  details?: {
    duration?: string // Duration in text format (e.g., "2-2.5 hours")
    language?: string // Tour language
    groupSize?: string // Maximum group size
    included?: string[] // What's included in the tour
  }
  // Tour slots configuration
  recurrenceType?: "weekly" | "none" // How the tour repeats
  recurrencePattern?: WeeklyRecurrencePattern // For weekly recurring tours
  oneTimeSlots?: OneTimeSlot[] // For non-recurring tours with specific dates
  maxParticipants?: number // Default max participants per slot
  timezone?: string // Tour timezone (e.g., "Europe/Rome")
  createdAt?: Date
  updatedAt?: Date
}
