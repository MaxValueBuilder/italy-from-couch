import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb/connection"
import { ObjectId } from "mongodb"

/**
 * POST /api/guides/link
 * Link a user account to a guide profile
 * 
 * Body:
 * {
 *   userId: string (Firebase UID)
 *   guideId: string (Guide's _id from guides collection)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, guideId } = body

    if (!userId || !guideId) {
      return NextResponse.json(
        { error: "userId and guideId are required" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const users = db.collection("users")
    const guides = db.collection("guides")

    // Verify guide exists
    let guide
    try {
      guide = await guides.findOne({ _id: new ObjectId(guideId) })
    } catch (error) {
      return NextResponse.json({ error: "Invalid guide ID" }, { status: 400 })
    }

    if (!guide) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 })
    }

    // Verify user exists and is a guide
    const user = await users.findOne({ uid: userId })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.role !== "guide") {
      return NextResponse.json(
        { error: "User is not a guide" },
        { status: 400 }
      )
    }

    // Check if guide is already linked to another user
    const existingLink = await users.findOne({ guideId: guideId })
    if (existingLink && existingLink.uid !== userId) {
      return NextResponse.json(
        { error: "Guide profile is already linked to another user" },
        { status: 409 }
      )
    }

    // Link guide to user
    await users.updateOne(
      { uid: userId },
      { $set: { guideId: guideId, updatedAt: new Date() } }
    )

    return NextResponse.json({
      success: true,
      message: "Guide profile linked successfully",
    })
  } catch (error: any) {
    console.error("Error linking guide:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

