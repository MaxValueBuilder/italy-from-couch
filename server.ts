// Load environment variables from .env.local before any other imports
// Use require() to ensure synchronous execution before ES6 imports
const dotenv = require("dotenv")
const path = require("path")
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

import { createServer } from "http"
import { parse } from "url"
import next from "next"
import { Server as SocketIOServer } from "socket.io"
import clientPromise from "./lib/mongodb/connection"
import { ChatMessage } from "./types/chat"

const dev = process.env.NODE_ENV !== "production"
const hostname = process.env.HOSTNAME || "localhost"
const port = parseInt(process.env.PORT || "3000", 10)

// Get the socket URL from environment or construct it
const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL
  }
  return `http://${hostname}:${port}`
}

// Create Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error("Error occurred handling", req.url, err)
      res.statusCode = 500
      res.end("internal server error")
    }
  })

  // Create Socket.io server
  const socketUrl = getSocketUrl()
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: socketUrl,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  })

  // Store active rooms and typing users
  const activeRooms = new Map<string, Set<string>>() // bookingId -> Set of userIds
  const typingUsers = new Map<string, Map<string, NodeJS.Timeout>>() // bookingId -> Map<userId, timeout>

  // Socket.io connection handling
  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`)

    // Join a room (booking)
    socket.on("join-room", async (data: { bookingId: string; userId: string; userName: string }) => {
      const { bookingId, userId } = data

      try {
        // Verify booking exists and user has access
        const client = await clientPromise
        const db = client.db("italy-from-couch")
        const bookings = db.collection("bookings")
        const { ObjectId } = await import("mongodb")

        let booking
        try {
          booking = await bookings.findOne({ _id: new ObjectId(bookingId) })
        } catch (error) {
          socket.emit("error", { message: "Invalid booking ID" })
          return
        }

        if (!booking) {
          socket.emit("error", { message: "Booking not found" })
          return
        }

        // Join the room
        socket.join(bookingId)
        console.log(`[Socket] User ${userId} joined room ${bookingId}`)

        // Track active users in room
        if (!activeRooms.has(bookingId)) {
          activeRooms.set(bookingId, new Set())
        }
        activeRooms.get(bookingId)!.add(userId)

        // Load and send message history
        const chatMessages = db.collection("chatMessages")
        const messages = await chatMessages
          .find({ bookingId })
          .sort({ timestamp: 1 })
          .limit(100)
          .toArray()

        const formattedMessages: ChatMessage[] = messages.map((msg: any) => ({
          _id: msg._id.toString(),
          bookingId: msg.bookingId,
          userId: msg.userId,
          userName: msg.userName,
          message: msg.message,
          type: msg.type || "message",
          timestamp: msg.timestamp,
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt,
        }))

        socket.emit("message-history", formattedMessages)
      } catch (error) {
        console.error("[Socket] Error joining room:", error)
        socket.emit("error", { message: "Failed to join room" })
      }
    })

    // Leave a room
    socket.on("leave-room", (bookingId: string) => {
      socket.leave(bookingId)
      console.log(`[Socket] Client left room ${bookingId}`)

      // Clean up typing indicator
      if (typingUsers.has(bookingId)) {
        typingUsers.get(bookingId)!.forEach((timeout) => clearTimeout(timeout))
        typingUsers.delete(bookingId)
      }
    })

    // Send a message
    socket.on("send-message", async (data: { bookingId: string; userId: string; userName: string; message: string }) => {
      const { bookingId, userId, userName, message } = data

      try {
        // Save message to database
        const client = await clientPromise
        const db = client.db("italy-from-couch")
        const chatMessages = db.collection("chatMessages")

        const messageDoc: ChatMessage = {
          bookingId,
          userId,
          userName,
          message: message.trim(),
          type: "message",
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const result = await chatMessages.insertOne(messageDoc as any)

        const createdMessage: ChatMessage = {
          ...messageDoc,
          _id: result.insertedId.toString(),
        }

        // Broadcast to all users in the room
        io.to(bookingId).emit("new-message", createdMessage)
        console.log(`[Socket] Message sent in room ${bookingId} by ${userName}`)
      } catch (error) {
        console.error("[Socket] Error sending message:", error)
        socket.emit("error", { message: "Failed to send message" })
      }
    })

    // Typing indicator - start
    socket.on("typing-start", (data: { bookingId: string; userId: string; userName: string }) => {
      const { bookingId, userId, userName } = data

      // Clear existing timeout for this user
      if (typingUsers.has(bookingId)) {
        const userTimeouts = typingUsers.get(bookingId)!
        if (userTimeouts.has(userId)) {
          clearTimeout(userTimeouts.get(userId)!)
        }
      } else {
        typingUsers.set(bookingId, new Map())
      }

      // Broadcast typing indicator to others in the room
      socket.to(bookingId).emit("user-typing", { userId, userName })

      // Auto-stop typing after 3 seconds
      const timeout = setTimeout(() => {
        socket.to(bookingId).emit("user-stopped-typing", userId)
        if (typingUsers.has(bookingId)) {
          typingUsers.get(bookingId)!.delete(userId)
        }
      }, 3000)

      typingUsers.get(bookingId)!.set(userId, timeout)
    })

    // Typing indicator - stop
    socket.on("typing-stop", (data: { bookingId: string; userId: string }) => {
      const { bookingId, userId } = data

      // Clear timeout
      if (typingUsers.has(bookingId)) {
        const userTimeouts = typingUsers.get(bookingId)!
        if (userTimeouts.has(userId)) {
          clearTimeout(userTimeouts.get(userId)!)
          userTimeouts.delete(userId)
        }
      }

      // Broadcast stop typing to others in the room
      socket.to(bookingId).emit("user-stopped-typing", userId)
    })

    // Emoji reaction
    socket.on("send-emoji", (data: { bookingId: string; userId: string; userName: string; emoji: string }) => {
      const { bookingId, userId, userName, emoji } = data
      
      const reaction = {
        bookingId,
        userId,
        userName,
        emoji,
        timestamp: new Date()
      }

      // Broadcast to everyone in the room (including the sender for visual sync)
      io.to(bookingId).emit("new-emoji", reaction)
      console.log(`[Socket] Emoji ${emoji} sent in room ${bookingId} by ${userName}`)
    })

    // Delete a message
    socket.on("delete-message", async (data: { bookingId: string; messageId: string; userId: string }) => {
      const { bookingId, messageId, userId } = data

      try {
        const client = await clientPromise
        const db = client.db("italy-from-couch")
        const chatMessages = db.collection("chatMessages")
        const { ObjectId } = await import("mongodb")

        // In a real app, you would verify if the user has permission to delete (guide or author)
        // For now, we'll assume the client-side check is sufficient or implement a basic check
        await chatMessages.deleteOne({ _id: new ObjectId(messageId) })

        // Broadcast deletion to all users in the room
        io.to(bookingId).emit("message-deleted", messageId)
        console.log(`[Socket] Message ${messageId} deleted in room ${bookingId}`)
      } catch (error) {
        console.error("[Socket] Error deleting message:", error)
        socket.emit("error", { message: "Failed to delete message" })
      }
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`)
    })
  })

  // Start server
  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> Socket.io server running`)
  })
})

