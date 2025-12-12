export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed" | "live"

export interface Booking {
  _id: string
  userId: string
  tourId: string
  guideId: string
  // Scheduling
  scheduledAt: Date // Tour start time in tour's timezone
  timezone: string // Tour timezone (e.g., "Europe/Rome")
  duration: number // Tour duration in minutes
  // Status
  status: BookingStatus
  // Streaming
  streamRoomId?: string // Streaming room/channel ID
  streamToken?: string // Token for accessing stream
  // Metadata
  createdAt: Date
  updatedAt: Date
  cancelledAt?: Date
  cancellationReason?: string
}

export interface TourSlot {
  _id: string
  tourId: string
  guideId: string
  // Time information
  startTime: Date // Start time in tour's timezone
  endTime: Date // End time in tour's timezone
  timezone: string // Timezone (e.g., "Europe/Rome")
  // Capacity
  maxParticipants: number
  bookedCount: number
  // Availability
  isAvailable: boolean
  // Metadata
  createdAt: Date
  updatedAt: Date
}

