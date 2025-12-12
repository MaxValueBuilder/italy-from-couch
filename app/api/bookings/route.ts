import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb/connection"
import { Booking, BookingStatus } from "@/lib/data/bookings"
import { getCityTimezone } from "@/lib/utils/timezone"

// GET - Fetch bookings for a user or tour
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const tourId = searchParams.get("tourId")
    const guideId = searchParams.get("guideId")
    const status = searchParams.get("status") as BookingStatus | null

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const bookings = db.collection("bookings")

    const query: any = {}
    if (userId) query.userId = userId
    if (tourId) query.tourId = tourId
    if (guideId) query.guideId = guideId
    if (status) query.status = status

    const bookingsList = await bookings.find(query).sort({ scheduledAt: 1 }).toArray()

    const formattedBookings = bookingsList.map((booking) => ({
      ...booking,
      _id: booking._id.toString(),
      scheduledAt: booking.scheduledAt ? new Date(booking.scheduledAt).toISOString() : undefined,
      createdAt: booking.createdAt ? new Date(booking.createdAt).toISOString() : undefined,
      updatedAt: booking.updatedAt ? new Date(booking.updatedAt).toISOString() : undefined,
      cancelledAt: booking.cancelledAt ? new Date(booking.cancelledAt).toISOString() : undefined,
    }))

    return NextResponse.json({ success: true, bookings: formattedBookings })
  } catch (error: any) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, tourId, guideId, scheduledAt, timezone, duration } = body

    // Validation
    if (!userId || !tourId || !guideId || !scheduledAt || !timezone || !duration) {
      return NextResponse.json(
        { error: "Missing required fields (userId, tourId, guideId, scheduledAt, timezone, duration)" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const bookings = db.collection("bookings")
    const tours = db.collection("tours")

    // Check if tour exists
    const { ObjectId } = await import("mongodb")
    let tour
    try {
      tour = await tours.findOne({ _id: new ObjectId(tourId) })
    } catch (error) {
      return NextResponse.json({ error: "Invalid tour ID" }, { status: 400 })
    }
    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    // Check for existing booking at the same time
    const scheduledDate = new Date(scheduledAt)
    const existingBooking = await bookings.findOne({
      tourId,
      scheduledAt: scheduledDate,
      status: { $in: ["pending", "confirmed", "live"] },
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 409 }
      )
    }

    // Create booking
    const bookingData = {
      userId,
      tourId,
      guideId,
      scheduledAt: scheduledDate,
      timezone: timezone || getCityTimezone(tour.city),
      duration: duration || tour.duration || 90,
      status: "confirmed" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await bookings.insertOne(bookingData)

    return NextResponse.json({
      success: true,
      booking: {
        ...bookingData,
        _id: result.insertedId.toString(),
        scheduledAt: bookingData.scheduledAt.toISOString(),
        createdAt: bookingData.createdAt.toISOString(),
        updatedAt: bookingData.updatedAt.toISOString(),
      },
    })
  } catch (error: any) {
    console.error("Error creating booking:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

