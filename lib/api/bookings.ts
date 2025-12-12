import { Booking } from "@/lib/data/bookings"

// Fetch bookings for a user
export async function fetchUserBookings(userId: string): Promise<Booking[]> {
  try {
    const response = await fetch(`/api/bookings?userId=${userId}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch bookings")
    }

    const data = await response.json()
    return data.bookings || []
  } catch (error) {
    console.error("Error fetching user bookings:", error)
    return []
  }
}

// Fetch a single booking by ID
export async function fetchBookingById(bookingId: string): Promise<Booking | null> {
  try {
    const response = await fetch(`/api/bookings/${bookingId}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error("Failed to fetch booking")
    }

    const data = await response.json()
    return data.booking || null
  } catch (error) {
    console.error("Error fetching booking:", error)
    return null
  }
}

// Create a new booking
export async function createBooking(bookingData: {
  userId: string
  tourId: string
  guideId: string
  scheduledAt: string
  timezone: string
  duration: number
}): Promise<Booking | null> {
  try {
    const response = await fetch(`/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create booking")
    }

    const data = await response.json()
    return data.booking || null
  } catch (error) {
    console.error("Error creating booking:", error)
    throw error
  }
}

// Cancel a booking
export async function cancelBooking(
  bookingId: string,
  cancellationReason?: string
): Promise<Booking | null> {
  try {
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "cancelled",
        cancellationReason,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to cancel booking")
    }

    const data = await response.json()
    return data.booking || null
  } catch (error) {
    console.error("Error cancelling booking:", error)
    throw error
  }
}

// Reschedule a booking
export async function rescheduleBooking(
  bookingId: string,
  newScheduledAt: string
): Promise<Booking | null> {
  try {
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scheduledAt: newScheduledAt,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to reschedule booking")
    }

    const data = await response.json()
    return data.booking || null
  } catch (error) {
    console.error("Error rescheduling booking:", error)
    throw error
  }
}

