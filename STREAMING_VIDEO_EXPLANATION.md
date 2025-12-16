# Live Streaming Video System - Technical Explanation

## Overview

Our "Italy From Couch" platform enables real-time, ultra-low latency (<3 seconds) video streaming where:
- **Guides** in Italy broadcast live video using their phone/camera
- **Users** worldwide watch the live stream in real-time
- **One-way video**: Guide sees the camera feed, users see the guide (guide doesn't see users)
- **Interactive features**: Users can message guides and send emoji reactions
- **Session management**: Participant lists and time remaining indicators

---

## Architecture Overview

```
┌─────────────────┐         ┌──────────────┐         ┌─────────────────┐
│   Guide (Italy) │────────▶│  Agora.io    │────────▶│  Users (Global) │
│   Phone/Camera  │  Video  │  Cloud       │  Video  │   Browsers      │
└─────────────────┘         └──────────────┘         └─────────────────┘
                                      │
                                      ▼
                            ┌─────────────────┐
                            │  Our Backend    │
                            │  (Next.js API)  │
                            │  - Token Gen    │
                            │  - Session Mgmt │
                            └─────────────────┘
```

---

## Technology Stack

### **Agora.io** - Real-time Video Platform
- **Why Agora?**: Ultra-low latency (<3 seconds), global CDN, scalable
- **How it works**: 
  - Guides publish video streams to Agora's cloud
  - Users subscribe to those streams
  - Agora handles all video encoding/decoding, network optimization

### **Our Implementation**
- **Frontend**: React components using `agora-rtc-sdk-ng`
- **Backend**: Next.js API routes for token generation
- **Database**: MongoDB for session tracking

---

## Flow Example: Complete Tour Streaming Session

### **Step 1: Guide Starts a Tour Stream**

**Scenario**: Marco (guide) is in Rome, ready to start a 90-minute tour of the Colosseum at 2:00 PM.

1. **Guide opens dashboard** → Sees upcoming booking
2. **Clicks "Start Stream"** → Frontend calls our API:
   ```javascript
   POST /api/streams/start
   {
     bookingId: "booking_123",
     guideId: "guide_marco_uid"
   }
   ```

3. **Backend generates Agora token**:
   ```javascript
   // Creates unique channel name: "booking_booking_123"
   // Generates publisher token (guide can broadcast)
   // Returns: { channelName, token, appId }
   ```

4. **Guide's phone connects to Agora**:
   ```javascript
   // GuideBroadcast component initializes Agora client
   // Publishes camera/microphone to channel
   // Stream is now LIVE
   ```

**Result**: Marco's video is broadcasting to Agora's cloud infrastructure.

---

### **Step 2: Users Join the Stream**

**Scenario**: Sarah (New York) and John (London) have booked this tour.

1. **Users navigate to tour page** → See "Live" indicator
2. **Click to watch** → Frontend detects `streamType === "agora"`
3. **Frontend requests stream info**:
   ```javascript
   GET /api/streams/booking_123?role=subscriber&userId=user_sarah
   ```

4. **Backend returns stream configuration**:
   ```javascript
   {
     success: true,
     channelName: "booking_booking_123",
     token: "subscriber_token_...",
     appId: "our_agora_app_id"
   }
   ```

5. **User's browser connects**:
   ```javascript
   // AgoraViewer component initializes Agora client
   // Subscribes to guide's video stream
   // Video appears in <3 seconds
   ```

**Result**: Sarah and John see Marco's live video feed with <3 second delay.

---

### **Step 3: Real-time Interaction**

**Scenario**: Sarah wants to ask Marco a question.

1. **Sarah types message**: "Can you show us the inside?"
2. **Message sent via WebSocket/API** → Stored in MongoDB
3. **Guide sees notification** → Reads message on their phone
4. **Guide responds verbally** → Users hear via audio stream

**Emoji Reactions**:
- User clicks 😍 emoji → Sent to backend → Guide sees notification
- No video interruption, just metadata

---

### **Step 4: Session Management**

**Participant List**:
- Backend tracks who's connected via Agora events
- Displayed to both guide and users
- Updates in real-time as people join/leave

**Time Remaining**:
- Calculated from booking `scheduledAt` + `duration`
- Shows countdown: "45 minutes remaining"
- Updates every second

---

### **Step 5: Guide Ends Stream**

**Scenario**: Tour completes after 90 minutes.

1. **Guide clicks "End Stream"** → Calls API:
   ```javascript
   POST /api/streams/end
   {
     bookingId: "booking_123",
     guideId: "guide_marco_uid"
   }
   ```

2. **Backend updates**:
   - Sets booking status to "completed"
   - Ends Agora session
   - Disconnects all users

3. **Users see**: "Stream has ended" message

---

## Key Technical Concepts

### **1. Agora Tokens (Security)**
- **Publisher Token**: Allows guide to broadcast (create stream)
- **Subscriber Token**: Allows users to watch (receive stream)
- **Generated server-side** for security
- **Time-limited** (24 hours default)

### **2. Channel Names**
- **Format**: `"booking_{bookingId}"`
- **Unique per tour session**
- **Example**: `"booking_67890abc123"`

### **3. One-Way Video**
- Guide publishes: Camera + Microphone
- Users subscribe: Receive video + audio
- Users **do NOT** publish (no video from users)
- This keeps bandwidth low and focus on guide

### **4. Network Optimization**
- Agora automatically:
  - Adjusts quality based on user's connection
  - Routes through nearest CDN server
  - Handles packet loss and reconnection

---

## Code Structure

### **Frontend Components**

```
components/streaming/
├── guide-broadcast.tsx    # Guide's view (publishes video)
├── agora-viewer.tsx       # User's view (subscribes to video)
└── video-player.tsx       # Wrapper (handles YouTube/Agora)
```

### **Backend API Routes**

```
app/api/streams/
├── token/route.ts         # Generate Agora tokens
├── start/route.ts         # Start stream session
├── end/route.ts           # End stream session
└── [bookingId]/route.ts   # Get stream info
```

### **Key Functions**

**Token Generation** (`lib/agora/token-server.ts`):
```typescript
generateRtcToken(channelName, uid, role, expirationTime)
// Returns: Agora RTC token string
```

**Stream Start** (`app/api/streams/start/route.ts`):
- Validates guide authorization
- Generates channel name
- Creates publisher token
- Updates booking status to "live"

**Stream End** (`app/api/streams/end/route.ts`):
- Validates guide authorization
- Updates booking status to "completed"
- Ends Agora session

---

## Example: Complete Code Flow

### **Guide Side (Publishing)**

```typescript
// 1. Guide clicks "Start Stream"
const response = await fetch('/api/streams/start', {
  method: 'POST',
  body: JSON.stringify({ bookingId, guideId })
})
const { channelName, token, appId } = await response.json()

// 2. Initialize Agora client
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })

// 3. Join channel as publisher
await client.join(appId, channelName, token, null)

// 4. Create local tracks (camera + microphone)
const [videoTrack, audioTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()

// 5. Publish tracks
await client.publish([videoTrack, audioTrack])

// 6. Display local video
videoTrack.play('local-video-element')
```

### **User Side (Subscribing)**

```typescript
// 1. Get stream info
const response = await fetch(`/api/streams/${bookingId}?role=subscriber`)
const { channelName, token, appId } = await response.json()

// 2. Initialize Agora client
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })

// 3. Join channel as subscriber
await client.join(appId, channelName, token, null)

// 4. Listen for remote user (guide) publishing
client.on('user-published', async (user, mediaType) => {
  // Subscribe to guide's video
  await client.subscribe(user, mediaType)
  
  if (mediaType === 'video') {
    // Display guide's video
    user.videoTrack?.play('remote-video-element')
  }
  
  if (mediaType === 'audio') {
    // Play guide's audio
    user.audioTrack?.play()
  }
})
```

---

## Real-World Example Scenario

**Tour**: "Ancient Rome Walking Tour"
**Guide**: Marco Rossi
**Time**: 2:00 PM - 3:30 PM (Rome time)
**Users**: 5 people from different countries

### **Timeline**:

**1:55 PM** - Marco opens app, sees upcoming booking
**1:58 PM** - Marco arrives at Colosseum, clicks "Start Stream"
**2:00 PM** - Stream goes live, users receive notifications
**2:01 PM** - All 5 users join, see Marco's live video
**2:05 PM** - User from Japan asks: "Can you show the Arch of Constantine?"
**2:06 PM** - Marco walks to arch, shows it on camera
**2:07 PM** - Users see arch in real-time (<3 sec delay)
**2:30 PM** - User sends 😍 emoji, Marco sees notification
**3:25 PM** - Time remaining shows "5 minutes"
**3:30 PM** - Marco ends stream, users see "Tour completed"

### **Technical Details**:
- **Video Quality**: Auto-adjusted (720p-1080p based on connection)
- **Audio**: Clear, low latency
- **Bandwidth**: ~2-3 Mbps per user
- **Delay**: 1-3 seconds (excellent for live interaction)
- **Stability**: Agora handles reconnections automatically

---

## Benefits of This Architecture

1. **Ultra-Low Latency**: <3 seconds (vs 10-30s for YouTube Live)
2. **Scalable**: Agora handles thousands of concurrent viewers
3. **Global**: CDN ensures good quality worldwide
4. **Interactive**: Real-time messaging and reactions
5. **Mobile-Friendly**: Works on phones, tablets, desktops
6. **Cost-Effective**: Pay per usage, no infrastructure to maintain

---

## Next Steps for Developer

1. **Understand Agora SDK**: Read `agora-rtc-sdk-ng` documentation
2. **Review Components**: Study `guide-broadcast.tsx` and `agora-viewer.tsx`
3. **Test Locally**: Use Agora test credentials
4. **Understand Token Flow**: See how tokens are generated server-side
5. **Review API Routes**: Understand authorization and session management

---

## Questions to Consider

- How do we handle network interruptions?
- How do we scale for 100+ concurrent viewers?
- How do we implement recording for replay?
- How do we add screen sharing for guides?
- How do we implement quality controls?

---

This system provides a professional, scalable solution for live video streaming with real-time interaction, perfect for virtual tours and remote experiences.

