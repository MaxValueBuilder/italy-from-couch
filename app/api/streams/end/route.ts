import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb/connection"

/**
 * POST /api/streams/end
 * End a stream session for a booking
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

    const { ObjectId } = await import("mongodb")

    // Find the booking
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
        { error: "Unauthorized: You are not authorized to end this stream" },
        { status: 403 }
      )
    }

    // Update stream session
    await streamSessions.updateOne(
      { bookingId },
      {
        $set: {
          status: "ended",
          endedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    )

    // Update booking status
    await bookings.updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $set: {
          status: "completed",
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json({
      success: true,
      message: "Stream ended successfully",
    })
  } catch (error: any) {
    console.error("Error ending stream:", error)
    return NextResponse.json(
      {
        error: "Failed to end stream",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

