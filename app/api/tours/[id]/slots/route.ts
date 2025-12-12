import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb/connection"
import { TourSlot } from "@/lib/data/bookings"
import { getCityTimezone, addDuration, isPastDate } from "@/lib/utils/timezone"

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

    const timezone = getCityTimezone(tour.city)
    const now = new Date()
    const queryStartDate = startDate ? new Date(startDate) : now
    const queryEndDate = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

    // Query available slots
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
    const availableSlots = slotsList.filter((slot) => {
      const slotDate = new Date(slot.startTime)
      return !isPastDate(slotDate, timezone) && slot.bookedCount < slot.maxParticipants
    })

    const formattedSlots = availableSlots.map((slot) => ({
      ...slot,
      _id: slot._id.toString(),
      startTime: slot.startTime ? new Date(slot.startTime).toISOString() : undefined,
      endTime: slot.endTime ? new Date(slot.endTime).toISOString() : undefined,
      createdAt: slot.createdAt ? new Date(slot.createdAt).toISOString() : undefined,
      updatedAt: slot.updatedAt ? new Date(slot.updatedAt).toISOString() : undefined,
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

