import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb/connection"
import { TourSlot } from "@/lib/data/bookings"
import { Tour } from "@/lib/data/tours"
import { getCityTimezone, addDuration, isPastDate } from "@/lib/utils/timezone"
import { generateTourSlots } from "@/lib/utils/tour-slots"

// GET - Get available time slots for a tour
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const tours = db.collection("tours")
    const slots = db.collection("tourSlots")
    const bookings = db.collection("bookings")

    // Get tour details
    const { ObjectId } = await import("mongodb")
    let tour
    try {
      tour = await tours.findOne({ _id: new ObjectId(id) })
    } catch (error) {
      return NextResponse.json({ error: "Invalid tour ID" }, { status: 400 })
    }
    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    const timezone = tour.timezone || getCityTimezone(tour.city)
    const now = new Date()
    const queryStartDate = startDate ? new Date(startDate) : now
    const queryEndDate = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

    let availableSlots: any[] = []

    // Check if tour uses pattern-based slots (new approach)
    if (tour.recurrenceType && (tour.recurrencePattern || tour.oneTimeSlots)) {
      // Generate slots from pattern
      const tourData: Tour = {
        _id: tour._id.toString(),
        title: tour.title || "",
        city: tour.city as "Rome" | "Florence" | "Venice",
        duration: tour.duration || 0,
        guide: tour.guide || "",
        highlights: tour.highlights || [],
        images: tour.images || [],
        recurrenceType: tour.recurrenceType,
        recurrencePattern: tour.recurrencePattern,
        oneTimeSlots: tour.oneTimeSlots,
        maxParticipants: tour.maxParticipants,
        timezone: tour.timezone,
      }

      const generatedSlots = generateTourSlots(tourData, queryStartDate, queryEndDate)
      
      // Set guideId from tour if available (tour.guide is the guide name, we need guideId)
      // For now, we'll leave it empty as it will be resolved when booking is created
      // The booking system should handle guideId lookup

      // Get existing bookings to calculate bookedCount
      const bookingQuery = {
        tourId: id,
        status: { $in: ["pending", "confirmed", "live"] },
        scheduledAt: {
          $gte: queryStartDate,
          $lte: queryEndDate,
        },
      }

      const existingBookings = await bookings.find(bookingQuery).toArray()

      // Match generated slots with bookings to get bookedCount
      const slotsWithBookings = generatedSlots.map((slot) => {
        const matchingBookings = existingBookings.filter((booking) => {
          const bookingTime = new Date(booking.scheduledAt)
          const slotTime = new Date(slot.startTime)
          // Check if booking is for the same date and time (within 1 hour tolerance)
          return (
            bookingTime.toDateString() === slotTime.toDateString() &&
            Math.abs(bookingTime.getTime() - slotTime.getTime()) < 60 * 60 * 1000
          )
        })

        return {
          ...slot,
          bookedCount: matchingBookings.length,
          isAvailable: matchingBookings.length < slot.maxParticipants,
        }
      })

      // Filter out past slots and fully booked slots
      availableSlots = slotsWithBookings.filter((slot) => {
        const slotDate = new Date(slot.startTime)
        return !isPastDate(slotDate, timezone) && slot.isAvailable
      })
    } else {
      // Legacy approach: query existing slots from database
      const query: any = {
        tourId: id,
        isAvailable: true,
        startTime: {
          $gte: queryStartDate,
          $lte: queryEndDate,
        },
      }

      const slotsList = await slots.find(query).sort({ startTime: 1 }).toArray()

      // Filter out past slots
      availableSlots = slotsList.filter((slot) => {
        const slotDate = new Date(slot.startTime)
        return !isPastDate(slotDate, timezone) && slot.bookedCount < slot.maxParticipants
      })
    }

    const formattedSlots = availableSlots.map((slot) => ({
      ...slot,
      _id: slot._id || `generated-${slot.startTime}-${slot.tourId}`,
      startTime: slot.startTime ? new Date(slot.startTime).toISOString() : undefined,
      endTime: slot.endTime ? new Date(slot.endTime).toISOString() : undefined,
      createdAt: slot.createdAt ? new Date(slot.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: slot.updatedAt ? new Date(slot.updatedAt).toISOString() : new Date().toISOString(),
    }))

    return NextResponse.json({ success: true, slots: formattedSlots })
  } catch (error: any) {
    console.error("Error fetching tour slots:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

// POST - Create time slots for a tour (admin/guide function)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { startTime, endTime, maxParticipants, timezone } = body

    if (!startTime || !maxParticipants) {
      return NextResponse.json(
        { error: "Missing required fields (startTime, maxParticipants)" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const tours = db.collection("tours")
    const slots = db.collection("tourSlots")

    // Verify tour exists
    const { ObjectId } = await import("mongodb")
    let tour
    try {
      tour = await tours.findOne({ _id: new ObjectId(id) })
    } catch (error) {
      return NextResponse.json({ error: "Invalid tour ID" }, { status: 400 })
    }
    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    const tourTimezone = timezone || getCityTimezone(tour.city)
    const startDate = new Date(startTime)
    const endDate = endTime ? new Date(endTime) : addDuration(startDate, tour.duration || 90, tourTimezone)

    const slotData = {
      tourId: id,
      guideId: tour.guide || "",
      startTime: startDate,
      endTime: endDate,
      timezone: tourTimezone,
      maxParticipants: maxParticipants || 50,
      bookedCount: 0,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await slots.insertOne(slotData)

    return NextResponse.json({
      success: true,
      slot: {
        ...slotData,
        _id: result.insertedId.toString(),
        startTime: slotData.startTime.toISOString(),
        endTime: slotData.endTime.toISOString(),
        createdAt: slotData.createdAt.toISOString(),
        updatedAt: slotData.updatedAt.toISOString(),
      },
    })
  } catch (error: any) {
    console.error("Error creating tour slot:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

