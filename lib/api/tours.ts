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

