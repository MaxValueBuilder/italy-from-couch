"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth/context"
import { createTour } from "@/lib/api/tours"
import { fetchGuideById } from "@/lib/api/guides"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, AlertCircle, Plus, X, ArrowLeft, ChevronUp, ChevronDown, Copy, Trash2 } from "lucide-react"
import { Guide } from "@/lib/data/guides"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { TimeSlot, WeeklyRecurrencePattern, OneTimeSlot } from "@/lib/data/tours"
import { getCityTimezone } from "@/lib/utils/timezone"

const CITIES = ["Rome", "Florence", "Venice"] as const
const DAYS_OF_WEEK = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
] as const

export default function CreateTourPage() {
  const router = useRouter()
  const { user, userInfo, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loadingGuide, setLoadingGuide] = useState(true)

  // Form state
  const [title, setTitle] = useState("")
  const [city, setCity] = useState<"Rome" | "Florence" | "Venice">("Rome")
  const [duration, setDuration] = useState<number>(60)
  const [description, setDescription] = useState("")
  const [itinerary, setItinerary] = useState("")
  const [startingPoint, setStartingPoint] = useState("")
  const [highlights, setHighlights] = useState<string[]>([""])
  const [images, setImages] = useState<string[]>([""])
  const [bookingDates, setBookingDates] = useState<string[]>([])
  const [details, setDetails] = useState({
    duration: "",
    language: "",
    groupSize: "",
    included: [""],
  })

  // Tour slots state
  const [recurrenceType, setRecurrenceType] = useState<"weekly" | "none">("none")
  const [maxParticipants, setMaxParticipants] = useState<number>(50)
  const [weeklyPattern, setWeeklyPattern] = useState<Record<number, TimeSlot[]>>({
    0: [], // Sunday
    1: [], // Monday
    2: [], // Tuesday
    3: [], // Wednesday
    4: [], // Thursday
    5: [], // Friday
    6: [], // Saturday
  })
  const [oneTimeSlots, setOneTimeSlots] = useState<OneTimeSlot[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [calendarOpen, setCalendarOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/guides/tours/new")
      return
    }

    // Check if user is a guide
    if (user && userInfo) {
      if (userInfo.guideId) {
        loadGuide()
      } else if (userInfo.role === "guide") {
        router.push("/guides/complete-profile")
      } else {
        router.push("/")
      }
    }
  }, [user, userInfo, authLoading, router])

  const loadGuide = async () => {
    if (!userInfo?.guideId) return

    try {
      setLoadingGuide(true)
      const guideData = await fetchGuideById(userInfo.guideId)
      setGuide(guideData)
    } catch (error) {
      console.error("Error loading guide:", error)
      setError("Failed to load guide information")
    } finally {
      setLoadingGuide(false)
    }
  }

  const handleAddHighlight = () => {
    setHighlights([...highlights, ""])
  }

  const handleRemoveHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index))
  }

  const handleHighlightChange = (index: number, value: string) => {
    const newHighlights = [...highlights]
    newHighlights[index] = value
    setHighlights(newHighlights)
  }

  const handleAddImage = () => {
    setImages([...images, ""])
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images]
    newImages[index] = value
    setImages(newImages)
  }

  const handleAddIncluded = () => {
    setDetails({ ...details, included: [...details.included, ""] })
  }

  const handleRemoveIncluded = (index: number) => {
    setDetails({ ...details, included: details.included.filter((_, i) => i !== index) })
  }

  const handleIncludedChange = (index: number, value: string) => {
    const newIncluded = [...details.included]
    newIncluded[index] = value
    setDetails({ ...details, included: newIncluded })
  }

  // Tour slots handlers - Weekly
  const handleAddTimeSlot = (dayOfWeek: number) => {
    setWeeklyPattern({
      ...weeklyPattern,
      [dayOfWeek]: [...(weeklyPattern[dayOfWeek] || []), { startTime: "10:00", endTime: "12:00" }],
    })
  }

  const handleRemoveTimeSlot = (dayOfWeek: number, slotIndex: number) => {
    setWeeklyPattern({
      ...weeklyPattern,
      [dayOfWeek]: weeklyPattern[dayOfWeek].filter((_, i) => i !== slotIndex),
    })
  }

  const handleTimeSlotChange = (dayOfWeek: number, slotIndex: number, field: "startTime" | "endTime", value: string) => {
    const newSlots = [...weeklyPattern[dayOfWeek]]
    newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value }
    setWeeklyPattern({ ...weeklyPattern, [dayOfWeek]: newSlots })
  }

  const handleCopyTimeSlot = (dayOfWeek: number, slotIndex: number) => {
    const slotToCopy = weeklyPattern[dayOfWeek][slotIndex]
    setWeeklyPattern({
      ...weeklyPattern,
      [dayOfWeek]: [...weeklyPattern[dayOfWeek], { ...slotToCopy }],
    })
  }

  // Tour slots handlers - One-time
  const handleAddDate = () => {
    if (selectedDate) {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      // Check if date already exists
      if (!oneTimeSlots.find((slot) => slot.date === dateStr)) {
        setOneTimeSlots([...oneTimeSlots, { date: dateStr, timeSlots: [{ startTime: "10:00", endTime: "12:00" }] }])
      }
      setSelectedDate(undefined)
      setCalendarOpen(false)
    }
  }

  const handleRemoveDate = (dateIndex: number) => {
    setOneTimeSlots(oneTimeSlots.filter((_, i) => i !== dateIndex))
  }

  const handleAddOneTimeSlot = (dateIndex: number) => {
    const newSlots = [...oneTimeSlots]
    newSlots[dateIndex].timeSlots.push({ startTime: "10:00", endTime: "12:00" })
    setOneTimeSlots(newSlots)
  }

  const handleRemoveOneTimeSlot = (dateIndex: number, slotIndex: number) => {
    const newSlots = [...oneTimeSlots]
    newSlots[dateIndex].timeSlots = newSlots[dateIndex].timeSlots.filter((_, i) => i !== slotIndex)
    setOneTimeSlots(newSlots)
  }

  const handleOneTimeSlotChange = (dateIndex: number, slotIndex: number, field: "startTime" | "endTime", value: string) => {
    const newSlots = [...oneTimeSlots]
    newSlots[dateIndex].timeSlots[slotIndex] = { ...newSlots[dateIndex].timeSlots[slotIndex], [field]: value }
    setOneTimeSlots(newSlots)
  }

  const handleCopyOneTimeSlot = (dateIndex: number, slotIndex: number) => {
    const newSlots = [...oneTimeSlots]
    const slotToCopy = newSlots[dateIndex].timeSlots[slotIndex]
    newSlots[dateIndex].timeSlots.push({ ...slotToCopy })
    setOneTimeSlots(newSlots)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!title.trim()) {
      setError("Title is required")
      return
    }

    if (!guide) {
      setError("Guide information not loaded")
      return
    }

    setLoading(true)

    try {
      // Prepare recurrence pattern for weekly
      let recurrencePattern: WeeklyRecurrencePattern | undefined = undefined
      if (recurrenceType === "weekly") {
        // Collect all unique time slots across all days
        const allTimeSlots: TimeSlot[] = []
        const daysWithSlots: number[] = []
        
        Object.entries(weeklyPattern).forEach(([dayStr, slots]) => {
          if (slots.length > 0) {
            const day = parseInt(dayStr)
            daysWithSlots.push(day)
            // Add unique time slots
            slots.forEach((slot) => {
              if (!allTimeSlots.find((s) => s.startTime === slot.startTime && s.endTime === slot.endTime)) {
                allTimeSlots.push(slot)
              }
            })
          }
        })

        if (daysWithSlots.length > 0 && allTimeSlots.length > 0) {
          recurrencePattern = {
            daysOfWeek: daysWithSlots,
            timeSlots: allTimeSlots,
            timezone: getCityTimezone(city),
          }
        }
      }

      // Prepare one-time slots
      const filteredOneTimeSlots = oneTimeSlots.filter(
        (slot) => slot.timeSlots.length > 0
      )

      const result = await createTour({
        title: title.trim(),
        city,
        duration,
        guide: guide.name,
        highlights: highlights.filter((h) => h.trim()).length > 0 
          ? highlights.filter((h) => h.trim()) 
          : undefined,
        images: images.filter((img) => img.trim()).length > 0 
          ? images.filter((img) => img.trim()) 
          : undefined,
        description: description.trim() || undefined,
        itinerary: itinerary.trim() || undefined,
        startingPoint: startingPoint.trim() || undefined,
        bookingDates: bookingDates.length > 0 ? bookingDates : undefined,
        details: {
          duration: details.duration.trim() || undefined,
          language: details.language.trim() || undefined,
          groupSize: details.groupSize.trim() || undefined,
          included: details.included.filter((i) => i.trim()).length > 0
            ? details.included.filter((i) => i.trim())
            : undefined,
        },
        // Tour slots configuration
        recurrenceType,
        recurrencePattern,
        oneTimeSlots: filteredOneTimeSlots.length > 0 ? filteredOneTimeSlots : undefined,
        maxParticipants,
        timezone: getCityTimezone(city),
      })

      if (result.success && result._id) {
        router.push(`/tours/${result._id}`)
      } else {
        setError(result.error || "Failed to create tour")
      }
    } catch (error: any) {
      console.error("Error creating tour:", error)
      setError(error.message || "Failed to create tour")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loadingGuide) {
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

  if (!user || !guide) {
    return null
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/guides/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Create New Tour</h1>
              <p className="text-muted-foreground">
                Add a new tour to your guide profile
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Tour Information</CardTitle>
                <CardDescription>
                  Provide the basic information about your tour
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Ancient Rome Walking Tour"
                    required
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Select value={city} onValueChange={(value) => setCity(value as typeof city)}>
                    <SelectTrigger id="city">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration">
                    Duration (minutes) <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="duration"
                        type="number"
                        min="15"
                        step="15"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                        className="pr-12 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        required
                      />
                      <div className="absolute right-0 top-0 bottom-0 flex flex-col border-l border-border rounded-r-md overflow-hidden">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-1/2 w-10 rounded-none hover:bg-muted/80 active:bg-muted"
                          onClick={() => setDuration((prev) => Math.min(1440, prev + 15))}
                          disabled={duration >= 1440}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <div className="border-t border-border" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-1/2 w-10 rounded-none hover:bg-muted/80 active:bg-muted"
                          onClick={() => setDuration((prev) => Math.max(15, prev - 15))}
                          disabled={duration <= 15}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your tour..."
                    rows={4}
                  />
                </div>

                {/* Highlights */}
                <div className="space-y-2">
                  <Label>Highlights</Label>
                  <div className="space-y-2">
                    {highlights.map((highlight, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={highlight}
                          onChange={(e) => handleHighlightChange(index, e.target.value)}
                          placeholder={`Highlight ${index + 1}`}
                        />
                        {highlights.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveHighlight(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddHighlight}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Highlight
                    </Button>
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-2">
                  <Label>Image URLs</Label>
                  <div className="space-y-2">
                    {images.map((image, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="url"
                          value={image}
                          onChange={(e) => handleImageChange(index, e.target.value)}
                          placeholder={`Image URL ${index + 1}`}
                        />
                        {images.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddImage}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Image
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
                <CardDescription>
                  Optional information about your tour
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Itinerary */}
                <div className="space-y-2">
                  <Label htmlFor="itinerary">Itinerary</Label>
                  <Textarea
                    id="itinerary"
                    value={itinerary}
                    onChange={(e) => setItinerary(e.target.value)}
                    placeholder="Detailed itinerary description..."
                    rows={4}
                  />
                </div>

                {/* Starting Tour Point */}
                <div className="space-y-2">
                  <Label htmlFor="startingPoint">Starting Point</Label>
                  <Input
                    id="startingPoint"
                    value={startingPoint}
                    onChange={(e) => setStartingPoint(e.target.value)}
                    placeholder="e.g., Piazza Navona, Rome"
                  />
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="details-duration">Duration (text)</Label>
                    <Input
                      id="details-duration"
                      value={details.duration}
                      onChange={(e) => setDetails({ ...details, duration: e.target.value })}
                      placeholder="e.g., 2-2.5 hours"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="details-language">Language</Label>
                    <Select
                      value={details.language}
                      onValueChange={(value) => setDetails({ ...details, language: value })}
                    >
                      <SelectTrigger id="details-language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Italian">Italian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="details-groupSize">Group Size</Label>
                    <Input
                      id="details-groupSize"
                      value={details.groupSize}
                      onChange={(e) => setDetails({ ...details, groupSize: e.target.value })}
                      placeholder="e.g., Max 15 participants"
                    />
                  </div>
                </div>

                {/* Included */}
                <div className="space-y-2">
                  <Label>What's Included</Label>
                  <div className="space-y-2">
                    {details.included.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => handleIncludedChange(index, e.target.value)}
                          placeholder={`Included item ${index + 1}`}
                        />
                        {details.included.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveIncluded(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddIncluded}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tour Slots Configuration */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Tour Slots</CardTitle>
                <CardDescription>
                  Configure when your tour is available for booking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Recurrence Type */}
                <div className="space-y-2">
                  <Label>Repeat</Label>
                  <Select value={recurrenceType} onValueChange={(value) => setRecurrenceType(value as "weekly" | "none")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Does not repeat</SelectItem>
                      <SelectItem value="weekly">Repeat weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Max Participants */}
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants per Slot</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="maxParticipants"
                        type="number"
                        min="1"
                        max="1000"
                        value={maxParticipants}
                        onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 50)}
                        className="pr-12 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        required
                      />
                      <div className="absolute right-0 top-0 bottom-0 flex flex-col border-l border-border rounded-r-md overflow-hidden">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-1/2 w-10 rounded-none hover:bg-muted/80 active:bg-muted"
                          onClick={() => setMaxParticipants((prev) => Math.min(1000, prev + 1))}
                          disabled={maxParticipants >= 1000}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <div className="border-t border-border" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-1/2 w-10 rounded-none hover:bg-muted/80 active:bg-muted"
                          onClick={() => setMaxParticipants((prev) => Math.max(1, prev - 1))}
                          disabled={maxParticipants <= 1}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly Pattern */}
                {recurrenceType === "weekly" && (
                  <div className="space-y-4">
                    <Label>Weekly Schedule</Label>
                    <div className="space-y-4">
                      {DAYS_OF_WEEK.map((day) => {
                        const daySlots = weeklyPattern[day.value] || []
                        return (
                          <div key={day.value} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="font-medium">{day.label}</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddTimeSlot(day.value)}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Time Slot
                              </Button>
                            </div>
                            {daySlots.length > 0 && (
                              <div className="space-y-2 pl-4">
                                {daySlots.map((slot, slotIndex) => (
                                  <div key={slotIndex} className="flex items-center gap-2">
                                    <Input
                                      type="time"
                                      value={slot.startTime}
                                      onChange={(e) => handleTimeSlotChange(day.value, slotIndex, "startTime", e.target.value)}
                                      className="w-32"
                                    />
                                    <span className="text-muted-foreground">-</span>
                                    <Input
                                      type="time"
                                      value={slot.endTime}
                                      onChange={(e) => handleTimeSlotChange(day.value, slotIndex, "endTime", e.target.value)}
                                      className="w-32"
                                    />
                                    <div className="flex gap-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleCopyTimeSlot(day.value, slotIndex)}
                                        title="Copy time slot"
                                      >
                                        <Copy className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        onClick={() => handleRemoveTimeSlot(day.value, slotIndex)}
                                        title="Remove time slot"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* One-Time Slots */}
                {recurrenceType === "none" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Specific Dates</Label>
                      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Add a date
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                          <div className="p-3 border-t">
                            <Button
                              type="button"
                              className="w-full"
                              onClick={handleAddDate}
                              disabled={!selectedDate}
                            >
                              Add Date
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {oneTimeSlots.length > 0 && (
                      <div className="space-y-4">
                        {oneTimeSlots.map((dateSlot, dateIndex) => (
                          <div key={dateIndex} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="font-medium">
                                {format(new Date(dateSlot.date), "MMM d, yyyy")}
                              </Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleRemoveDate(dateIndex)}
                                title="Remove date"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {dateSlot.timeSlots.map((slot, slotIndex) => (
                                <div key={slotIndex} className="flex items-center gap-2">
                                  <Input
                                    type="time"
                                    value={slot.startTime}
                                    onChange={(e) => handleOneTimeSlotChange(dateIndex, slotIndex, "startTime", e.target.value)}
                                    className="w-32"
                                  />
                                  <span className="text-muted-foreground">-</span>
                                  <Input
                                    type="time"
                                    value={slot.endTime}
                                    onChange={(e) => handleOneTimeSlotChange(dateIndex, slotIndex, "endTime", e.target.value)}
                                    className="w-32"
                                  />
                                  <div className="flex gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleCopyOneTimeSlot(dateIndex, slotIndex)}
                                      title="Copy time slot"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                      onClick={() => handleRemoveOneTimeSlot(dateIndex, slotIndex)}
                                      title="Remove time slot"
                                      disabled={dateSlot.timeSlots.length === 1}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddOneTimeSlot(dateIndex)}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Time Slot
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/guides/dashboard")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Tour"
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
