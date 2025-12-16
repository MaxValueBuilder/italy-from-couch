import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb/connection"

/**
 * GET /api/streams/tour/[tourId]
 * Get active stream information for a tour
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tourId: string }> }
) {
  try {
    const { tourId } = await params
    const { ObjectId } = await import("mongodb")

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const bookings = db.collection("bookings")
    const streamSessions = db.collection("streamSessions")

    // Find active booking for this tour (status = "live")
    const activeBooking = await bookings.findOne({
      tourId,
      status: "live",
    })

    if (!activeBooking) {
      return NextResponse.json({
        success: true,
        isActive: false,
        message: "No active stream for this tour",
      })
    }

    // Find stream session for this booking
    const bookingIdStr = activeBooking._id.toString()
    const session = await streamSessions.findOne({
      bookingId: bookingIdStr,
      status: "active",
    })

    if (!session) {
      return NextResponse.json({
        success: true,
        isActive: false,
        message: "Stream session not found",
      })
    }

    return NextResponse.json({
      success: true,
      isActive: true,
      bookingId: activeBooking._id.toString(),
      channelName: session.channelName,
      guideId: session.guideId,
      tourId: session.tourId,
      startedAt: session.startedAt ? new Date(session.startedAt).toISOString() : null,
      participantCount: session.participantCount || 0,
      appId: process.env.AGORA_APP_ID,
    })
  } catch (error: any) {
    console.error("Error fetching tour stream info:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch stream info",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

