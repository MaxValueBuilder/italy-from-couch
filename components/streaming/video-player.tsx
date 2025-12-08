"use client"

import { useEffect, useState } from "react"
import { Play, Loader2 } from "lucide-react"

interface VideoPlayerProps {
  streamUrl?: string
  streamType?: "youtube" | "twitch" | "custom"
  isLive?: boolean
  title?: string
  thumbnail?: string // Optional thumbnail image
}

export function VideoPlayer({
  streamUrl,
  streamType = "youtube",
  isLive = false,
  title,
  thumbnail,
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    setIsPlaying(false)
  }, [streamUrl])

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

  if (!streamUrl) {
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

