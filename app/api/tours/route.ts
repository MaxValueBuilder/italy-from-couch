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

// POST - Create or update a tour
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
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

    if (!id || !title || !city) {
      return NextResponse.json({ error: "Missing required fields (id, title, city)" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const tours = db.collection("tours")

    const tourData = {
      id,
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
      updatedAt: new Date(),
    }

    const result = await tours.updateOne(
      { id },
      {
        $set: tourData,
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    )

    return NextResponse.json({
      success: true,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
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

