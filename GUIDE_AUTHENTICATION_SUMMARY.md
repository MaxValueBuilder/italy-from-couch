# Guide Authentication Implementation Summary

## ✅ Completed Implementation

### 1. User Model Updates
- ✅ Added `role` field to user documents in MongoDB
- ✅ Roles: `"user"` (default) or `"guide"`
- ✅ Role is preserved when user signs in (doesn't overwrite existing role)

### 2. Authentication Updates
- ✅ Updated `lib/auth/auth.ts`:
  - `signUp()` now accepts `role` parameter
  - `saveUserToDatabase()` saves role to MongoDB
  - Default role is `"user"` if not specified

- ✅ Updated `lib/auth/context.tsx`:
  - Added `userInfo` to context with role information
  - Fetches user info from MongoDB after authentication
  - Provides `userInfo.role` to check if user is a guide

### 3. API Endpoints
- ✅ `app/api/auth/save-user/route.ts`:
  - Accepts `role` in request body
  - Preserves existing role if not provided
  - Returns role in response

- ✅ `app/api/auth/user/route.ts` (NEW):
  - GET endpoint to fetch user information including role
  - Query param: `uid` (Firebase UID)

- ✅ `app/api/bookings/guide/[guideId]/route.ts` (NEW):
  - GET endpoint to fetch bookings for a specific guide
  - Returns all bookings where `guideId` matches

### 4. Frontend Components
- ✅ Updated `components/auth/signup-form.tsx`:
  - Added role selection (Tour Viewer / Guide)
  - Visual selection buttons
  - Redirects guides to `/guides/dashboard` after signup
  - Google signup defaults to "user" role

- ✅ Updated `components/auth/login-form.tsx`:
  - Automatically redirects based on user role
  - Guides → `/guides/dashboard`
  - Users → `/` (home)
  - Respects `redirect` query parameter

### 5. Guide Dashboard
- ✅ Updated `app/guides/dashboard/page.tsx`:
  - Checks if user is a guide (`userInfo.role === "guide"`)
  - Redirects non-guides to home page
  - Uses `fetchGuideBookings()` to get guide's bookings
  - Properly handles authentication state

### 6. API Client
- ✅ Created `lib/api/guides.ts`:
  - `fetchGuideBookings(guideId)` function
  - Fetches bookings for a specific guide

## 🔄 How It Works

### Sign Up Flow
1. User selects role (Tour Viewer or Guide) on signup form
2. Account is created with selected role
3. Role is saved to MongoDB
4. Redirect:
   - Guides → `/guides/dashboard`
   - Users → `/` (home)

### Sign In Flow
1. User signs in (email/password or Google)
2. Auth context fetches user info from MongoDB
3. `userInfo` is populated with role
4. Automatic redirect:
   - Guides → `/guides/dashboard`
   - Users → `/` (home)
   - Or to `redirect` query parameter if provided

### Guide Dashboard Access
1. User navigates to `/guides/dashboard`
2. System checks `userInfo.role`
3. If not a guide → redirect to home
4. If guide → show dashboard with bookings

## 📋 Database Schema

### Users Collection
```typescript
{
  uid: string,           // Firebase UID
  email: string,
  name: string,
  photoURL: string,
  provider: string,      // "password" or "google.com"
  role: "user" | "guide", // NEW: User role
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Security Considerations

1. **Role Verification:**
   - Guide dashboard checks role before allowing access
   - API endpoints can verify role if needed

2. **Role Assignment:**
   - Users can select role during signup
   - Google signup defaults to "user" (can be updated later)
   - Existing users default to "user" role

3. **Role Updates:**
   - Currently, role is set during signup
   - Can be updated via API if needed (admin function)

## 🚀 Usage Examples

### Check if User is Guide
```typescript
const { userInfo } = useAuth()

if (userInfo?.role === "guide") {
  // User is a guide
}
```

### Fetch Guide Bookings
```typescript
import { fetchGuideBookings } from "@/lib/api/guides"

const bookings = await fetchGuideBookings(user.uid)
```

### Get User Info
```typescript
const response = await fetch(`/api/auth/user?uid=${user.uid}`)
const { user } = await response.json()
console.log(user.role) // "user" or "guide"
```

## 📝 Next Steps / Future Enhancements

1. **Admin Panel:**
   - Allow admins to change user roles
   - Approve guide applications

2. **Guide Profile:**
   - Link guide accounts to guide profiles in `guides` collection
   - Allow guides to update their profile

3. **Guide Application:**
   - Add application process for becoming a guide
   - Require approval before role is granted

4. **Role Permissions:**
   - Add more granular permissions
   - Different access levels for guides

## 🐛 Known Limitations

1. **Google Signup:**
   - Google signup always creates "user" role
   - Guides need to contact support or use email signup

2. **Role Updates:**
   - No UI to change role after signup
   - Requires database update or API call

3. **Guide Profile Linking:**
   - Guide accounts not automatically linked to guide profiles
   - Need to manually match `guideId` with user `uid`

## 📚 Files Modified/Created

### Modified Files
- `lib/auth/auth.ts`
- `lib/auth/context.tsx`
- `app/api/auth/save-user/route.ts`
- `components/auth/signup-form.tsx`
- `components/auth/login-form.tsx`
- `app/guides/dashboard/page.tsx`

### New Files
- `app/api/auth/user/route.ts`
- `app/api/bookings/guide/[guideId]/route.ts`
- `lib/api/guides.ts`
- `GUIDE_AUTHENTICATION_SUMMARY.md`

