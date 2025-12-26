import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb/connection"

// GET - Fetch all tours
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const tours = db.collection("tours")

    const toursList = await tours.find({}).toArray()

    // Convert MongoDB dates to ISO strings for JSON serialization
    const formattedTours = toursList.map((tour) => ({
      ...tour,
      _id: tour._id.toString(),
      createdAt: tour.createdAt ? new Date(tour.createdAt).toISOString() : undefined,
      updatedAt: tour.updatedAt ? new Date(tour.updatedAt).toISOString() : undefined,
    }))

    return NextResponse.json({ success: true, tours: formattedTours })
  } catch (error: any) {
    console.error("Error fetching tours from MongoDB:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

// POST - Create a tour
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      city,
      duration,
      guide,
      highlights,
      images,
      streamUrl,
      isLive,
      streamType,
      description,
      itinerary,
      meetingPoint,
      bookingDates,
      details,
      // New slot configuration fields
      recurrenceType,
      recurrencePattern,
      oneTimeSlots,
      maxParticipants,
      timezone,
    } = body

    if (!title || !city) {
      return NextResponse.json({ error: "Missing required fields (title, city)" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const tours = db.collection("tours")

    // Get default timezone for city if not provided
    const { getCityTimezone } = await import("@/lib/utils/timezone")
    const tourTimezone = timezone || getCityTimezone(city)

    const tourData: any = {
      title,
      city,
      duration: duration || 0,
      guide: guide || "",
      highlights: highlights || [],
      images: images || [],
      streamUrl: streamUrl || null,
      isLive: isLive || false,
      streamType: streamType || null,
      description: description || null,
      itinerary: itinerary || null,
      meetingPoint: meetingPoint || null,
      bookingDates: bookingDates || [],
      details: details || null,
      // New slot configuration
      recurrenceType: recurrenceType || "none",
      recurrencePattern: recurrencePattern || null,
      oneTimeSlots: oneTimeSlots || null,
      maxParticipants: maxParticipants || 50,
      timezone: tourTimezone,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await tours.insertOne(tourData)

    return NextResponse.json({
      success: true,
      _id: result.insertedId.toString(),
    })
  } catch (error: any) {
    console.error("Error saving tour to MongoDB:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

