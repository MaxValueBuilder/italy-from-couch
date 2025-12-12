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
      schedule,
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
    } = body

    if (!title || !city) {
      return NextResponse.json({ error: "Missing required fields (title, city)" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const tours = db.collection("tours")

    const tourData = {
      title,
      city,
      duration: duration || 0,
      guide: guide || "",
      schedule: schedule || "",
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

