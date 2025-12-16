"use client"

import { useEffect, useRef, useState } from "react"
import AgoraRTC, { type IAgoraRTCClient, type ICameraVideoTrack, type IMicrophoneAudioTrack } from "agora-rtc-sdk-ng"
import { Button } from "@/components/ui/button"
import { Loader2, Video, VideoOff, Mic, MicOff, PhoneOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface GuideBroadcastProps {
  appId: string
  channelName: string
  token: string
  onStreamEnd?: () => void
  className?: string
}

export function GuideBroadcast({
  appId,
  channelName,
  token,
  onStreamEnd,
  className,
}: GuideBroadcastProps) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [connectionState, setConnectionState] = useState<string>("disconnected")

  const clientRef = useRef<IAgoraRTCClient | null>(null)
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null)
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)

  // Initialize Agora client
  useEffect(() => {
    if (!appId) {
      setError("Agora App ID is not configured")
      return
    }

    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
    clientRef.current = client

    // Set up event handlers
    client.on("connection-state-change", (curState, revState) => {
      setConnectionState(curState)
      console.log("Connection state changed:", curState, revState)
    })

    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType)
      console.log("User published:", user.uid, mediaType)
    })

    client.on("user-unpublished", (user, mediaType) => {
      console.log("User unpublished:", user.uid, mediaType)
    })

    return () => {
      cleanup()
    }
  }, [appId])

  const cleanup = async () => {
    try {
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.stop()
        localVideoTrackRef.current.close()
        localVideoTrackRef.current = null
      }

      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop()
        localAudioTrackRef.current.close()
        localAudioTrackRef.current = null
      }

      if (clientRef.current) {
        await clientRef.current.leave()
      }
    } catch (error) {
      console.error("Error during cleanup:", error)
    }
  }

  const startStream = async () => {
    if (!clientRef.current || !appId || !channelName || !token) {
      setError("Missing required configuration")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const client = clientRef.current

      // Join channel
      await client.join(appId, channelName, token, 0) // UID 0 for guide
      console.log("Joined channel:", channelName)

      // Create and publish video track
      const videoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: {
          width: 1280,
          height: 720,
          frameRate: 30,
          bitrateMax: 2000,
        },
      })

      localVideoTrackRef.current = videoTrack

      // Create and publish audio track
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack()
      localAudioTrackRef.current = audioTrack

      // Play local video preview
      if (videoContainerRef.current) {
        videoTrack.play(videoContainerRef.current)
      }

      // Publish tracks
      await client.publish([videoTrack, audioTrack])
      console.log("Published video and audio tracks")

      setIsStreaming(true)
      setIsVideoEnabled(true)
      setIsAudioEnabled(true)
    } catch (err: any) {
      console.error("Error starting stream:", err)
      setError(err.message || "Failed to start stream")
      await cleanup()
    } finally {
      setIsLoading(false)
    }
  }

  const stopStream = async () => {
    setIsLoading(true)
    try {
      await cleanup()
      setIsStreaming(false)
      setIsVideoEnabled(false)
      setIsAudioEnabled(false)
      if (onStreamEnd) {
        onStreamEnd()
      }
    } catch (err: any) {
      console.error("Error stopping stream:", err)
      setError(err.message || "Failed to stop stream")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleVideo = async () => {
    if (localVideoTrackRef.current) {
      try {
        if (isVideoEnabled) {
          await localVideoTrackRef.current.setEnabled(false)
          setIsVideoEnabled(false)
        } else {
          await localVideoTrackRef.current.setEnabled(true)
          setIsVideoEnabled(true)
        }
      } catch (err: any) {
        console.error("Error toggling video:", err)
        setError(err.message || "Failed to toggle video")
      }
    }
  }

  const toggleAudio = async () => {
    if (localAudioTrackRef.current) {
      try {
        if (isAudioEnabled) {
          await localAudioTrackRef.current.setEnabled(false)
          setIsAudioEnabled(false)
        } else {
          await localAudioTrackRef.current.setEnabled(true)
          setIsAudioEnabled(true)
        }
      } catch (err: any) {
        console.error("Error toggling audio:", err)
        setError(err.message || "Failed to toggle audio")
      }
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Video Preview */}
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <div
          ref={videoContainerRef}
          className="w-full h-full"
        />
        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-white/70 space-y-2">
              <Video size={48} className="mx-auto opacity-50" />
              <p className="text-lg">Camera Preview</p>
              <p className="text-sm">Click Start Stream to begin broadcasting</p>
            </div>
          </div>
        )}

        {/* Connection Status */}
        {isStreaming && (
          <div className="absolute top-4 left-4 z-10">
            <div
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold",
                connectionState === "CONNECTED"
                  ? "bg-green-600 text-white"
                  : "bg-yellow-600 text-white"
              )}
            >
              {connectionState === "CONNECTED" ? "● LIVE" : "● CONNECTING..."}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {!isStreaming ? (
          <Button
            onClick={startStream}
            disabled={isLoading || !appId || !channelName || !token}
            className="bg-orange-600 hover:bg-orange-700 text-white"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Video className="w-5 h-5 mr-2" />
                Start Stream
              </>
            )}
          </Button>
        ) : (
          <>
            <Button
              onClick={toggleVideo}
              variant={isVideoEnabled ? "default" : "outline"}
              size="lg"
            >
              {isVideoEnabled ? (
                <Video className="w-5 h-5" />
              ) : (
                <VideoOff className="w-5 h-5" />
              )}
            </Button>
            <Button
              onClick={toggleAudio}
              variant={isAudioEnabled ? "default" : "outline"}
              size="lg"
            >
              {isAudioEnabled ? (
                <Mic className="w-5 h-5" />
              ) : (
                <MicOff className="w-5 h-5" />
              )}
            </Button>
            <Button
              onClick={stopStream}
              disabled={isLoading}
              variant="destructive"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Stopping...
                </>
              ) : (
                <>
                  <PhoneOff className="w-5 h-5 mr-2" />
                  End Stream
                </>
              )}
            </Button>
          </>
        )}
      </div>

      {/* Stream Info */}
      {isStreaming && (
        <div className="text-center text-sm text-muted-foreground">
          <p>Streaming to channel: {channelName}</p>
          <p>Status: {connectionState}</p>
        </div>
      )}
    </div>
  )
}

