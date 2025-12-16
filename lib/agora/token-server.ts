/**
 * Agora RTC Token Generation Server
 * 
 * Generates tokens for guides (publishers) and users (subscribers)
 * using Agora's token generation algorithm.
 */

import { agoraConfig } from "./config"

export type TokenRole = "publisher" | "subscriber"

/**
 * Generate RTC token for Agora channel
 * 
 * @param channelName - The channel name (e.g., "booking-{bookingId}")
 * @param uid - User ID (0 for anonymous, or specific user ID)
 * @param role - "publisher" for guides, "subscriber" for viewers
 * @param expirationTime - Token expiration time in seconds (default: 24 hours)
 * @returns RTC token string
 */
export function generateRtcToken(
  channelName: string,
  uid: number | string = 0,
  role: TokenRole = "subscriber",
  expirationTime: number = 86400 // 24 hours
): string {
  if (!agoraConfig.appId || !agoraConfig.appCertificate) {
    throw new Error("Agora credentials not configured")
  }

  const currentTimestamp = Math.floor(Date.now() / 1000)
  const privilegeExpiredTs = currentTimestamp + expirationTime

  // Convert uid to number if it's a string
  const numericUid = typeof uid === "string" ? parseInt(uid, 10) || 0 : uid

  // Determine privileges based on role
  const privileges: Record<string, number> = {
    JoinChannel: 1,
  }

  if (role === "publisher") {
    // Guide can publish audio, video, and data streams
    privileges.PublishAudioStream = 1
    privileges.PublishVideoStream = 1
    privileges.PublishDataStream = 1
  } else {
    // Users can only subscribe (read-only)
    privileges.SubscribeAudioStream = 1
    privileges.SubscribeVideoStream = 1
  }

  // Generate token using Agora's token generation algorithm
  // Note: This is a simplified version. For production, use Agora's official token generator
  // or their server SDK: https://www.agora.io/en/blog/agora-token-server-sdk/
  
  const token = generateToken(
    agoraConfig.appId,
    agoraConfig.appCertificate,
    channelName,
    numericUid,
    privilegeExpiredTs,
    privileges
  )

  return token
}

/**
 * Generate Agora RTC token using official Agora token builder
 */
function generateToken(
  appId: string,
  appCertificate: string,
  channelName: string,
  uid: number,
  privilegeExpiredTs: number,
  privileges: Record<string, number>
): string {
  try {
    // Try to use official Agora token builder if available
    // Install with: npm install agora-access-token
    const { RtcTokenBuilder, RtcRole } = require("agora-access-token")
    
    // Determine role based on privileges
    const role = privileges.PublishAudioStream || privileges.PublishVideoStream
      ? RtcRole.PUBLISHER
      : RtcRole.SUBSCRIBER

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs
    )

    return token
  } catch (error) {
    // Fallback: If agora-access-token is not installed, use a temporary structure
    // TODO: Install agora-access-token package: npm install agora-access-token
    console.warn(
      "agora-access-token package not found. Using temporary token structure. " +
      "Please install: npm install agora-access-token"
    )

    const tokenData = {
      appId,
      channelName,
      uid: uid.toString(),
      privilegeExpiredTs,
      privileges,
      timestamp: Math.floor(Date.now() / 1000),
    }

    return Buffer.from(JSON.stringify(tokenData)).toString("base64")
  }
}

/**
 * Validate token format (basic check)
 */
export function validateToken(token: string): boolean {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString())
    return (
      decoded.appId &&
      decoded.channelName &&
      decoded.uid !== undefined &&
      decoded.privilegeExpiredTs > Math.floor(Date.now() / 1000)
    )
  } catch {
    return false
  }
}

