"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { TourSlot } from "@/lib/data/bookings"
import { fetchTourSlots } from "@/lib/api/tour-slots"
import { format, isSameDay, startOfDay } from "date-fns"
import { formatWithTimezone, getUserTimezone, convertTourTimeToUserTime } from "@/lib/utils/timezone"
import { Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BookingCalendarProps {
  tourId: string
  tourTimezone: string
  onSlotSelect: (slot: TourSlot | null) => void
  selectedSlot?: TourSlot | null
}

export function BookingCalendar({
  tourId,
  tourTimezone,
  onSlotSelect,
  selectedSlot,
}: BookingCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [slots, setSlots] = useState<TourSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDateSlots, setSelectedDateSlots] = useState<TourSlot[]>([])
  const userTimezone = getUserTimezone()

  useEffect(() => {
    async function loadSlots() {
      try {
        setLoading(true)
        const startDate = new Date()
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + 30) // Next 30 days

        const fetchedSlots = await fetchTourSlots(
          tourId,
          startDate.toISOString(),
          endDate.toISOString()
        )
        setSlots(fetchedSlots)
      } catch (error) {
        console.error("Error loading slots:", error)
      } finally {
        setLoading(false)
      }
    }
    loadSlots()
  }, [tourId])

  useEffect(() => {
    if (date) {
      const daySlots = slots.filter((slot) => {
        const slotDate = new Date(slot.startTime)
        return isSameDay(slotDate, date)
      })
      setSelectedDateSlots(daySlots.sort((a, b) => {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      }))
    } else {
      setSelectedDateSlots([])
    }
  }, [date, slots])

  // Get dates with available slots
  const datesWithSlots = slots.map((slot) => startOfDay(new Date(slot.startTime)))

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={(date) => {
            const dateStart = startOfDay(date)
            return !datesWithSlots.some((slotDate) => isSameDay(slotDate, dateStart))
          }}
          className="rounded-md border w-full border-orange-500 dark:border-orange-600"
          classNames={{
            today: "font-semibold  border-orange-500 dark:text-white ",
          }}
        />
      </div>

      {/* Time Slots */}
      <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading available slots...</p>
            </div>
          ) : !date ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Select a date to see available time slots</p>
            </div>
          ) : selectedDateSlots.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No available slots for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">
                Available times for {date && format(date, "EEEE, MMMM d, yyyy")}
              </h3>
              <div className="space-y-3">
                {selectedDateSlots.map((slot) => {
                  const slotStart = new Date(slot.startTime)
                  const userLocalTime = convertTourTimeToUserTime(
                    slotStart,
                    tourTimezone,
                    userTimezone
                  )
                  const isSelected = selectedSlot?._id === slot._id
                  const isFull = slot.bookedCount >= slot.maxParticipants

                  const handleSlotClick = () => {
                    if (isFull) return
                    // Toggle selection: if already selected, deselect; otherwise, select
                    if (isSelected) {
                      onSlotSelect(null) // Deselect
                    } else {
                      onSlotSelect(slot) // Select
                    }
                  }

                  return (
                    <button
                      key={slot._id}
                      onClick={handleSlotClick}
                      disabled={isFull}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all w-full",
                        isSelected
                          ? "border-orange-600 bg-orange-50 dark:bg-orange-950"
                          : "border-border hover:border-orange-300",
                        isFull && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center justify-between gap-4">
                        {/* Left side: Tour time */}
                        <div className="flex flex-1 items-center gap-2">
                          <Clock size={18} className="text-muted-foreground flex-shrink-0" />
                          <span className="font-semibold text-base">
                            {formatWithTimezone(slotStart, tourTimezone, false)}
                          </span>
                        </div>

                        {/* Right side: Your time and spots available */}
                        <div className="flex flex-[2] flex-col items-end justify-center gap-1 text-right">
                          {userTimezone !== tourTimezone && (
                            <p className="text-sm text-muted-foreground">
                              Your time: {formatWithTimezone(userLocalTime, userTimezone, false)}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users size={14} className="flex-shrink-0" />
                            <span>
                              {slot.maxParticipants - slot.bookedCount} of {slot.maxParticipants}{" "}
                              spots available
                            </span>
                          </div>
                          {isFull && (
                            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                              Fully booked
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
      </div>
    </div>
  )
}

