import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb/connection"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { uid, email, name, photoURL, provider } = body

    if (!uid || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const users = db.collection("users")

    const userData = {
      uid,
      email,
      name: name || "",
      photoURL: photoURL || "",
      provider: provider || "password",
      updatedAt: new Date(),
    }

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

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[API] Error saving user:", error.message)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

