"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BookingCalendar } from "./booking-calendar"
import { TourSlot } from "@/lib/data/bookings"
import { createBooking } from "@/lib/api/bookings"
import { getCityTimezone } from "@/lib/utils/timezone"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth/context"
import { Tour } from "@/lib/data/tours"

interface BookingSectionProps {
  tour: Tour
}

export function BookingSection({ tour }: BookingSectionProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedSlot, setSelectedSlot] = useState<TourSlot | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSlotSelect = (slot: TourSlot | null) => {
    setSelectedSlot(slot)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!user) {
      router.push("/login?redirect=/tours/" + tour._id + "#booking")
      return
    }

    if (!selectedSlot) {
      setError("Please select a time slot")
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const booking = await createBooking({
        userId: user.uid,
        tourId: tour._id,
        guideId: tour.guide || "",
        scheduledAt: selectedSlot.startTime instanceof Date ? selectedSlot.startTime.toISOString() : selectedSlot.startTime,
        timezone: selectedSlot.timezone || getCityTimezone(tour.city),
        duration: tour.duration || 90,
      })

      if (booking) {
        setSuccess(true)
        // Redirect to bookings page after 2 seconds
        setTimeout(() => {
          router.push(`/bookings`)
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || "Failed to create booking. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="p-6 bg-card border border-border rounded-lg text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 mx-auto text-green-600" />
        <h3 className="text-xl font-bold">Booking Confirmed!</h3>
        <p className="text-muted-foreground">Redirecting to your booking details...</p>
      </div>
    )
  }

  const tourTimezone = getCityTimezone(tour.city)

  return (
    <div className="p-6 bg-card border border-border rounded-lg space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Book This Tour</h2>
        <p className="text-sm text-muted-foreground">
          Select your preferred date and time to join this live streaming tour
        </p>
      </div>

      {/* Calendar and Time Slots */}
      <BookingCalendar
        tourId={tour._id}
        tourTimezone={tourTimezone}
        onSlotSelect={handleSlotSelect}
        selectedSlot={selectedSlot}
      />

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!selectedSlot || submitting}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6"
        size="lg"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          "Confirm Booking"
        )}
      </Button>
    </div>
  )
}

