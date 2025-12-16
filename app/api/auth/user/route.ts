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
    console.log("[API] Get user request for uid:", uid)

    if (!uid) {
      console.log("[API] Missing uid parameter")
      return NextResponse.json({ error: "uid is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const users = db.collection("users")

    console.log("[API] Querying database for user...")
    const user = await users.findOne({ uid })

    if (!user) {
      console.log("[API] User not found in database")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If user has a guideId, they should be a guide (fix data inconsistency)
    // Update role in database if needed
    if (user.guideId && user.role !== "guide") {
      console.log("[API] Fixing user role: user has guideId but role is not 'guide', updating...")
      await users.updateOne(
        { uid },
        { $set: { role: "guide", updatedAt: new Date() } }
      )
      user.role = "guide"
    }

    const userResponse = {
      uid: user.uid,
      email: user.email,
      name: user.name || "",
      photoURL: user.photoURL || "",
      role: user.role || "user",
      provider: user.provider || "password",
      guideId: user.guideId || undefined, // Guide's _id from guides collection
    }
    console.log("[API] User found:", { uid: userResponse.uid, email: userResponse.email, role: userResponse.role, guideId: userResponse.guideId })

    return NextResponse.json({
      success: true,
      user: userResponse,
    })
  } catch (error: any) {
    console.error("[API] Error fetching user:", error.message)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

