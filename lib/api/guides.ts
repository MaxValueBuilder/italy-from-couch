import { Guide } from "@/lib/data/guides"

// Fetch all guides
export async function fetchGuides(city?: string): Promise<Guide[]> {
  try {
    let url = "/api/guides"
    if (city) {
      url += `?city=${encodeURIComponent(city)}`
    }

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

// Fetch a single guide by ID
export async function fetchGuideById(guideId: string): Promise<Guide | null> {
  try {
    const response = await fetch(`/api/guides/${guideId}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error("Failed to fetch guide")
    }

    const data = await response.json()
    return data.guide || null
  } catch (error) {
    console.error("Error fetching guide:", error)
    return null
  }
}

// Create or update a guide
export async function saveGuide(guideData: Guide): Promise<boolean> {
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
      throw new Error(error.error || "Failed to save guide")
    }

    return true
  } catch (error) {
    console.error("Error saving guide:", error)
    throw error
  }
}

