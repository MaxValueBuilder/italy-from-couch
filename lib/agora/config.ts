/**
 * Agora.io Configuration
 * 
 * Environment variables required:
 * - AGORA_APP_ID: Your Agora App ID
 * - AGORA_APP_CERTIFICATE: Your Agora App Certificate (keep secure!)
 */

export const agoraConfig = {
  appId: process.env.AGORA_APP_ID || "",
  appCertificate: process.env.AGORA_APP_CERTIFICATE || "",
}

if (!agoraConfig.appId || !agoraConfig.appCertificate) {
  console.warn(
    "⚠️ Agora credentials not found. Please set AGORA_APP_ID and AGORA_APP_CERTIFICATE in your environment variables."
  )
}

/**
 * Generate a channel name for a booking
 */
export function generateChannelName(bookingId: string): string {
  return `booking-${bookingId}`
}

/**
 * Parse booking ID from channel name
 */
export function parseBookingIdFromChannel(channelName: string): string | null {
  const match = channelName.match(/^booking-(.+)$/)
  return match ? match[1] : null
}

/**
 * Video/audio configuration
 */
export const videoConfig = {
  // Video settings for guide (publisher)
  publisher: {
    resolution: { width: 1280, height: 720 }, // 720p
    frameRate: 30,
    bitrate: 2000, // 2 Mbps
  },
  // Video settings for viewers (subscribers)
  subscriber: {
    resolution: { width: 1280, height: 720 }, // 720p
    frameRate: 30,
  },
  // Level 1: Latency and buffering (from Lorenzo's request)
  latency: {
    liveStreaming: {
      lowLatency: false, // Set to false to allow more buffering for resilience
      audienceLatencyLevel: 2, // 1: Ultra-low latency, 2: Standard latency with better resilience
    }
  }
}

