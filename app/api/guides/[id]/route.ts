import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb/connection"

// GET - Fetch a single guide by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { ObjectId } = await import("mongodb")

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const guides = db.collection("guides")

    let guide
    try {
      guide = await guides.findOne({ _id: new ObjectId(id) })
    } catch (error) {
      return NextResponse.json({ error: "Invalid guide ID" }, { status: 400 })
    }

    if (!guide) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 })
    }

    const formattedGuide = {
      ...guide,
      _id: guide._id.toString(),
    }

    return NextResponse.json({ success: true, guide: formattedGuide })
  } catch (error: any) {
    console.error("Error fetching guide:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

// PATCH - Update a guide
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const guides = db.collection("guides")

    const { ObjectId } = await import("mongodb")
    let guide
    try {
      guide = await guides.findOne({ _id: new ObjectId(id) })
    } catch (error) {
      return NextResponse.json({ error: "Invalid guide ID" }, { status: 400 })
    }
    if (!guide) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 })
    }

    const updateData = {
      ...body,
      updatedAt: new Date(),
    }

    await guides.updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    const updatedGuide = await guides.findOne({ _id: new ObjectId(id) })

    return NextResponse.json({
      success: true,
      guide: {
        ...updatedGuide,
        _id: updatedGuide!._id.toString(),
      },
    })
  } catch (error: any) {
    console.error("Error updating guide:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete a guide
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const client = await clientPromise
    const db = client.db("italy-from-couch")
    const guides = db.collection("guides")

    const { ObjectId } = await import("mongodb")
    let result
    try {
      result = await guides.deleteOne({ _id: new ObjectId(id) })
    } catch (error) {
      return NextResponse.json({ error: "Invalid guide ID" }, { status: 400 })
    }

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, deletedCount: result.deletedCount })
  } catch (error: any) {
    console.error("Error deleting guide:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

