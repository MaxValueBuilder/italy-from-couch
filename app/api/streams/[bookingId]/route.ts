import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb/connection"
import { generateChannelName } from "@/lib/agora/config"
import { generateRtcToken, TokenRole } from "@/lib/agora/token-server"

/**
 * GET /api/streams/[bookingId]
 * Get stream information for a booking
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params
    const { ObjectId } = await import("mongodb")

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const bookings = db.collection("bookings")
    const streamSessions = db.collection("streamSessions")

    // Find booking
    let booking
    try {
      booking = await bookings.findOne({ _id: new ObjectId(bookingId) })
    } catch (error) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 })
    }

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Find stream session
    const session = await streamSessions.findOne({ bookingId })

    if (!session || session.status !== "active") {
      return NextResponse.json({
        success: true,
        isActive: false,
        message: "Stream is not active",
      })
    }

    // Format response
    const response = {
      success: true,
      isActive: true,
      channelName: session.channelName || generateChannelName(bookingId),
      guideId: session.guideId,
      tourId: session.tourId,
      startedAt: session.startedAt ? new Date(session.startedAt).toISOString() : null,
      participantCount: session.participantCount || 0,
      appId: process.env.AGORA_APP_ID,
      fallbackUrl: booking.fallbackUrl || null, // Add fallback URL if available
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("Error fetching stream info:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch stream info",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/streams/[bookingId]
 * Get stream token for a booking (for viewers)
 * 
 * Body:
 * {
 *   role?: "publisher" | "subscriber" (default: "subscriber")
 *   userId?: string (optional user ID)
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params
    const body = await request.json().catch(() => ({}))
    const role = (body.role || "subscriber") as TokenRole
    const userId = body.userId || undefined

    const { ObjectId } = await import("mongodb")

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const bookings = db.collection("bookings")

    // Find booking
    let booking
    try {
      booking = await bookings.findOne({ _id: new ObjectId(bookingId) })
    } catch (error) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 })
    }

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Check if stream is active
    if (booking.status !== "live") {
      return NextResponse.json(
        { error: "Stream is not active" },
        { status: 400 }
      )
    }

    // Generate channel name and token
    const channelName = booking.streamRoomId || generateChannelName(bookingId)
    const uid = userId ? parseInt(userId.slice(-8), 16) || 0 : 0
    const token = generateRtcToken(channelName, uid, role, 86400)

    // Get tour fallback video if it exists
    const tours = db.collection("tours")
    const tour = await tours.findOne({ _id: new ObjectId(booking.tourId) })

    return NextResponse.json({
      success: true,
      token,
      channelName,
      uid,
      appId: process.env.AGORA_APP_ID,
      fallbackUrl: tour?.fallbackUrl || booking.fallbackUrl || null,
    })
  } catch (error: any) {
    console.error("Error generating stream token:", error)
    return NextResponse.json(
      {
        error: "Failed to generate stream token",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

