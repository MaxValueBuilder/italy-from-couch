/**
 * API client functions for stream management
 */

export interface StreamTokenResponse {
  success: boolean
  token: string
  channelName: string
  uid: number
  appId: string
}

export interface StreamInfoResponse {
  success: boolean
  isActive: boolean
  channelName?: string
  guideId?: string
  tourId?: string
  startedAt?: string
  participantCount?: number
  appId?: string
  message?: string
}

/**
 * Generate stream token for a booking
 */
export async function generateStreamToken(
  bookingId: string,
  role: "publisher" | "subscriber" = "subscriber",
  userId?: string
): Promise<StreamTokenResponse> {
  const response = await fetch("/api/streams/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bookingId,
      role,
      userId,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to generate stream token")
  }

  return response.json()
}

/**
 * Start a stream session for a booking (guide only)
 */
export async function startStream(
  bookingId: string,
  guideId: string
): Promise<StreamTokenResponse> {
  const response = await fetch("/api/streams/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bookingId,
      guideId,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to start stream")
  }

  return response.json()
}

/**
 * End a stream session for a booking (guide only)
 */
export async function endStream(
  bookingId: string,
  guideId: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch("/api/streams/end", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bookingId,
      guideId,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to end stream")
  }

  return response.json()
}

/**
 * Get stream information for a booking
 */
export async function getStreamInfo(
  bookingId: string
): Promise<StreamInfoResponse> {
  const response = await fetch(`/api/streams/${bookingId}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to fetch stream info")
  }

  return response.json()
}

/**
 * Get stream token for a booking (for viewers)
 */
export async function getStreamToken(
  bookingId: string,
  role: "publisher" | "subscriber" = "subscriber",
  userId?: string
): Promise<StreamTokenResponse> {
  const params = new URLSearchParams({ role })
  if (userId) {
    params.append("userId", userId)
  }

  const response = await fetch(`/api/streams/${bookingId}?${params.toString()}`, {
    method: "POST",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to get stream token")
  }

  return response.json()
}

/**
 * Get active stream information for a tour
 */
export interface TourStreamInfoResponse {
  success: boolean
  isActive: boolean
  bookingId?: string
  channelName?: string
  guideId?: string
  tourId?: string
  startedAt?: string
  scheduledAt?: string
  duration?: number
  participantCount?: number
  appId?: string
  fallbackUrl?: string
  message?: string
}

export async function getTourStreamInfo(
  tourId: string
): Promise<TourStreamInfoResponse> {
  const response = await fetch(`/api/streams/tour/${tourId}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to fetch tour stream info")
  }

  return response.json()
}

