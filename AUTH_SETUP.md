# Authentication Setup Guide

## Overview
This project now includes Firebase Authentication (Email/Password and Google) with MongoDB for user data storage.

## Setup Instructions

### Step 1: Install Dependencies
Run this command in your project root:
```bash
npm install
```

This will install:
- `firebase` - Firebase SDK for authentication
- `mongodb` - MongoDB driver for database operations

### Step 2: Firebase Setup

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Click "Add project" or select existing project
   - Follow the setup wizard

2. **Enable Authentication**
   - In Firebase Console, go to "Authentication"
   - Click "Get started"
   - Enable "Email/Password" provider
   - Enable "Google" provider
   - Save both

3. **Get Firebase Config**
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps"
   - Click Web icon (`</>`)
   - Register your app
   - Copy the config values

### Step 3: MongoDB Setup
maxvaluebuilder_db_user
EzeLcTLqVIIN0SBK

**Option A: MongoDB Atlas (Recommended - Free)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a free cluster (M0 - Free tier)
4. Create database user (username/password)
5. Whitelist IP address (0.0.0.0/0 for development)
6. Get connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

**Option B: Local MongoDB**
- Install MongoDB locally
- Connection string: `mongodb://localhost:27017/italy-from-couch`

### Step 4: Create Environment Variables

Create a `.env.local` file in your project root:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/italy-from-couch?retryWrites=true&w=majority
```

**Important:** 
- Replace all placeholder values with your actual credentials
- Never commit `.env.local` to git (it's already in `.gitignore`)
- For production, add these to your hosting platform's environment variables

### Step 5: Test Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit:
   - http://localhost:3000/login - Login page
   - http://localhost:3000/signup - Sign up page

3. Test features:
   - Create account with email/password
   - Sign in with email/password
   - Sign in with Google
   - Check header for user info when logged in
   - Sign out functionality

## Files Created

### Core Files
- `lib/firebase/config.ts` - Firebase configuration
- `lib/mongodb/connection.ts` - MongoDB connection
- `lib/auth/context.tsx` - Auth context and provider
- `lib/auth/auth.ts` - Auth functions (signIn, signUp, Google)

### API Routes
- `app/api/auth/save-user/route.ts` - Saves user to MongoDB

### Components
- `components/auth/login-form.tsx` - Login form component
- `components/auth/signup-form.tsx` - Sign up form component

### Pages
- `app/login/page.tsx` - Login page
- `app/signup/page.tsx` - Sign up page

### Updated Files
- `app/layout.tsx` - Added AuthProvider
- `components/header.tsx` - Added auth buttons (Sign In/Sign Out)
- `package.json` - Added Firebase and MongoDB dependencies

## Features

✅ Email/Password authentication
✅ Google Sign-In
✅ User data stored in MongoDB
✅ Auth state management (Context API)
✅ Protected routes support (ready to use)
✅ User profile display in header
✅ Sign out functionality

## Usage Examples

### Check if user is logged in:
```typescript
import { useAuth } from "@/lib/auth/context"

function MyComponent() {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please sign in</div>
  
  return <div>Welcome, {user.email}!</div>
}
```

### Protect a route:
```typescript
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <div>This content is protected</div>
    </ProtectedRoute>
  )
}
```

## Database Schema

Users are stored in MongoDB with this structure:
```typescript
{
  uid: string,           // Firebase user ID
  email: string,         // User email
  name: string,          // User name
  photoURL: string,      // Profile picture URL
  provider: string,      // "password" or "google.com"
  createdAt: Date,       // Account creation date
  updatedAt: Date        // Last update date
}
```

## Troubleshooting

### Firebase errors:
- Check that all environment variables are set correctly
- Verify Firebase Authentication is enabled in console
- Check browser console for specific error messages

### MongoDB errors:
- Verify connection string is correct
- Check that IP is whitelisted (for Atlas)
- Ensure database user has correct permissions
- Check that database name is correct

### Authentication not working:
- Clear browser cache and cookies
- Check Firebase console for authentication logs
- Verify environment variables are loaded (restart dev server)

## Next Steps

1. Create user profile page (`/profile`)
2. Add protected routes for authenticated features
3. Store user preferences in MongoDB
4. Add email verification (optional)
5. Add password reset functionality (optional)

## Security Notes

- Never expose Firebase config in client-side code (use env variables)
- MongoDB connection string should never be in client code
- Always validate user input
- Use Firebase Security Rules for additional protection
- Keep environment variables secure

