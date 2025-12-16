# Agora.io Streaming Setup Guide

This guide will help you set up Agora.io for live streaming in the Italy From Couch application.

## Prerequisites

1. An Agora.io account (sign up at https://www.agora.io/)
2. A project created in the Agora console
3. Your Agora App ID and App Certificate

## Installation

The Agora SDK is already installed. However, you need to install the token generation library:

```bash
npm install agora-access-token
```

## Configuration

1. **Get your Agora credentials:**
   
   **Step 1: Sign up/Log in**
   - Go to https://www.agora.io/
   - Click "Sign Up" to create an account (or "Sign In" if you already have one)
   - Complete the registration process

   **Step 2: Create a Project**
   - After logging in, you'll be taken to the Agora Console
   - Click "Create" or "New Project" button
   - Enter a project name (e.g., "Italy From Couch")
   - Select "Real-time Communication" as the use case
   - Click "Submit" to create the project

   **Step 3: Get App ID**
   - Once your project is created, you'll see it in the project list
   - Click on your project name to open it
   - You'll see your **App ID** displayed on the project overview page
   - Copy this App ID (it looks like: `12345678901234567890123456789012`)

   **Step 4: Get App Certificate**
   - In the same project page, look for the **"Config"** tab or **"Keys"** section
   - Click on **"Generate"** or **"Enable"** next to "App Certificate" (if not already enabled)
   - ⚠️ **Important:** You can only see the App Certificate ONCE when you first generate it
   - Copy the App Certificate immediately (it's a long string of characters)
   - If you lose it, you'll need to regenerate it (which will invalidate the old one)
   - The App Certificate looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...`

   **Alternative: If you can't find App Certificate**
   - Some Agora accounts use "Primary Certificate" instead
   - Look for "Primary Certificate" or "Certificate" in the project settings
   - You may need to enable it first if it's disabled

2. **Add environment variables:**
   Create or update your `.env.local` file:

   ```env
   AGORA_APP_ID=your_app_id_here
   AGORA_APP_CERTIFICATE=your_app_certificate_here
   ```

   ⚠️ **Important:** Never commit your App Certificate to version control. Keep it secure!

## How It Works

### Architecture

1. **Guide (Publisher):**
   - Uses `GuideBroadcast` component
   - Publishes video and audio to Agora channel
   - Can start/stop stream, toggle video/audio

2. **Users (Subscribers):**
   - Use `AgoraViewer` component
   - Subscribe to guide's video and audio
   - Read-only access (cannot publish)

3. **Channel Naming:**
   - Format: `booking-{bookingId}`
   - Each booking gets its own unique channel

### Flow

1. **Booking Created:**
   - User books a tour
   - Booking is stored with `status: "confirmed"`

2. **Guide Starts Stream:**
   - Guide navigates to `/guides/dashboard`
   - Clicks "Start Stream" for a booking
   - Backend generates channel name and token
   - Guide's camera/mic is published to channel
   - Booking status changes to `"live"`

3. **Users Watch Stream:**
   - Users with active bookings can view the stream
   - `VideoPlayer` component detects `streamType === "agora"`
   - Fetches stream token and configuration
   - `AgoraViewer` subscribes to guide's stream

4. **Stream Ends:**
   - Guide clicks "End Stream"
   - Backend updates booking status to `"completed"`
   - Stream session is marked as ended

## API Endpoints

### Generate Stream Token
```
POST /api/streams/token
Body: { bookingId, role, userId? }
```

### Start Stream
```
POST /api/streams/start
Body: { bookingId, guideId }
```

### End Stream
```
POST /api/streams/end
Body: { bookingId, guideId }
```

### Get Stream Info
```
GET /api/streams/[bookingId]
```

### Get Stream Token (for viewers)
```
POST /api/streams/[bookingId]
Body: { role?, userId? }
```

## Components

### GuideBroadcast
Location: `components/streaming/guide-broadcast.tsx`
- Handles guide's camera/microphone
- Publishes to Agora channel
- Provides controls for video/audio toggle

### AgoraViewer
Location: `components/streaming/agora-viewer.tsx`
- Subscribes to guide's stream
- Displays video to users
- Handles connection states

### VideoPlayer
Location: `components/streaming/video-player.tsx`
- Updated to support Agora streams
- Automatically uses `AgoraViewer` when `streamType === "agora"`

## Testing

1. **Test Guide Stream:**
   - Log in as a guide
   - Navigate to `/guides/dashboard`
   - Create a test booking
   - Click "Start Stream"
   - Verify video preview appears

2. **Test User View:**
   - Log in as a user with an active booking
   - Navigate to tour detail page
   - Verify stream loads and displays guide's video

3. **Test Multiple Viewers:**
   - Open stream in multiple browser tabs/windows
   - Verify all viewers can see the stream simultaneously

## Troubleshooting

### "Agora credentials not configured"
- Check that `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE` are set in `.env.local`
- Restart your development server after adding environment variables

### "Failed to start stream"
- Verify your Agora App ID and Certificate are correct
- Check browser console for detailed error messages
- Ensure camera/microphone permissions are granted

### "Stream is not active"
- Verify the guide has started the stream
- Check booking status is `"live"`
- Verify stream session exists in database

### Low video quality
- Check network connection
- Adjust video settings in `lib/agora/config.ts`
- Consider implementing adaptive bitrate

## Security Considerations

1. **Token Expiration:**
   - Tokens expire after 24 hours
   - Regenerate tokens if needed

2. **Channel Permissions:**
   - Guides have publisher role (can publish)
   - Users have subscriber role (read-only)

3. **Authorization:**
   - Only guides can start streams for their bookings
   - Only users with active bookings can view streams

## Next Steps

After setting up Agora:

1. **Week 5:** Implement real-time chat and emojis
2. **Week 6:** Add participant list and timer
3. **Week 7:** Implement rating, reviews, and tips

## Resources

- [Agora.io Documentation](https://docs.agora.io/)
- [Agora RTC SDK for Web](https://docs.agora.io/en/video-calling/get-started/get-started-sdk?platform=web)
- [Token Generation Guide](https://www.agora.io/en/blog/how-to-build-a-token-server/)

