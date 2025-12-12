import { TourSlot } from "@/lib/data/bookings"

// Fetch available slots for a tour
export async function fetchTourSlots(
  tourId: string,
  startDate?: string,
  endDate?: string
): Promise<TourSlot[]> {
  try {
    let url = `/api/tours/${tourId}/slots`
    const params = new URLSearchParams()
    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)
    if (params.toString()) url += `?${params.toString()}`

    const response = await fetch(url, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch tour slots")
    }

    const data = await response.json()
    return data.slots || []
  } catch (error) {
    console.error("Error fetching tour slots:", error)
    return []
  }
}

// Create a tour slot (admin/guide function)
export async function createTourSlot(slotData: {
  tourId: string
  startTime: string
  endTime?: string
  maxParticipants: number
  timezone?: string
}): Promise<TourSlot | null> {
  try {
    const response = await fetch(`/api/tours/${slotData.tourId}/slots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slotData),
    })

    if (!response.ok) {
      throw new Error("Failed to create tour slot")
    }

    const data = await response.json()
    return data.slot || null
  } catch (error) {
    console.error("Error creating tour slot:", error)
    throw error
  }
}

