"use client"

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react"
import { io, Socket } from "socket.io-client"
import { ChatMessage, TypingUser, EmojiReaction } from "@/types/chat"
import { useAuth } from "@/lib/auth/context"

interface SocketContextType {
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

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: React.ReactNode }) {
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
    if (!user) {
      if (socket) {
        socket.close()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

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
      
      // Re-join room if we were in one (on reconnection)
      if (currentRoomRef.current && userInfo) {
        newSocket.emit("join-room", {
          bookingId: currentRoomRef.current,
          userId: user.uid,
          userName: userInfo.name || user.email || "Anonymous",
        })
      }
    })

    newSocket.on("disconnect", () => {
      console.log("[Socket] Disconnected")
      setIsConnected(false)
    })

    newSocket.on("new-message", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message])
    })

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

    newSocket.on("new-emoji", (reaction: EmojiReaction) => {
      setLastEmoji(reaction)
    })

    newSocket.on("message-deleted", (messageId: string) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId))
    })

    newSocket.on("message-history", (history: ChatMessage[]) => {
      setMessages(history)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [user]) // Re-run if user changes

  const joinRoom = useCallback(
    (bookingId: string) => {
      if (!socket || !user || !userInfo) return

      if (currentRoomRef.current === bookingId) return

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

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => stopTyping(), 3000)
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

  return (
    <SocketContext.Provider
      value={{
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
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}
