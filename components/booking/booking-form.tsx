"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BookingCalendar } from "./booking-calendar"
import { TourSlot } from "@/lib/data/bookings"
import { createBooking } from "@/lib/api/bookings"
import { fetchTourById } from "@/lib/api/tours"
import { Tour } from "@/lib/data/tours"
import { getCityTimezone } from "@/lib/utils/timezone"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth/context"

interface BookingFormProps {
  tourId: string
}

export function BookingForm({ tourId }: BookingFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [tour, setTour] = useState<Tour | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TourSlot | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Load tour data
  useEffect(() => {
    async function loadTour() {
      try {
        const tourData = await fetchTourById(tourId)
        setTour(tourData)
      } catch (error) {
        console.error("Error loading tour:", error)
        setError("Failed to load tour information")
      } finally {
        setLoading(false)
      }
    }
    loadTour()
  }, [tourId])

  const handleSlotSelect = (slot: TourSlot) => {
    setSelectedSlot(slot)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!user) {
      router.push("/login?redirect=/tours/" + tourId + "#booking")
      return
    }

    if (!selectedSlot || !tour) {
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
        scheduledAt: selectedSlot.startTime,
        timezone: selectedSlot.timezone || getCityTimezone(tour.city),
        duration: tour.duration || 90,
      })

      if (booking) {
        setSuccess(true)
        // Redirect to booking confirmation page after 2 seconds
        setTimeout(() => {
          router.push(`/bookings/${booking._id}`)
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || "Failed to create booking. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Tour not found</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="text-center py-12 space-y-4">
        <CheckCircle2 className="w-16 h-16 mx-auto text-green-600" />
        <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
        <p className="text-muted-foreground">Redirecting to your booking details...</p>
      </div>
    )
  }

  const tourTimezone = getCityTimezone(tour.city)

  return (
    <div className="space-y-6">
      {/* Tour Info */}
      <div className="p-6 bg-card border border-border rounded-lg">
        <h2 className="text-2xl font-bold mb-2">{tour.title}</h2>
        <p className="text-muted-foreground mb-4">{tour.description}</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="font-semibold">Duration:</span> {tour.duration} minutes
          </div>
          <div>
            <span className="font-semibold">Guide:</span> {tour.guide}
          </div>
          <div>
            <span className="font-semibold">City:</span> {tour.city}
          </div>
        </div>
      </div>

      {/* Calendar and Time Slots */}
      <div className="p-6 bg-card border border-border rounded-lg">
        <h3 className="text-xl font-bold mb-4">Select Date & Time</h3>
        <BookingCalendar
          tourId={tourId}
          tourTimezone={tourTimezone}
          onSlotSelect={handleSlotSelect}
          selectedSlot={selectedSlot}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!selectedSlot || submitting}
          className="px-8 py-6 text-lg"
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
    </div>
  )
}

