"use client"

import { useEffect, useState } from "react"
import { Play, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"

import { EmojiReactions } from "./emoji-reactions"

// Dynamically import AgoraViewer to prevent SSR (Agora SDK requires browser APIs)
const AgoraViewer = dynamic(() => import("./agora-viewer").then((mod) => ({ default: mod.AgoraViewer })), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
      <div className="text-center text-white/70 space-y-2">
        <Loader2 className="w-12 h-12 mx-auto animate-spin" />
        <p className="text-lg">Loading stream...</p>
      </div>
    </div>
  ),
})

interface VideoPlayerProps {
  streamUrl?: string
  streamType?: "youtube" | "twitch" | "agora" | "custom"
  isLive?: boolean
  title?: string
  thumbnail?: string // Optional thumbnail image
  // Agora-specific props
  bookingId?: string
  userId?: string
  // Level 3 Fallback
  fallbackUrl?: string // URL to pre-recorded clip for stalls
}

export function VideoPlayer({
  streamUrl,
  streamType = "youtube",
  isLive = false,
  title,
  thumbnail,
  bookingId,
  userId,
  fallbackUrl,
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showFallback, setShowFallback] = useState(false)
  const [stallTimer, setStallTimer] = useState<NodeJS.Timeout | null>(null)
  const [agoraConfig, setAgoraConfig] = useState<{
    appId: string
    channelName: string
    token: string
    fallbackUrl?: string
  } | null>(null)

  // Level 3: Handle stream stall with a timer to switch to fallback
  const handleStreamStall = (stalled: boolean) => {
    if (stalled) {
      // Start a 10-second timer to show fallback if stream doesn't recover
      const timer = setTimeout(() => {
        if (fallbackUrl || agoraConfig?.fallbackUrl) {
          setShowFallback(true)
        }
      }, 10000)
      setStallTimer(timer)
    } else {
      // Stream recovered
      if (stallTimer) {
        clearTimeout(stallTimer)
        setStallTimer(null)
      }
      setShowFallback(false)
    }
  }

  // Fetch Agora stream configuration
  useEffect(() => {
    if (streamType === "agora" && bookingId) {
      fetchAgoraStreamConfig()
    }
  }, [streamType, bookingId, userId])

  const fetchAgoraStreamConfig = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/streams/${bookingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "subscriber",
          userId: userId || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to fetch stream configuration")
      }

      const data = await response.json()
      if (data.success && data.appId && data.channelName && data.token) {
        setAgoraConfig({
          appId: data.appId,
          channelName: data.channelName,
          token: data.token,
          fallbackUrl: data.fallbackUrl,
        })
      } else {
        throw new Error("Invalid stream configuration")
      }
    } catch (error: any) {
      console.error("Error fetching Agora config:", error)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (streamType !== "agora") {
      setIsLoading(true)
      setHasError(false)
      setIsPlaying(false)
    }
  }, [streamUrl, streamType])

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  // Extract YouTube Live stream ID or channel ID
  const getYouTubeLiveId = (url: string): string | null => {
    if (!url) return null
    // Handle different YouTube URL formats
    if (url.includes("youtube.com/live/")) {
      const match = url.match(/youtube\.com\/live\/([^?&]+)/)
      return match ? match[1] : null
    }
    if (url.includes("youtube.com/watch?v=")) {
      return getYouTubeVideoId(url)
    }
    if (url.includes("youtu.be/")) {
      return getYouTubeVideoId(url)
    }
    return null
  }

  // For Agora streams, we don't need streamUrl - we need bookingId
  // For other stream types, we need streamUrl
  if (streamType !== "agora" && !streamUrl) {
    return (
      <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
        <div className="text-center text-white/70 space-y-2">
          <Play size={48} className="mx-auto opacity-50" />
          <p className="text-lg">No stream available</p>
          <p className="text-sm">Stream will start at the scheduled time</p>
        </div>
      </div>
    )
  }

  // For Agora streams without bookingId, show message
  if (streamType === "agora" && !bookingId) {
    return (
      <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
        <div className="text-center text-white/70 space-y-2">
          <Play size={48} className="mx-auto opacity-50" />
          <p className="text-lg">No stream available</p>
          <p className="text-sm">Stream will start at the scheduled time</p>
        </div>
      </div>
    )
  }

  if (streamType === "youtube") {
    if (!streamUrl) {
      return (
        <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
          <div className="text-center text-white/70">
            <p className="text-lg">Invalid stream URL</p>
          </div>
        </div>
      )
    }
    const videoId = getYouTubeLiveId(streamUrl)

    if (!videoId) {
      return (
        <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
          <div className="text-center text-white/70">
            <p className="text-lg">Invalid stream URL</p>
          </div>
        </div>
      )
    }

    // YouTube thumbnail URL
    const thumbnailUrl = thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

    // YouTube Live embed URL (without autoplay)
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=0&rel=0&modestbranding=1`

    // Show play button overlay if not playing yet
    if (!isPlaying) {
      return (
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative group cursor-pointer">
          {/* Thumbnail */}
          <img
            src={thumbnailUrl}
            alt={title || "Tour thumbnail"}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to black background if thumbnail fails
              e.currentTarget.style.display = "none"
            }}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
          {/* Play button */}
          <button
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex items-center justify-center z-10 group/play"
            aria-label="Play video"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 bg-background/60 rounded-full flex items-center justify-center shadow-2xl group-hover/play:bg-background/80 group-hover/play:scale-110 transition-all duration-300">
              <Play size={32} className="text-foreground dark:text-white ml-1 fill-foreground dark:fill-white" />
            </div>
          </button>
          {/* Live indicator on thumbnail */}
          {isLive && (
            <div className="absolute top-4 left-4 z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-semibold">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span>LIVE</span>
              </div>
            </div>
          )}
        </div>
      )
    }

    // Show video player after play button is clicked
    return (
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
          title={title || "Live Tour Stream"}
        />
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
            <div className="text-center text-white">
              <p className="text-lg mb-2">Unable to load stream</p>
              <p className="text-sm text-white/70">Please check back later</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Agora streaming
  if (streamType === "agora") {
    if (isLoading) {
      return (
        <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
          <div className="text-center text-white/70 space-y-2">
            <Loader2 className="w-12 h-12 mx-auto animate-spin" />
            <p className="text-lg">Loading stream...</p>
          </div>
        </div>
      )
    }

    if (hasError || !agoraConfig) {
      return (
        <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
          <div className="text-center text-white/70 space-y-2">
            <p className="text-lg">Unable to load stream</p>
            <p className="text-sm">Stream may not be active or configuration is missing</p>
          </div>
        </div>
      )
    }

    // Level 3 Fallback Content
    if (showFallback && (fallbackUrl || agoraConfig.fallbackUrl)) {
      return (
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative">
          <video
            src={fallbackUrl || agoraConfig.fallbackUrl}
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span>STABILIZING SIGNAL...</span>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 z-10">
            <p className="text-[10px] text-white/50 bg-black/40 px-2 py-1 rounded">
              You are watching a recorded clip while we restore the live feed.
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="relative w-full aspect-video">
        <AgoraViewer
          appId={agoraConfig.appId}
          channelName={agoraConfig.channelName}
          token={agoraConfig.token}
          onStreamStalled={handleStreamStall}
        />
        <EmojiReactions />
      </div>
    )
  }

  // For custom streaming or other services
  return (
    <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
      <div className="text-center text-white/70">
        <p className="text-lg">Custom streaming not yet configured</p>
        <p className="text-sm mt-2">Stream URL: {streamUrl}</p>
      </div>
    </div>
  )
}

