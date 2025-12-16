import { NextRequest, NextResponse } from "next/server"
import { generateRtcToken, TokenRole } from "@/lib/agora/token-server"
import { generateChannelName } from "@/lib/agora/config"
import { useAuth } from "@/lib/auth/context"

/**
 * POST /api/streams/token
 * Generate Agora RTC token for a booking
 * 
 * Body:
 * {
 *   bookingId: string
 *   role: "publisher" | "subscriber"
 *   userId?: string (optional, for authenticated users)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, role, userId } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId is required" },
        { status: 400 }
      )
    }

    if (!role || (role !== "publisher" && role !== "subscriber")) {
      return NextResponse.json(
        { error: "role must be 'publisher' or 'subscriber'" },
        { status: 400 }
      )
    }

    // Generate channel name from booking ID
    const channelName = generateChannelName(bookingId)

    // Use userId if provided, otherwise use 0 (anonymous)
    const uid = userId ? parseInt(userId.slice(-8), 16) || 0 : 0

    // Calculate token expiration (24 hours from now)
    const expirationTime = 86400 // 24 hours in seconds

    // Generate token
    const token = generateRtcToken(
      channelName,
      uid,
      role as TokenRole,
      expirationTime
    )

    return NextResponse.json({
      success: true,
      token,
      channelName,
      uid,
      appId: process.env.AGORA_APP_ID,
    })
  } catch (error: any) {
    console.error("Error generating stream token:", error)
    return NextResponse.json(
      {
        error: "Failed to generate stream token",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

