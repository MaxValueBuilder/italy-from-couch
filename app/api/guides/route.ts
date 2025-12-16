import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb/connection"

// GET - Fetch all guides
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city")

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const guides = db.collection("guides")

    const query: any = {}
    if (city) {
      query.city = city
    }

    const guidesList = await guides.find(query).sort({ name: 1 }).toArray()

    // Convert MongoDB _id to string for JSON serialization
    const formattedGuides = guidesList.map((guide) => ({
      ...guide,
      _id: guide._id.toString(),
    }))

    return NextResponse.json({ success: true, guides: formattedGuides })
  } catch (error: any) {
    console.error("Error fetching guides from MongoDB:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

// POST - Create a guide
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, city, specialties, languages, bio, tours, image } = body

    if (!name || !city) {
      return NextResponse.json(
        { error: "Missing required fields (name, city)" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const guides = db.collection("guides")
    const users = db.collection("users")

    // If userId is provided, check if user already has a guide profile
    if (userId) {
      const existingUser = await users.findOne({ uid: userId })
      if (existingUser?.guideId) {
        return NextResponse.json(
          { error: "User already has a guide profile linked" },
          { status: 400 }
        )
      }
    }

    const guideData = {
      name,
      city,
      specialties: specialties || [],
      languages: languages || [],
      bio: bio || "",
      tours: tours || [],
      image: image || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await guides.insertOne(guideData)
    const guideId = result.insertedId.toString()

    // If userId is provided, automatically link the guide profile to the user
    if (userId) {
      await users.updateOne(
        { uid: userId },
        { $set: { guideId: guideId, updatedAt: new Date() } }
      )
    }

    return NextResponse.json({
      success: true,
      _id: guideId,
    })
  } catch (error: any) {
    console.error("Error saving guide to MongoDB:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

