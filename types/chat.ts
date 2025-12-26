export interface ChatMessage {
  _id?: string
  bookingId: string
  userId: string
  userName: string
  message: string
  type: "message" | "system"
  timestamp: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface EmojiReaction {
  bookingId: string
  userId: string
  userName: string
  emoji: string
  timestamp: Date
}

export interface TypingUser {
  userId: string
  userName: string
}

export interface ChatRoomState {
  bookingId: string
  users: TypingUser[]
  messages: ChatMessage[]
}

export interface Participant {
  userId: string
  userName: string
  joinedAt: Date
  isGuide?: boolean
}

export interface ParticipantsUpdate {
  count: number
  participants: Participant[]
}

