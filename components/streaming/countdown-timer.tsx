"use client"

import { useEffect, useState } from "react"
import { Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CountdownTimerProps {
  startTime: Date
  duration: number // Duration in minutes
  onTimeExpired?: () => void
  className?: string
  showWarning?: boolean
}

export function CountdownTimer({
  startTime,
  duration,
  onTimeExpired,
  className,
  showWarning = true,
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isExpired, setIsExpired] = useState(false)
  const [isWarning, setIsWarning] = useState(false)

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date()
      const start = typeof startTime === "string" ? new Date(startTime) : startTime
      const endTime = new Date(start.getTime() + duration * 60 * 1000)
      const remaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000))
      
      setTimeRemaining(remaining)
      setIsExpired(remaining === 0)
      setIsWarning(showWarning && remaining > 0 && remaining <= 5 * 60) // 5 minutes warning
      
      if (remaining === 0 && onTimeExpired) {
        onTimeExpired()
      }
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [startTime, duration, onTimeExpired, showWarning])

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return "00:00"
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress = duration > 0 ? Math.max(0, Math.min(100, ((duration * 60 - timeRemaining) / (duration * 60)) * 100)) : 0

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Clock className={cn("w-4 h-4", isWarning ? "text-orange-500" : "text-muted-foreground")} />
        <span className={cn(
          "text-sm font-medium",
          isExpired ? "text-red-600" : isWarning ? "text-orange-500" : "text-foreground"
        )}>
          {isExpired ? "Tour Ended" : `Time Remaining: ${formatTime(timeRemaining)}`}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-1000",
            isExpired ? "bg-red-600" : isWarning ? "bg-orange-500" : "bg-green-600"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Warning Message */}
      {isWarning && !isExpired && (
        <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 dark:bg-orange-950/20 px-2 py-1 rounded">
          <AlertCircle className="w-3 h-3" />
          <span>Less than 5 minutes remaining</span>
        </div>
      )}
    </div>
  )
}
