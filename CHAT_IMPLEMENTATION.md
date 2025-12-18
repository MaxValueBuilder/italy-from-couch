# Real-Time Chat Implementation

## Overview
Real-time chat feature has been implemented for live streaming tours. Users can send messages, see typing indicators, and view message history during active streams.

## Architecture

### Technology Stack
- **Socket.io**: Real-time bidirectional communication
- **MongoDB**: Message persistence
- **Next.js Custom Server**: Hosts both Next.js app and Socket.io server
- **TypeScript**: Type safety

### File Structure
```
├── server.ts                          # Custom Next.js server with Socket.io
├── types/chat.ts                      # TypeScript types for chat
├── lib/socket/client.ts               # Socket.io client hook
├── components/streaming/
│   └── chat-panel.tsx                 # Chat UI component
├── app/api/chat/
│   ├── messages/route.ts              # POST: Send message
│   └── messages/[bookingId]/route.ts # GET: Message history
└── app/tours/[id]/live/page.tsx       # Live stream page (updated)
```

## Features Implemented

### ✅ Phase 1 (MVP)
- ✅ Real-time message sending/receiving
- ✅ Message history on page load
- ✅ User names and timestamps
- ✅ Auto-scroll to latest message
- ✅ Typing indicators
- ✅ Connection status indicator
- ✅ Message character limit (500 chars)
- ✅ Responsive design (sidebar on desktop, full width on mobile)

### 🔄 Phase 2 (Future Enhancements)
- ⏳ Message moderation (guide can delete)
- ⏳ Emoji reactions (separate feature)
- ⏳ Rate limiting (prevent spam)
- ⏳ Message pagination (load older messages)

## Database Schema

### Collection: `chatMessages`
```typescript
{
  _id: ObjectId,
  bookingId: string,        // Links to booking/stream session
  userId: string,           // Firebase UID
  userName: string,         // Display name
  message: string,          // Message content (max 500 chars)
  type: 'message' | 'system',
  timestamp: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### POST `/api/chat/messages`
Send a chat message.

**Body:**
```json
{
  "bookingId": "string",
  "userId": "string",
  "userName": "string",
  "message": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": { ...ChatMessage }
}
```

### GET `/api/chat/messages/[bookingId]`
Get message history for a booking.

**Query Params:**
- `limit`: number (default: 100)
- `before`: ISO date string (optional, for pagination)

**Response:**
```json
{
  "success": true,
  "messages": [ ...ChatMessage[] ],
  "count": number
}
```

## Socket.io Events

### Client → Server
- `join-room`: Join a chat room (booking)
- `leave-room`: Leave a chat room
- `send-message`: Send a message
- `typing-start`: User started typing
- `typing-stop`: User stopped typing

### Server → Client
- `message-history`: Initial message history when joining
- `new-message`: New message broadcast
- `user-typing`: User is typing indicator
- `user-stopped-typing`: User stopped typing
- `error`: Error message

## Setup Instructions

### 1. Environment Variables
Add to `.env.local`:
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

### 2. Install Dependencies
Already installed:
- `socket.io`
- `socket.io-client`
- `tsx` (dev dependency)

### 3. Run Development Server
```bash
npm run dev
```

This will start both the Next.js app and Socket.io server on port 3000.

### 4. Production Build
```bash
npm run build
npm start
```

## Usage

### For Users
1. Navigate to a live stream: `/tours/[id]/live`
2. Chat panel appears on the right (desktop) or bottom (mobile)
3. Type messages and press Enter or click Send
4. See real-time messages from other users
5. See typing indicators when others are typing

### For Developers
```typescript
import { useSocket } from "@/lib/socket/client"
import { ChatPanel } from "@/components/streaming/chat-panel"

// In your component
const { messages, sendMessage, isConnected } = useSocket()

// Use ChatPanel component
<ChatPanel bookingId={bookingId} />
```

## Security Considerations

1. **Authentication**: Users must be authenticated to send messages
2. **Authorization**: API routes verify user has access to booking
3. **Input Validation**: Messages are trimmed and limited to 500 characters
4. **Rate Limiting**: (To be implemented) Max 10 messages/minute per user
5. **XSS Prevention**: Messages are displayed as text (not HTML)

## Performance Optimizations

1. **Message History**: Limited to last 100 messages on load
2. **Auto-scroll**: Smooth scrolling to latest message
3. **Typing Indicators**: Auto-stop after 3 seconds of inactivity
4. **Connection Management**: Automatic reconnection on disconnect

## Troubleshooting

### Socket.io Connection Issues
- Check `NEXT_PUBLIC_SOCKET_URL` environment variable
- Verify server is running on correct port
- Check browser console for connection errors

### Messages Not Appearing
- Verify user is authenticated
- Check bookingId is correct
- Verify stream is active (status: "live")
- Check MongoDB connection

### Typing Indicators Not Working
- Check Socket.io connection status
- Verify typing events are being emitted
- Check browser console for errors

## Next Steps

1. Add message moderation (guide can delete messages)
2. Implement rate limiting
3. Add emoji reactions (separate feature)
4. Add message pagination for older messages
5. Add message search functionality
6. Add user mentions (@username)
7. Add file/image sharing (optional)

