"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth/context"
import { fetchGuideBookings } from "@/lib/api/guides"
import { fetchTourById } from "@/lib/api/tours"
import { startStream, endStream, getStreamInfo } from "@/lib/api/streams"
import { Booking } from "@/lib/data/bookings"
import { Tour } from "@/lib/data/tours"
import dynamic from "next/dynamic"

// Dynamically import GuideBroadcast to prevent SSR (Agora SDK requires browser APIs)
const GuideBroadcast = dynamic(() => import("@/components/streaming/guide-broadcast").then((mod) => ({ default: mod.GuideBroadcast })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  ),
})
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatWithTimezone, getUserTimezone } from "@/lib/utils/timezone"
import { Calendar, Clock, MapPin, Video, VideoOff, Loader2 } from "lucide-react"
import { format } from "date-fns"

export default function GuideDashboardPage() {
  const router = useRouter()
  const { user, userInfo, loading: authLoading } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [tours, setTours] = useState<Record<string, Tour>>({})
  const [loading, setLoading] = useState(true)
  const [activeStream, setActiveStream] = useState<{
    bookingId: string
    appId: string
    channelName: string
    token: string
  } | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/guides/dashboard")
      return
    }

    // Check if user is a guide
    // Use guideId as the definitive indicator (more reliable than role field)
    if (user && userInfo) {
      // If user has a guideId, they are a guide (regardless of role field)
      if (userInfo.guideId) {
        // Guide has profile, load bookings
        loadBookings()
        return
      }
      
      // If user doesn't have guideId but has role "guide", they need to complete profile
      if (userInfo.role === "guide") {
        router.push("/guides/complete-profile")
        return
      }
      
      // User is not a guide, redirect to home
      router.push("/")
      return
    }
  }, [user, userInfo, authLoading, router])

  const loadBookings = async () => {
    try {
      setLoading(true)
      
      // Get guideId from userInfo (guide's _id from guides collection)
      if (!userInfo?.guideId) {
        console.error("Guide ID not found. Redirecting to complete profile.")
        router.push("/guides/complete-profile")
        return
      }
      
      // Fetch bookings for this guide using guide's _id
      const guideBookings = await fetchGuideBookings(userInfo.guideId)
      setBookings(guideBookings)

      // Load tour details for each booking
      const tourPromises = guideBookings.map(async (booking: Booking) => {
        try {
          const tour = await fetchTourById(booking.tourId)
          return { bookingId: booking._id, tour }
        } catch (error) {
          console.error(`Error loading tour for booking ${booking._id}:`, error)
          return null
        }
      })

      const tourResults = await Promise.all(tourPromises)
      const toursMap: Record<string, Tour> = {}
      tourResults.forEach((result) => {
        if (result && result.tour) {
          toursMap[result.bookingId] = result.tour
        }
      })
      setTours(toursMap)
    } catch (error) {
      console.error("Error loading bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartStream = async (bookingId: string) => {
    try {
      const result = await startStream(bookingId, user!.uid)
      setActiveStream({
        bookingId,
        appId: result.appId,
        channelName: result.channelName,
        token: result.token,
      })
      // Refresh bookings to update status
      await loadBookings()
    } catch (error: any) {
      console.error("Error starting stream:", error)
      alert(error.message || "Failed to start stream")
    }
  }

  const handleEndStream = async () => {
    if (!activeStream) return

    try {
      await endStream(activeStream.bookingId, user!.uid)
      setActiveStream(null)
      // Refresh bookings to update status
      await loadBookings()
    } catch (error: any) {
      console.error("Error ending stream:", error)
      alert(error.message || "Failed to end stream")
    }
  }

  const upcomingBookings = bookings.filter(
    (booking) =>
      booking.status === "confirmed" || booking.status === "pending"
  )
  const activeBookings = bookings.filter((booking) => booking.status === "live")

  if (authLoading || loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </main>
        <Footer />
      </>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Guide Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your tour bookings and start live streams
            </p>
          </div>

          {/* Active Stream */}
          {activeStream && (
            <Card>
              <CardHeader>
                <CardTitle>Live Stream</CardTitle>
                <CardDescription>
                  Currently broadcasting to viewers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GuideBroadcast
                  appId={activeStream.appId}
                  channelName={activeStream.channelName}
                  token={activeStream.token}
                  onStreamEnd={handleEndStream}
                />
              </CardContent>
            </Card>
          )}

          {/* Active Bookings */}
          {activeBookings.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Active Streams</h2>
              <div className="grid gap-4">
                {activeBookings.map((booking) => {
                  const tour = tours[booking._id]
                  return (
                    <Card key={booking._id}>
                      <CardHeader>
                        <CardTitle>{tour?.title || "Tour"}</CardTitle>
                        <CardDescription>
                          Stream is currently active
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar size={16} />
                            <span>
                              {format(
                                new Date(booking.scheduledAt),
                                "EEEE, MMMM d, yyyy"
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock size={16} />
                            <span>
                              {formatWithTimezone(
                                new Date(booking.scheduledAt),
                                booking.timezone,
                                false
                              )}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Upcoming Bookings */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Upcoming Tours</h2>
            {upcomingBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No upcoming bookings scheduled
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {upcomingBookings.map((booking) => {
                  const tour = tours[booking._id]
                  const isStreaming = activeStream?.bookingId === booking._id

                  return (
                    <Card key={booking._id}>
                      <CardHeader>
                        <CardTitle>{tour?.title || "Tour"}</CardTitle>
                        <CardDescription>
                          {tour?.city && (
                            <div className="flex items-center gap-2 mt-2">
                              <MapPin size={16} />
                              <span>{tour.city}</span>
                            </div>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar size={16} />
                            <span>
                              {format(
                                new Date(booking.scheduledAt),
                                "EEEE, MMMM d, yyyy"
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock size={16} />
                            <span>
                              {formatWithTimezone(
                                new Date(booking.scheduledAt),
                                booking.timezone,
                                false
                              )}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Duration: {booking.duration} minutes
                          </div>
                        </div>

                        {!isStreaming && (
                          <Button
                            onClick={() => handleStartStream(booking._id)}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                            size="lg"
                          >
                            <Video className="w-5 h-5 mr-2" />
                            Start Stream
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

