"use client"

import { useSocket } from "@/lib/socket/client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Wifi, WifiOff, Crown } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/context"

interface ParticipantListProps {
  className?: string
  compact?: boolean
  bookingId?: string
}

export function ParticipantList({ className, compact = false, bookingId }: ParticipantListProps) {
  const { participants, participantCount, isConnected } = useSocket()
  const { user } = useAuth()
  
  // Separate guides and viewers
  const guides = participants.filter((p) => p.isGuide)
  const viewers = participants.filter((p) => !p.isGuide)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Users className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">{participantCount}</span>
        <span className="text-xs text-muted-foreground">viewers</span>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col h-full bg-card border border-border rounded-lg", className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">People</h3>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="w-3 h-3 text-green-600" />
          ) : (
            <WifiOff className="w-3 h-3 text-red-600" />
          )}
          <span className="text-sm font-medium text-foreground">{participantCount}</span>
        </div>
      </div>

      {/* Participant List */}
      <ScrollArea className="flex-1 px-4 py-4">
        {participants.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            <p>No participants yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Guides Section */}
            {guides.length > 0 && (
              <div>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Guide
                </div>
                <div className="space-y-2">
                  {guides.map((participant) => {
                    const joinedTime = typeof participant.joinedAt === "string" 
                      ? new Date(participant.joinedAt) 
                      : participant.joinedAt
                    const isYou = participant.userId === user?.uid
                    
                    return (
                      <div
                        key={participant.userId}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarFallback className="bg-orange-600 text-white text-xs">
                            {getInitials(participant.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">
                              {participant.userName}
                            </p>
                            {isYou && (
                              <span className="text-xs text-muted-foreground">(You)</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Crown className="w-3 h-3 text-orange-600" />
                            <p className="text-xs text-muted-foreground">Tour guide</p>
                          </div>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full shrink-0" title="Connected" />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Viewers Section */}
            {viewers.length > 0 && (
              <div>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Viewers ({viewers.length})
                </div>
                <div className="space-y-2">
                  {viewers.map((participant) => {
                    const joinedTime = typeof participant.joinedAt === "string" 
                      ? new Date(participant.joinedAt) 
                      : participant.joinedAt
                    const isYou = participant.userId === user?.uid
                    
                    return (
                      <div
                        key={participant.userId}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarFallback className="bg-blue-600 text-white text-xs">
                            {getInitials(participant.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">
                              {participant.userName}
                            </p>
                            {isYou && (
                              <span className="text-xs text-muted-foreground">(You)</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Joined {formatDistanceToNow(joinedTime, { addSuffix: true })}
                          </p>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full shrink-0" title="Connected" />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
