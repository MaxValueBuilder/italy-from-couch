# Booking & Scheduling System - Implementation Guide

## Overview

The Booking & Scheduling System has been implemented with the following features:

1. ✅ Database schema for bookings and tour slots
2. ✅ API routes for booking operations
3. ✅ Calendar component with timezone support
4. ✅ Booking form component
5. ✅ Booking management UI
6. ✅ Timezone conversion utilities
7. ⏳ Email notification system (to be implemented)

## Database Collections

### Bookings Collection
Stores user bookings with the following structure:
```typescript
{
  id: string
  userId: string
  tourId: string
  guideId: string
  scheduledAt: Date
  timezone: string
  duration: number
  status: "pending" | "confirmed" | "cancelled" | "completed" | "live"
  streamRoomId?: string
  streamToken?: string
  createdAt: Date
  updatedAt: Date
  cancelledAt?: Date
  cancellationReason?: string
}
```

### Tour Slots Collection
Stores available time slots for tours:
```typescript
{
  id: string
  tourId: string
  guideId: string
  startTime: Date
  endTime: Date
  timezone: string
  maxParticipants: number
  bookedCount: number
  isAvailable: boolean
  createdAt: Date
  updatedAt: Date
}
```

## API Endpoints

### Bookings
- `GET /api/bookings` - Fetch bookings (supports userId, tourId, guideId, status query params)
- `GET /api/bookings/[id]` - Get single booking
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/[id]` - Update booking (cancel, reschedule)

### Tour Slots
- `GET /api/tours/[id]/slots` - Get available slots for a tour
- `POST /api/tours/[id]/slots` - Create time slot (admin/guide function)

## Components

### BookingCalendar
Location: `components/booking/booking-calendar.tsx`
- Displays calendar with available dates
- Shows time slots for selected date
- Handles timezone conversion
- Highlights selected slot

### BookingForm
Location: `components/booking/booking-form.tsx`
- Complete booking flow
- Integrates with BookingCalendar
- Handles authentication
- Shows success/error states

## Pages

### Booking Section
Location: Integrated into `/tours/[id]` page
- Booking form embedded in tour detail page
- Calendar and time slot selection
- Booking confirmation

### My Bookings Page
Route: `/bookings`
- View all user bookings
- Organized by status (upcoming, past, cancelled)
- Links to tour details and live streams

## Timezone Handling

The system uses `date-fns-tz` for timezone conversions:
- Automatically detects user's timezone
- Converts tour times to user's local time
- Displays both tour timezone and user timezone
- Supports all major timezones

## Usage

### Creating a Booking

1. User navigates to `/tours/[id]`
2. Scrolls to the booking section (right side of tour details)
3. Selects a date from the calendar
4. Chooses an available time slot
5. Clicks "Confirm Booking"
6. System creates booking and redirects to bookings page

### Managing Bookings

1. User navigates to `/bookings`
2. Views upcoming, past, and cancelled bookings
3. Can access tour details and join live streams

### Creating Tour Slots (Admin/Guide)

Use the API endpoint:
```javascript
POST /api/tours/[tourId]/slots
{
  "startTime": "2025-12-15T10:00:00Z",
  "endTime": "2025-12-15T11:30:00Z",
  "maxParticipants": 50,
  "timezone": "Europe/Rome"
}
```

## Next Steps

1. **Email Notifications**: Implement email service for:
   - Booking confirmations
   - Reminders (24h, 1h before)
   - Cancellation confirmations
   - Rescheduling confirmations

2. **Automated Slot Generation**: Create a system to automatically generate slots based on tour schedules

3. **Cancellation Rules**: Implement cancellation policies and refund logic

4. **Rescheduling**: Add UI for users to reschedule bookings

5. **Capacity Management**: Real-time updates when slots fill up

## Testing

To test the booking system:

1. Create a tour slot using the API
2. Navigate to the tour detail page
3. Click "Book This Tour"
4. Select a date and time slot
5. Confirm the booking
6. Check `/bookings` page to see your booking

## Notes

- All times are stored in UTC in the database
- Timezone information is preserved for display
- Bookings are validated to prevent double-booking
- Past slots are automatically filtered out
- Full slots are marked as unavailable

