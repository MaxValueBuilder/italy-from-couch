"use client"

import { useEffect, useRef, useState } from "react"
import AgoraRTC, { type IAgoraRTCClient, type IRemoteVideoTrack } from "agora-rtc-sdk-ng"
import { Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AgoraViewerProps {
  appId: string
  channelName: string
  token: string
  className?: string
  onStreamStalled?: (isStalled: boolean) => void
  onCriticalError?: () => void
}

export function AgoraViewer({
  appId,
  channelName,
  token,
  className,
}: AgoraViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionState, setConnectionState] = useState<string>("disconnected")
  const [hasVideo, setHasVideo] = useState(false)
  const [networkQuality, setNetworkQuality] = useState<number>(0) // 0-8, 1 is best, >4 is bad
  const [isStalled, setIsStalled] = useState(false)
  const [exception, setException] = useState<string | null>(null)

  const clientRef = useRef<IAgoraRTCClient | null>(null)
  const remoteVideoTrackRef = useRef<IRemoteVideoTrack | null>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!appId || !channelName || !token) {
      setError("Missing required configuration")
      setIsLoading(false)
      return
    }

    let mounted = true

    const initStream = async () => {
      try {
        // Create Agora client
        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
        clientRef.current = client

        // Set up event handlers
        client.on("connection-state-change", (curState, revState) => {
          if (mounted) {
            setConnectionState(curState)
            console.log("Connection state changed:", curState, revState)
          }
        })

        client.on("user-published", async (user, mediaType) => {
          try {
            await client.subscribe(user, mediaType)
            console.log("Subscribed to user:", user.uid, mediaType)

            if (mediaType === "video" && user.videoTrack && mounted) {
              remoteVideoTrackRef.current = user.videoTrack
              if (videoContainerRef.current) {
                user.videoTrack.play(videoContainerRef.current)
                setHasVideo(true)
              }
            }
          } catch (err) {
            console.error("Error subscribing to user:", err)
            if (mounted) {
              setError("Failed to subscribe to stream")
            }
          }
        })

        client.on("user-unpublished", (user, mediaType) => {
          console.log("User unpublished:", user.uid, mediaType)
          if (mediaType === "video" && mounted) {
            setHasVideo(false)
            remoteVideoTrackRef.current = null
          }
        })

        // Join channel
        const uid = 0 // Use 0 for anonymous users, or generate unique UID
        await client.join(appId, channelName, token, uid)
        console.log("Joined channel:", channelName)

        if (mounted) {
          setIsLoading(false)
          setConnectionState("CONNECTED")
        }
      } catch (err: any) {
        console.error("Error initializing stream:", err)
        if (mounted) {
          setError(err.message || "Failed to connect to stream")
          setIsLoading(false)
        }
      }
    }

    initStream()

    return () => {
      mounted = false
      cleanup()
    }
  }, [appId, channelName, token])

  const cleanup = async () => {
    try {
      if (remoteVideoTrackRef.current) {
        remoteVideoTrackRef.current.stop()
        remoteVideoTrackRef.current = null
      }

      if (clientRef.current) {
        await clientRef.current.leave()
      }
    } catch (error) {
      console.error("Error during cleanup:", error)
    }
  }

  if (error) {
    return (
      <div
        className={cn(
          "w-full aspect-video bg-black rounded-lg flex items-center justify-center",
          className
        )}
      >
        <div className="text-center text-white/70 space-y-2">
          <AlertCircle className="w-12 h-12 mx-auto opacity-50" />
          <p className="text-lg">Unable to load stream</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative w-full aspect-video bg-black rounded-lg overflow-hidden", className)}>
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="text-center text-white/70 space-y-4">
            <Loader2 className="w-12 h-12 mx-auto animate-spin" />
            <p className="text-lg">Connecting to stream...</p>
            <p className="text-sm">Please wait</p>
          </div>
        </div>
      )}

      {/* Video Container */}
      <div ref={videoContainerRef} className="w-full h-full" />

      {/* Level 2: Intelligent Stall Overlay */}
      {(isStalled || networkQuality > 5) && hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-20">
          <div className="bg-background/80 px-6 py-4 rounded-xl shadow-2xl border border-white/20 text-center animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-3 text-orange-500 mb-2 justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-semibold">Adjusting connection...</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The signal is weak, we are stabilizing the stream.
            </p>
          </div>
        </div>
      )}

      {/* No Video State */}
      {!isLoading && !hasVideo && connectionState === "CONNECTED" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white/70 space-y-2">
            <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <p className="text-lg">Waiting for stream to start...</p>
            <p className="text-sm">The guide will begin streaming shortly</p>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {connectionState !== "disconnected" && (
        <div className="absolute top-4 left-4 z-10">
          <div
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold",
              connectionState === "CONNECTED"
                ? "bg-green-600 text-white"
                : connectionState === "CONNECTING"
                ? "bg-yellow-600 text-white"
                : "bg-red-600 text-white"
            )}
          >
            {connectionState === "CONNECTED" ? "● LIVE" : "● CONNECTING..."}
          </div>
        </div>
      )}
    </div>
  )
}

