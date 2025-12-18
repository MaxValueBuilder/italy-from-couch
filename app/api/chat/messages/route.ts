import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb/connection"
import { ChatMessage } from "@/types/chat"

/**
 * POST /api/chat/messages
 * Send a chat message
 * 
 * Body:
 * {
 *   bookingId: string
 *   userId: string
 *   userName: string
 *   message: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, userId, userName, message } = body

    // Validation
    if (!bookingId || !userId || !userName || !message) {
      return NextResponse.json(
        { error: "Missing required fields: bookingId, userId, userName, message" },
        { status: 400 }
      )
    }

    if (message.trim().length === 0) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 })
    }

    if (message.length > 500) {
      return NextResponse.json({ error: "Message too long (max 500 characters)" }, { status: 400 })
    }

    // Verify booking exists and user has access
    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const bookings = db.collection("bookings")
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

    // Check if user has access to this booking (either they booked it or they're the guide)
    const users = db.collection("users")
    const user = await users.findOne({ uid: userId })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const hasAccess =
      booking.userId === userId ||
      (user.guideId && user.guideId === booking.guideId) ||
      booking.status === "live" // If stream is live, allow any authenticated user to chat

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized: You don't have access to this booking" },
        { status: 403 }
      )
    }

    // Create message document
    const chatMessages = db.collection("chatMessages")
    const messageDoc: ChatMessage = {
      bookingId,
      userId,
      userName,
      message: message.trim(),
      type: "message",
      timestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await chatMessages.insertOne(messageDoc as any)

    // Return the created message
    const createdMessage = {
      ...messageDoc,
      _id: result.insertedId.toString(),
    }

    return NextResponse.json({ success: true, message: createdMessage }, { status: 201 })
  } catch (error: any) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      {
        error: "Failed to send message",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

