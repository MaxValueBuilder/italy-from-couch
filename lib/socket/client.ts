"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { io, Socket } from "socket.io-client"
import { ChatMessage, TypingUser, EmojiReaction } from "@/types/chat"
import { useAuth } from "@/lib/auth/context"

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  messages: ChatMessage[]
  typingUsers: TypingUser[]
  lastEmoji: EmojiReaction | null
  sendMessage: (message: string) => void
  sendEmoji: (emoji: string) => void
  deleteMessage: (messageId: string) => void
  startTyping: () => void
  stopTyping: () => void
  joinRoom: (bookingId: string) => void
  leaveRoom: () => void
}

export function useSocket(): UseSocketReturn {
  const { user, userInfo } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [lastEmoji, setLastEmoji] = useState<EmojiReaction | null>(null)
  const currentRoomRef = useRef<string | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize socket connection
  useEffect(() => {
    if (!user) return

    // Use the same origin for Socket.io in development, or use env variable
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    newSocket.on("connect", () => {
      console.log("[Socket] Connected")
      setIsConnected(true)
    })

    newSocket.on("disconnect", () => {
      console.log("[Socket] Disconnected")
      setIsConnected(false)
    })

    newSocket.on("connect_error", (error) => {
      console.error("[Socket] Connection error:", error)
      setIsConnected(false)
    })

    // Listen for new messages
    newSocket.on("new-message", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message])
    })

    // Listen for typing indicators
    newSocket.on("user-typing", (user: TypingUser) => {
      setTypingUsers((prev) => {
        const exists = prev.find((u) => u.userId === user.userId)
        if (exists) return prev
        return [...prev, user]
      })
    })

    newSocket.on("user-stopped-typing", (userId: string) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId))
    })

    // Listen for emojis
    newSocket.on("new-emoji", (reaction: EmojiReaction) => {
      setLastEmoji(reaction)
    })

    // Listen for deleted messages
    newSocket.on("message-deleted", (messageId: string) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId))
    })

    // Listen for message history
    newSocket.on("message-history", (history: ChatMessage[]) => {
      setMessages(history)
    })

    setSocket(newSocket)

    return () => {
      if (currentRoomRef.current) {
        newSocket.emit("leave-room", currentRoomRef.current)
      }
      newSocket.close()
    }
  }, [user])

  const joinRoom = useCallback(
    (bookingId: string) => {
      if (!socket || !user || !userInfo) return

      // Leave previous room if any
      if (currentRoomRef.current) {
        socket.emit("leave-room", currentRoomRef.current)
      }

      currentRoomRef.current = bookingId
      socket.emit("join-room", {
        bookingId,
        userId: user.uid,
        userName: userInfo.name || user.email || "Anonymous",
      })
    },
    [socket, user, userInfo]
  )

  const leaveRoom = useCallback(() => {
    if (!socket || !currentRoomRef.current) return

    socket.emit("leave-room", currentRoomRef.current)
    currentRoomRef.current = null
    setMessages([])
    setTypingUsers([])
    setLastEmoji(null)
  }, [socket])

  const sendMessage = useCallback(
    (message: string) => {
      if (!socket || !user || !userInfo || !currentRoomRef.current || !message.trim()) return

      socket.emit("send-message", {
        bookingId: currentRoomRef.current,
        userId: user.uid,
        userName: userInfo.name || user.email || "Anonymous",
        message: message.trim(),
      })

      // Stop typing after sending
      stopTyping()
    },
    [socket, user, userInfo]
  )

  const sendEmoji = useCallback(
    (emoji: string) => {
      if (!socket || !user || !userInfo || !currentRoomRef.current) return

      socket.emit("send-emoji", {
        bookingId: currentRoomRef.current,
        userId: user.uid,
        userName: userInfo.name || user.email || "Anonymous",
        emoji,
      })
    },
    [socket, user, userInfo]
  )

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!socket || !user || !currentRoomRef.current) return

      socket.emit("delete-message", {
        bookingId: currentRoomRef.current,
        messageId,
        userId: user.uid,
      })
    },
    [socket, user]
  )

  const startTyping = useCallback(() => {
    if (!socket || !user || !userInfo || !currentRoomRef.current) return

    socket.emit("typing-start", {
      bookingId: currentRoomRef.current,
      userId: user.uid,
      userName: userInfo.name || user.email || "Anonymous",
    })

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, 3000)
  }, [socket, user, userInfo])

  const stopTyping = useCallback(() => {
    if (!socket || !user || !currentRoomRef.current) return

    socket.emit("typing-stop", {
      bookingId: currentRoomRef.current,
      userId: user.uid,
    })

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
  }, [socket, user])

  return {
    socket,
    isConnected,
    messages,
    typingUsers,
    lastEmoji,
    sendMessage,
    sendEmoji,
    deleteMessage,
    startTyping,
    stopTyping,
    joinRoom,
    leaveRoom,
  }
}

