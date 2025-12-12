import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb/connection"

// GET - Fetch a single tour by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { ObjectId } = await import("mongodb")

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const tours = db.collection("tours")

    let tour
    try {
      tour = await tours.findOne({ _id: new ObjectId(id) })
    } catch (error) {
      return NextResponse.json({ error: "Invalid tour ID" }, { status: 400 })
    }

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    // Convert MongoDB dates to ISO strings for JSON serialization
    const formattedTour = {
      ...tour,
      _id: tour._id.toString(),
      createdAt: tour.createdAt ? new Date(tour.createdAt).toISOString() : undefined,
      updatedAt: tour.updatedAt ? new Date(tour.updatedAt).toISOString() : undefined,
    }

    return NextResponse.json({ success: true, tour: formattedTour })
  } catch (error: any) {
    console.error("Error fetching tour from MongoDB:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

