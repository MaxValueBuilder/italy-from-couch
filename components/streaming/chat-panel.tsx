"use client"

import { useEffect, useRef, useState } from "react"
import { useSocket } from "@/lib/socket/client"
import { ChatMessage } from "@/types/chat"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ChatPanelProps {
  bookingId: string
  className?: string
}

export function ChatPanel({ bookingId, className }: ChatPanelProps) {
  const { user } = useAuth()
  const { messages, typingUsers, sendMessage, startTyping, stopTyping, joinRoom, leaveRoom, isConnected } = useSocket()
  const [inputValue, setInputValue] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Join room when bookingId changes
  useEffect(() => {
    if (bookingId) {
      joinRoom(bookingId)
    }

    return () => {
      leaveRoom()
    }
  }, [bookingId, joinRoom, leaveRoom])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)

    // Start typing indicator
    if (e.target.value.trim().length > 0) {
      startTyping()

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping()
      }, 2000)
    } else {
      stopTyping()
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return

    setIsSending(true)
    try {
      sendMessage(inputValue)
      setInputValue("")
      stopTyping()
      inputRef.current?.focus()
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatMessageTime = (timestamp: Date | string) => {
    try {
      const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp
      return format(date, "HH:mm")
    } catch {
      return ""
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={cn("flex flex-col h-full bg-card border border-border rounded-lg", className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Live Chat</h3>
          <p className="text-xs text-muted-foreground">
            {isConnected ? "Connected" : "Connecting..."}
          </p>
        </div>
        {!isConnected && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>

      {/* Messages List */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message: ChatMessage) => {
              const isOwnMessage = message.userId === user?.uid

              return (
                <div
                  key={message._id || `${message.timestamp}-${message.userId}`}
                  className={cn("flex gap-3", isOwnMessage && "flex-row-reverse")}
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-orange-600 text-white text-xs">
                      {getInitials(message.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn("flex flex-col gap-1 flex-1 min-w-0", isOwnMessage && "items-end")}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{message.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatMessageTime(message.timestamp)}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm max-w-[80%] break-words",
                        isOwnMessage
                          ? "bg-orange-600 text-white"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {message.message}
                    </div>
                  </div>
                </div>
              )
            })
          )}

          {/* Typing Indicators */}
          {typingUsers.length > 0 && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                  {getInitials(typingUsers[0].userName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">{typingUsers[0].userName}</span>
                <div className="bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground">
                  <span className="inline-flex gap-1">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse delay-75">●</span>
                    <span className="animate-pulse delay-150">●</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={!isConnected || isSending}
            maxLength={500}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || !isConnected || isSending}
            size="icon"
            className="shrink-0 bg-orange-600 hover:bg-orange-700"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        {inputValue.length > 400 && (
          <p className="text-xs text-muted-foreground mt-1">
            {500 - inputValue.length} characters remaining
          </p>
        )}
      </div>
    </div>
  )
}

