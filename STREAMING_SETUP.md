# Streaming Setup Guide

## Overview
This project now includes live streaming functionality for tours. The system is set up to support YouTube Live streaming (recommended for MVP) and can be extended to other services.

## Current Setup

### Rome Tours (MVP - 2-3 tours)
1. **Rome: Ancient Wonders Walk** (Marco)
   - Schedule: Daily at 10:00 AM & 4:00 PM (CET)
   - Duration: 90 minutes

2. **Rome: Trastevere Food & Culture** (Elena)
   - Schedule: Daily at 12:00 PM (CET)
   - Duration: 90 minutes

3. **Rome: Historic Center & Hidden Gems** (Giovanni)
   - Schedule: Daily at 2:00 PM (CET)
   - Duration: 75 minutes

## How to Add a Stream URL

### For YouTube Live:
1. Create a YouTube Live stream (via YouTube Studio)
2. Get the stream URL (format: `https://www.youtube.com/live/VIDEO_ID` or `https://youtube.com/watch?v=VIDEO_ID`)
3. Update the tour in `lib/data/tours.ts`:
   ```typescript
   {
     id: "rome-ancient",
     // ... other fields
     streamUrl: "https://www.youtube.com/live/YOUR_VIDEO_ID",
     isLive: true, // Set to true when stream is active
     streamType: "youtube",
   }
   ```

### Setting a Tour as Live:
Simply set `isLive: true` in the tour data when the stream starts, and `isLive: false` when it ends.

## Components Created

1. **VideoPlayer** (`components/streaming/video-player.tsx`)
   - Handles YouTube Live embedding
   - Shows loading states
   - Handles errors gracefully

2. **LiveBadge** (`components/streaming/live-badge.tsx`)
   - Animated "LIVE" badge
   - Only shows when `isLive: true`

3. **Tour Detail Page** (`app/tours/[id]/page.tsx`)
   - Full tour page with video player
   - Tour information sidebar
   - Related tours section

## Features

- ✅ Live streaming support (YouTube Live)
- ✅ Live indicators on tour cards
- ✅ Tour detail pages with embedded video player
- ✅ Responsive design
- ✅ Error handling for missing streams
- ✅ Schedule display
- ✅ Tour descriptions

## Next Steps for Production

1. **Automate Live Status**: Create an API endpoint or use webhooks to automatically update `isLive` status
2. **Stream Management**: Add admin panel to start/stop streams
3. **Notifications**: Notify users when tours go live
4. **Recording**: Save stream recordings for later viewing
5. **Chat**: Add live chat functionality (optional)

## Testing

To test the streaming:
1. Set `isLive: true` for a tour
2. Add a YouTube Live URL to `streamUrl`
3. Visit `/tours/[tour-id]` to see the video player
4. The "LIVE" badge will appear on tour cards

## Notes

- Currently uses YouTube Live (easiest for MVP)
- Can be extended to Twitch, custom streaming services
- All streaming fields are optional - tours work without streams
- The system gracefully handles missing stream URLs

