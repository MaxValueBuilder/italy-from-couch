"use client"

import { Radio } from "lucide-react"

interface LiveBadgeProps {
  isLive: boolean
  className?: string
}

export function LiveBadge({ isLive, className = "" }: LiveBadgeProps) {
  if (!isLive) return null

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-semibold animate-pulse ${className}`}
    >
      <Radio size={12} className="fill-current" />
      <span>LIVE</span>
    </div>
  )
}

