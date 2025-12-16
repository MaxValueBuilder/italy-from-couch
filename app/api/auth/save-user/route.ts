import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb/connection"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { uid, email, name, photoURL, provider, role } = body
    console.log("[API] Save user request:", { uid, email, role })

    if (!uid || !email) {
      console.log("[API] Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const users = db.collection("users")

    // Get existing user to preserve role if not provided
    const existingUser = await users.findOne({ uid })
    console.log("[API] Existing user:", existingUser ? { uid: existingUser.uid, role: existingUser.role, guideId: existingUser.guideId } : "not found")
    const userRole = role || existingUser?.role || "user"

    const userData = {
      uid,
      email,
      name: name || "",
      photoURL: photoURL || "",
      provider: provider || "password",
      role: userRole, // "user" or "guide"
      guideId: existingUser?.guideId || undefined, // Preserve guideId if exists
      updatedAt: new Date(),
    }

    console.log("[API] Saving user data:", { uid, email, role: userRole, guideId: userData.guideId })
    await users.updateOne(
      { uid },
      {
        $set: userData,
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    )

    console.log("[API] User saved successfully")
    return NextResponse.json({ success: true, role: userRole })
  } catch (error: any) {
    console.error("[API] Error saving user:", error.message)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

