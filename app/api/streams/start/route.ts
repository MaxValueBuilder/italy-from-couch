import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb/connection"
import { generateChannelName } from "@/lib/agora/config"
import { generateRtcToken, TokenRole } from "@/lib/agora/token-server"

/**
 * POST /api/streams/start
 * Start a stream session for a booking
 * 
 * Body:
 * {
 *   bookingId: string
 *   guideId: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, guideId } = body

    if (!bookingId || !guideId) {
      return NextResponse.json(
        { error: "bookingId and guideId are required" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const bookings = db.collection("bookings")
    const streamSessions = db.collection("streamSessions")

    // Find the booking
    const { ObjectId } = await import("mongodb")
    let booking
    try {
      booking = await bookings.findOne({ _id: new ObjectId(bookingId) })
    } catch (error) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 })
    }

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Verify guide authorization
    // guideId parameter is Firebase UID, but booking.guideId is guide's _id from guides collection
    // Need to check if user's guideId matches booking's guideId
    const users = db.collection("users")
    const user = await users.findOne({ uid: guideId })
    
    if (!user || user.role !== "guide") {
      return NextResponse.json(
        { error: "Unauthorized: User is not a guide" },
        { status: 403 }
      )
    }

    // Check if user's guideId matches booking's guideId
    if (user.guideId !== booking.guideId) {
      return NextResponse.json(
        { error: "Unauthorized: You are not authorized to start this stream" },
        { status: 403 }
      )
    }

    // Generate channel name and token
    const channelName = generateChannelName(bookingId)
    const token = generateRtcToken(
      channelName,
      0, // Guide uses UID 0
      "publisher",
      86400 // 24 hours
    )

    // Create or update stream session
    const sessionData = {
      bookingId,
      channelName,
      guideId: booking.guideId,
      tourId: booking.tourId,
      startedAt: new Date(),
      status: "active",
      participantCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await streamSessions.updateOne(
      { bookingId },
      { $set: sessionData },
      { upsert: true }
    )

    // Update booking with stream info
    await bookings.updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $set: {
          streamRoomId: channelName,
          streamToken: token,
          status: "live",
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json({
      success: true,
      channelName,
      token,
      appId: process.env.AGORA_APP_ID,
    })
  } catch (error: any) {
    console.error("Error starting stream:", error)
    return NextResponse.json(
      {
        error: "Failed to start stream",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

