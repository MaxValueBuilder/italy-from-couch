import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb/connection"
import { BookingStatus } from "@/lib/data/bookings"

// GET - Fetch a single booking by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { ObjectId } = await import("mongodb")

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const bookings = db.collection("bookings")

    let booking
    try {
      booking = await bookings.findOne({ _id: new ObjectId(id) })
    } catch (error) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 })
    }

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const formattedBooking = {
      ...booking,
      _id: booking._id.toString(),
      scheduledAt: booking.scheduledAt ? new Date(booking.scheduledAt).toISOString() : undefined,
      createdAt: booking.createdAt ? new Date(booking.createdAt).toISOString() : undefined,
      updatedAt: booking.updatedAt ? new Date(booking.updatedAt).toISOString() : undefined,
      cancelledAt: booking.cancelledAt ? new Date(booking.cancelledAt).toISOString() : undefined,
    }

    return NextResponse.json({ success: true, booking: formattedBooking })
  } catch (error: any) {
    console.error("Error fetching booking:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

// PATCH - Update booking (cancel, reschedule, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, scheduledAt, cancellationReason } = body

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const bookings = db.collection("bookings")

    const booking = await bookings.findOne({ id })
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (status) {
      updateData.status = status
      if (status === "cancelled") {
        updateData.cancelledAt = new Date()
        if (cancellationReason) {
          updateData.cancellationReason = cancellationReason
        }
      }
    }

    if (scheduledAt) {
      updateData.scheduledAt = new Date(scheduledAt)
    }

    const { ObjectId } = await import("mongodb")
    await bookings.updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    const updatedBooking = await bookings.findOne({ _id: new ObjectId(id) })

    return NextResponse.json({
      success: true,
      booking: {
        ...updatedBooking,
        _id: updatedBooking!._id.toString(),
        scheduledAt: updatedBooking!.scheduledAt
          ? new Date(updatedBooking!.scheduledAt).toISOString()
          : undefined,
        createdAt: updatedBooking!.createdAt
          ? new Date(updatedBooking!.createdAt).toISOString()
          : undefined,
        updatedAt: updatedBooking!.updatedAt
          ? new Date(updatedBooking!.updatedAt).toISOString()
          : undefined,
        cancelledAt: updatedBooking!.cancelledAt
          ? new Date(updatedBooking!.cancelledAt).toISOString()
          : undefined,
      },
    })
  } catch (error: any) {
    console.error("Error updating booking:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

