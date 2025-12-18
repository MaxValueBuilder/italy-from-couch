# Guide Tour Start Example

## Complete Flow: How a Guide Starts a Tour

### Step 1: Guide Logs In
- Guide logs in at `/login` with their credentials
- They are redirected to `/guides/dashboard`

### Step 2: View Upcoming Bookings
On the dashboard, the guide sees:
- **Upcoming Tours** section with all confirmed/pending bookings
- Each booking shows:
  - Tour title (e.g., "Historic Rome Walking Tour")
  - City (e.g., "Rome")
  - Scheduled date and time
  - Duration (e.g., "120 minutes")
  - **"Start Stream"** button

### Step 3: Start the Stream
When it's time to start the tour:

1. **Click "Start Stream"** button on the booking card
2. System creates a stream session and generates Agora credentials
3. **GuideBroadcast component appears** with:
   - Camera preview (shows guide's video feed)
   - "Start Stream" button in the component
4. **Click "Start Stream"** in the broadcast component
5. Camera and microphone activate
6. Connection status shows "● LIVE" when connected

### Step 4: Begin the Tour (Sample Script)

Once the stream is live, the guide can start speaking:

---

## Sample Tour Introduction Script

**"Welcome to Italy and welcome to Rome! Ciao, everyone! My name is [Guide Name], and I'm thrilled to have you joining me today for this live walking tour of the Eternal City.**

**I can see we have [X] viewers with us from around the world - grazie for booking this tour! Whether you're watching from New York, London, Tokyo, or anywhere else, you're about to experience Rome like never before, all from the comfort of your couch.**

**Today, we're going to explore some of Rome's most iconic landmarks. We'll start here at the Colosseum, then make our way through the ancient Roman Forum, and finish at the Pantheon. Along the way, I'll share stories, history, and insider tips that you won't find in guidebooks.**

**Before we begin, I want to remind you that this tour is completely free to watch. At the end, if you enjoyed the experience, you can leave a tip - but only if you truly feel it was worth it. No pressure at all!**

**Now, let's start our journey. Can everyone see and hear me clearly? If you have any questions as we go, feel free to type them in the chat - I'll do my best to answer them!**

**Alright, let's begin! Follow me as we step back in time to ancient Rome..."**

---

## During the Tour

The guide can:
- **Toggle video** on/off (if needed)
- **Toggle audio** on/off (if needed)
- See connection status
- View the channel name they're streaming to

## Ending the Tour

1. **Click "End Stream"** button
2. Stream session closes
3. Booking status updates to "completed"
4. Viewers are disconnected

---

## Technical Flow Summary

```
Guide Dashboard
    ↓
Click "Start Stream" on booking
    ↓
POST /api/streams/start
    ↓
Creates streamSession in MongoDB
Updates booking status to "live"
Returns: { appId, channelName, token }
    ↓
GuideBroadcast component renders
    ↓
Guide clicks "Start Stream" in component
    ↓
Agora RTC Client joins channel
Camera & microphone tracks published
    ↓
Stream is LIVE - viewers can watch
    ↓
Guide clicks "End Stream"
    ↓
POST /api/streams/end
    ↓
Stream session ends
Booking status updates
```

---

## Example User Experience

**Guide's View:**
- Dashboard shows upcoming bookings
- Click "Start Stream" → Broadcast component appears
- Click "Start Stream" in component → Camera activates
- See own video feed with "● LIVE" indicator
- Toggle video/audio controls available
- "End Stream" button to finish

**Viewer's View:**
- See "Watch Live Stream" button on tour detail page when stream is active
- Click button → Navigate to `/tours/[id]/live`
- Video player loads and connects to Agora stream
- See guide's live video feed
- Can watch the entire tour in real-time

---

## Tips for Guides

1. **Test your setup** before the scheduled time
2. **Check your internet connection** - stable WiFi recommended
3. **Good lighting** helps viewers see you clearly
4. **Speak clearly** and at a moderate pace
5. **Engage with viewers** - acknowledge questions in chat
6. **Have a backup plan** - know what to do if connection drops
7. **Start on time** - viewers are waiting!
8. **Be enthusiastic** - your energy comes through the screen

---

## Sample Dialogue Throughout Tour

**At the Colosseum:**
*"Here we are at the Colosseum, one of the most recognizable symbols of Rome. This amphitheater could hold up to 80,000 spectators who came to watch gladiatorial contests, animal hunts, and even mock sea battles. Can you imagine the roar of the crowd?"*

**Walking to Forum:**
*"Now we're heading to the Roman Forum, which was the heart of ancient Rome. This was where politics, commerce, and daily life all converged. Notice how the stones beneath our feet have been walked on for over 2,000 years..."*

**At the Pantheon:**
*"And finally, we've arrived at the Pantheon - one of the best-preserved ancient Roman buildings. Look up at that dome - it's still the world's largest unreinforced concrete dome, built nearly 2,000 years ago. The engineering is absolutely remarkable..."*

**Ending:**
*"Thank you so much for joining me today on this virtual journey through Rome! I hope you've enjoyed exploring these incredible sites with me. If you have any questions, feel free to ask. And remember, if you enjoyed the tour, tips are always appreciated but never required. Grazie mille, and arrivederci!"*

