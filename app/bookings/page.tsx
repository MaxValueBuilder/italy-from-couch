"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth/context"
import { fetchUserBookings, cancelBooking } from "@/lib/api/bookings"
import { fetchTourById } from "@/lib/api/tours"
import { Booking } from "@/lib/data/bookings"
import { Tour } from "@/lib/data/tours"
import { formatWithTimezone, convertTourTimeToUserTime, getUserTimezone } from "@/lib/utils/timezone"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Clock, MapPin, Calendar, Loader2, X } from "lucide-react"
import Link from "next/link"

export default function BookingsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [tours, setTours] = useState<Record<string, Tour>>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login?redirect=/bookings")
        return
      }

      async function loadBookings() {
        try {
          const userBookings = await fetchUserBookings(user!.uid)
          setBookings(userBookings)

          // Load tour details for each booking
          const tourPromises = userBookings.map((booking) =>
            fetchTourById(booking.tourId).then((tour) => ({ tourId: booking.tourId, tour }))
          )
          const tourResults = await Promise.all(tourPromises)
          const toursMap: Record<string, Tour> = {}
          tourResults.forEach(({ tourId, tour }) => {
            if (tour) toursMap[tourId] = tour
          })
          setTours(toursMap)
        } catch (error) {
          console.error("Error loading bookings:", error)
        } finally {
          setLoading(false)
        }
      }

      loadBookings()
    }
  }, [user, authLoading, router])

  const handleCancelClick = (booking: Booking, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setBookingToCancel(booking)
    setCancelDialogOpen(true)
  }

  const handleCancelConfirm = async () => {
    if (!bookingToCancel || !user) return

    try {
      setCancelling(true)
      await cancelBooking(bookingToCancel._id, "Cancelled by user")
      
      // Reload bookings and tour details
      const userBookings = await fetchUserBookings(user.uid)
      setBookings(userBookings)

      // Reload tour details for each booking
      const tourPromises = userBookings.map((booking) =>
        fetchTourById(booking.tourId).then((tour) => ({ tourId: booking.tourId, tour }))
      )
      const tourResults = await Promise.all(tourPromises)
      const toursMap: Record<string, Tour> = {}
      tourResults.forEach(({ tourId, tour }) => {
        if (tour) toursMap[tourId] = tour
      })
      setTours(toursMap)
      
      setCancelDialogOpen(false)
      setBookingToCancel(null)
      
      // Switch to cancelled tab if not already there
      setActiveTab("cancelled")
    } catch (error) {
      console.error("Error cancelling booking:", error)
      alert("Failed to cancel booking. Please try again.")
    } finally {
      setCancelling(false)
    }
  }

  if (authLoading || loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </>
    )
  }

  const upcomingBookings = bookings.filter(
    (booking) =>
      booking.status === "confirmed" &&
      new Date(booking.scheduledAt) > new Date()
  )
  const pastBookings = bookings.filter(
    (booking) =>
      booking.status === "completed" ||
      (booking.status === "confirmed" && new Date(booking.scheduledAt) <= new Date())
  )
  const cancelledBookings = bookings.filter((booking) => booking.status === "cancelled")

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100"
      case "cancelled":
        return "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100"
      case "completed":
        return "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
      case "live":
        return "bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100"
      default:
        return "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
    }
  }

  const renderBookingCard = (booking: Booking) => {
    const tour = tours[booking.tourId]
    const userTimezone = getUserTimezone()
    const scheduledDate = new Date(booking.scheduledAt)
    const userLocalTime = convertTourTimeToUserTime(
      scheduledDate,
      booking.timezone,
      userTimezone
    )

    const tourImage = tour?.images && tour.images.length > 0 
      ? tour.images[0] 
      : "/placeholder.svg"

    return (
      <Link
        key={booking._id}
        href={`/tours/${booking.tourId}`}
        className="block p-6 bg-card border border-border rounded-lg space-y-4 hover:border-orange-600 transition-colors cursor-pointer group"
      >
        <div className="flex gap-6">
          {/* Tour Image */}
          <div className="flex-shrink-0 w-64 h-64 md:w-56 md:h-64 rounded-lg overflow-hidden bg-muted">
            <img
              src={tourImage}
              alt={tour?.title || "Tour image"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Booking Info */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl font-bold group-hover:text-orange-600 transition-colors">
                      {tour?.title || "Tour not found"}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status.toUpperCase()}
                    </span>
                  </div>
                  {tour && (
                    <p className="text-muted-foreground mb-4 line-clamp-3">{tour.description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Scheduled Time</p>
                  <p className="font-semibold">
                    {formatWithTimezone(scheduledDate, booking.timezone, true)}
                  </p>
                  {userTimezone !== booking.timezone && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Your time: {formatWithTimezone(userLocalTime, userTimezone, true)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock size={18} className="text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">{booking.duration} minutes</p>
                </div>
              </div>

              {tour && (
                <>
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">City</p>
                      <p className="font-semibold">{tour.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Guide:</span>
                    <p className="font-semibold">{tour.guide}</p>
                  </div>
                </>
              )}
              </div>
            </div>

            {booking.status === "confirmed" && new Date(booking.scheduledAt) > new Date() && (
              <div className="pt-4 border-t border-border mt-auto flex items-center gap-3">
                {booking.streamRoomId && (
                  <Link 
                    href={`/tours/${booking.tourId}/live`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1"
                  >
                    <Button className="w-full bg-orange-600 hover:bg-orange-700">
                      Join Live Tour
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleCancelClick(booking, e)}
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 px-3 py-1.5 h-auto"
                >
                  <X size={14} className="mr-1.5" />
                  <span className="text-sm">Cancel</span>
                </Button>
              </div>
            )}

            {booking.status === "cancelled" && booking.cancellationReason && (
              <div className="pt-4 border-t border-border mt-auto">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Cancellation reason:</span>{" "}
                  {booking.cancellationReason}
                </p>
              </div>
            )}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <>
      <Header />
      <main className="bg-background min-h-screen">
        <section className="py-8 md:py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My Bookings</h1>
              <p className="text-muted-foreground">
                Manage your upcoming and past tour bookings
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6 w-full bg-muted/50 p-1 h-12">
                <TabsTrigger 
                  value="upcoming" 
                  className="text-base font-semibold data-[state=active]:!bg-orange-600 data-[state=active]:!text-white data-[state=active]:!border-transparent data-[state=active]:shadow-none"
                >
                  Upcoming ({upcomingBookings.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="past" 
                  className="text-base font-semibold data-[state=active]:!bg-orange-600 data-[state=active]:!text-white data-[state=active]:!border-transparent data-[state=active]:shadow-none"
                >
                  Past ({pastBookings.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="cancelled" 
                  className="text-base font-semibold data-[state=active]:!bg-orange-600 data-[state=active]:!text-white data-[state=active]:!border-transparent data-[state=active]:shadow-none"
                >
                  Cancelled ({cancelledBookings.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="mt-0">
                {upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingBookings.map(renderBookingCard)}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No upcoming bookings.</p>
                    <Link href="/tours">
                      <Button>Browse Tours</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="past" className="mt-0">
                {pastBookings.length > 0 ? (
                  <div className="space-y-4">
                    {pastBookings.map(renderBookingCard)}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No past bookings.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="cancelled" className="mt-0">
                {cancelledBookings.length > 0 ? (
                  <div className="space-y-4">
                    {cancelledBookings.map(renderBookingCard)}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No cancelled bookings.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

  
          </div>
        </section>
      </main>
      <Footer />

      {/* Cancel Booking Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
              {bookingToCancel && tours[bookingToCancel.tourId] && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="font-semibold">{tours[bookingToCancel.tourId].title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatWithTimezone(
                      new Date(bookingToCancel.scheduledAt),
                      bookingToCancel.timezone,
                      true
                    )}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {cancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel Booking"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

