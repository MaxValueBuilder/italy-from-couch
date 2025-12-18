"use client"

import { useEffect, useState, useCallback } from "react"
import { EmojiReaction } from "@/types/chat"
import { useSocket } from "@/lib/socket/client"

interface FloatingEmoji {
  id: string
  emoji: string
  x: number
}

export function EmojiReactions() {
  const { lastEmoji } = useSocket()
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([])

  const addEmoji = useCallback((emoji: string) => {
    const id = Math.random().toString(36).substring(7)
    // Random horizontal position between 10% and 90%
    const x = 10 + Math.random() * 80
    
    setFloatingEmojis((prev) => [...prev, { id, emoji, x }])

    // Remove emoji after animation finishes (approx 3 seconds)
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== id))
    }, 3000)
  }, [])

  useEffect(() => {
    if (lastEmoji) {
      addEmoji(lastEmoji.emoji)
    }
  }, [lastEmoji, addEmoji])

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {floatingEmojis.map((e) => (
        <div
          key={e.id}
          className="absolute bottom-0 text-3xl sm:text-4xl animate-float-up"
          style={{
            left: `${e.x}%`,
            animationDuration: "3s",
            animationFillMode: "forwards"
          }}
        >
          {e.emoji}
        </div>
      ))}
      <style jsx global>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-500px) scale(1.5) rotate(${Math.random() > 0.5 ? 20 : -20}deg);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation-name: float-up;
          animation-timing-function: ease-out;
        }
      `}</style>
    </div>
  )
}
