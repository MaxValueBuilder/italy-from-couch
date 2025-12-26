import { Tour } from "@/lib/data/tours"

// Fetch all tours from API
export async function fetchTours(): Promise<Tour[]> {
  try {
    const response = await fetch("/api/tours", {
      cache: "no-store", // Always fetch fresh data
    })

    if (!response.ok) {
      throw new Error("Failed to fetch tours")
    }

    const data = await response.json()
    return data.tours || []
  } catch (error) {
    console.error("Error fetching tours:", error)
    // Return empty array on error
    return []
  }
}

// Fetch a single tour by ID from API
export async function fetchTourById(id: string): Promise<Tour | null> {
  try {
    const response = await fetch(`/api/tours/${id}`, {
      cache: "no-store", // Always fetch fresh data
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error("Failed to fetch tour")
    }

    const data = await response.json()
    return data.tour || null
  } catch (error) {
    console.error("Error fetching tour:", error)
    return null
  }
}

// Create a new tour
export async function createTour(tourData: {
  title: string
  city: "Rome" | "Florence" | "Venice"
  duration: number
  guide: string
  highlights?: string[]
  images?: string[]
  description?: string
  itinerary?: string
  startingPoint?: string
  bookingDates?: string[]
  details?: {
    duration?: string
    language?: string
    groupSize?: string
    included?: string[]
  }
  // New slot configuration fields
  recurrenceType?: "weekly" | "none"
  recurrencePattern?: {
    daysOfWeek: number[]
    timeSlots: Array<{ startTime: string; endTime: string }>
    timezone?: string
  }
  oneTimeSlots?: Array<{
    date: string
    timeSlots: Array<{ startTime: string; endTime: string }>
  }>
  maxParticipants?: number
  timezone?: string
}): Promise<{ success: boolean; _id?: string; error?: string }> {
  try {
    const response = await fetch("/api/tours", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tourData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create tour")
    }

    return await response.json()
  } catch (error: any) {
    console.error("Error creating tour:", error)
    return { success: false, error: error.message }
  }
}

