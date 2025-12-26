"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Users, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSocket } from "@/lib/socket/client"

interface SidebarToggleProps {
  onViewChange: (view: "participants" | "chat") => void
  activeView?: "participants" | "chat"
  className?: string
}

export function SidebarToggle({ onViewChange, activeView: controlledView, className }: SidebarToggleProps) {
  const [internalView, setInternalView] = useState<"participants" | "chat">("participants")
  const { participantCount, messages } = useSocket()
  
  // Use controlled view if provided, otherwise use internal state
  const activeView = controlledView ?? internalView

  const handleViewChange = (view: "participants" | "chat") => {
    if (!controlledView) {
      setInternalView(view)
    }
    onViewChange(view)
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Participants Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleViewChange("participants")}
        className={cn(
          "relative h-10 w-10 rounded-lg",
          activeView === "participants"
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        title="Participants"
      >
        <Users className="h-5 w-5" />
        {participantCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange-600 text-white text-[10px] font-semibold flex items-center justify-center">
            {participantCount > 99 ? "99+" : participantCount}
          </span>
        )}
      </Button>

      {/* Chat Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleViewChange("chat")}
        className={cn(
          "relative h-10 w-10 rounded-lg",
          activeView === "chat"
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        title="Chat"
      >
        <MessageSquare className="h-5 w-5" />
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] font-semibold flex items-center justify-center">
            {messages.length > 99 ? "99+" : messages.length}
          </span>
        )}
      </Button>
    </div>
  )
}
