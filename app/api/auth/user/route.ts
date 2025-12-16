import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb/connection"

/**
 * GET /api/auth/user
 * Get user information including role
 * 
 * Query params:
 * - uid: User ID (Firebase UID)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get("uid")

    if (!uid) {
      return NextResponse.json({ error: "uid is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const users = db.collection("users")

    const user = await users.findOne({ uid })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name || "",
        photoURL: user.photoURL || "",
        role: user.role || "user",
        provider: user.provider || "password",
        guideId: user.guideId || undefined, // Guide's _id from guides collection
      },
    })
  } catch (error: any) {
    console.error("[API] Error fetching user:", error.message)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

