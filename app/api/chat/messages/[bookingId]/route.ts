import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb/connection"
import { ChatMessage } from "@/types/chat"

/**
 * GET /api/chat/messages/[bookingId]
 * Get message history for a booking
 * 
 * Query params:
 * - limit: number (default: 100)
 * - before: ISO date string (optional, for pagination)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "100", 10)
    const before = searchParams.get("before")

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 })
    }

    // Verify booking exists
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

    // Get message history
    const chatMessages = db.collection("chatMessages")
    const query: any = { bookingId }

    if (before) {
      query.timestamp = { $lt: new Date(before) }
    }

    const messages = await chatMessages
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray()

    // Convert to ChatMessage format and reverse to show oldest first
    const formattedMessages: ChatMessage[] = messages
      .reverse()
      .map((msg: any) => ({
        _id: msg._id.toString(),
        bookingId: msg.bookingId,
        userId: msg.userId,
        userName: msg.userName,
        message: msg.message,
        type: msg.type || "message",
        timestamp: msg.timestamp,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
      }))

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
      count: formattedMessages.length,
    })
  } catch (error: any) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch messages",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

