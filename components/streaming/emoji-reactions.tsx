"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useSocket } from "@/lib/socket/client"

interface FloatingEmoji {
  id: string
  emoji: string
  x: number
  rotation: number
}

export function EmojiReactions() {
  const { lastEmoji } = useSocket()
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([])
  // Keep track of processed emoji timestamps to avoid duplicates
  const processedRef = useRef<Set<string>>(new Set())

  const addEmoji = useCallback((emoji: string, timestamp: Date) => {
    const timeStr = timestamp.toString()
    const id = `${timeStr}-${Math.random().toString(36).substring(7)}`
    
    // Random horizontal position between 10% and 90%
    const x = 10 + Math.random() * 80
    // Random rotation between -20 and 20 degrees
    const rotation = Math.floor(Math.random() * 40) - 20
    
    setFloatingEmojis((prev) => [...prev, { id, emoji, x, rotation }])

    // Remove emoji after animation finishes
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== id))
    }, 3000)
  }, [])

  useEffect(() => {
    if (lastEmoji && lastEmoji.timestamp) {
      const emojiKey = `${lastEmoji.userId}-${lastEmoji.timestamp.toString()}`
      if (!processedRef.current.has(emojiKey)) {
        processedRef.current.add(emojiKey)
        addEmoji(lastEmoji.emoji, lastEmoji.timestamp)
        
        // Cleanup old keys from the set
        if (processedRef.current.size > 50) {
          const keysArray = Array.from(processedRef.current)
          processedRef.current = new Set(keysArray.slice(-20))
        }
      }
    }
  }, [lastEmoji, addEmoji])

  return (
    <div className="absolute inset-0 pointer-events-none z-[100] overflow-hidden">
      {floatingEmojis.map((e) => (
        <div
          key={e.id}
          className="absolute bottom-0 text-4xl sm:text-5xl animate-emoji-float"
          style={{
            left: `${e.x}%`,
            "--rotation": `${e.rotation}deg`
          } as React.CSSProperties}
        >
          {e.emoji}
        </div>
      ))}
    </div>
  )
}
