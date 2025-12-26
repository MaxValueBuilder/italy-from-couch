"use client"

import { CountdownTimer } from "./countdown-timer"
import { ParticipantList } from "./participant-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface TourProgressProps {
  bookingId: string
  startTime: Date
  duration: number
  onTimeExpired?: () => void
  className?: string
}

export function TourProgress({
  bookingId,
  startTime,
  duration,
  onTimeExpired,
  className,
}: TourProgressProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Tour Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Countdown Timer */}
        <CountdownTimer
          startTime={startTime}
          duration={duration}
          onTimeExpired={onTimeExpired}
        />

        <Separator />

        {/* Participant Count (Compact) */}
        <ParticipantList compact={true} />
      </CardContent>
    </Card>
  )
}
