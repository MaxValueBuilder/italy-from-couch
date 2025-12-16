import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb/connection"

/**
 * GET /api/bookings/guide/[guideId]
 * Fetch bookings for a specific guide
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guideId: string }> }
) {
  try {
    const { guideId } = await params

    if (!guideId) {
      return NextResponse.json({ error: "guideId is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const bookings = db.collection("bookings")

    // Find all bookings for this guide
    const guideBookings = await bookings
      .find({ guideId })
      .sort({ scheduledAt: 1 }) // Sort by scheduled time
      .toArray()

    // Format bookings
    const formattedBookings = guideBookings.map((booking) => ({
      _id: booking._id.toString(),
      userId: booking.userId,
      tourId: booking.tourId,
      guideId: booking.guideId,
      scheduledAt: booking.scheduledAt ? new Date(booking.scheduledAt).toISOString() : null,
      timezone: booking.timezone,
      duration: booking.duration,
      status: booking.status,
      streamRoomId: booking.streamRoomId || null,
      streamToken: booking.streamToken || null,
      createdAt: booking.createdAt ? new Date(booking.createdAt).toISOString() : null,
      updatedAt: booking.updatedAt ? new Date(booking.updatedAt).toISOString() : null,
      cancelledAt: booking.cancelledAt ? new Date(booking.cancelledAt).toISOString() : null,
      cancellationReason: booking.cancellationReason || null,
    }))

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
    })
  } catch (error: any) {
    console.error("Error fetching guide bookings:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch guide bookings",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

