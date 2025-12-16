import { Guide } from "@/lib/data/guides"

/**
 * Fetch all guides
 */
export async function fetchGuides(city?: string): Promise<Guide[]> {
  try {
    const url = city ? `/api/guides?city=${city}` : "/api/guides"
    const response = await fetch(url, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch guides")
    }

    const data = await response.json()
    return data.guides || []
  } catch (error) {
    console.error("Error fetching guides:", error)
    return []
  }
}

/**
 * Create a new guide profile
 */
export async function createGuideProfile(guideData: {
  userId: string
  name: string
  city: string
  specialties?: string[]
  languages?: string[]
  bio?: string
  image?: string
}): Promise<{ success: boolean; _id?: string; error?: string }> {
  try {
    const response = await fetch("/api/guides", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(guideData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create guide profile")
    }

    return await response.json()
  } catch (error: any) {
    console.error("Error creating guide profile:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Link a user account to a guide profile
 */
export async function linkGuideToUser(
  userId: string,
  guideId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/guides/link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, guideId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to link guide")
    }

    return await response.json()
  } catch (error: any) {
    console.error("Error linking guide:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Fetch bookings for a guide
 */
export async function fetchGuideBookings(guideId: string) {
  try {
    const response = await fetch(`/api/bookings/guide/${guideId}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch guide bookings")
    }

    const data = await response.json()
    return data.bookings || []
  } catch (error) {
    console.error("Error fetching guide bookings:", error)
    return []
  }
}
