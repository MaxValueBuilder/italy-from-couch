"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth"
import { auth } from "@/lib/firebase/config"

interface UserInfo {
  uid: string
  email: string | null
  name: string
  photoURL: string | null
  role: "user" | "guide"
  guideId?: string // Guide's _id from guides collection (only for guides)
}

interface AuthContextType {
  user: User | null
  userInfo: UserInfo | null
  loading: boolean
  signOut: () => Promise<void>
  refetchUserInfo: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user info from MongoDB
  const fetchUserInfo = async (uid: string, retryCount = 0) => {
    try {
      console.log(`[AUTH] Fetching user info for uid: ${uid} (retry: ${retryCount})`)
      const response = await fetch(`/api/auth/user?uid=${uid}`)
      console.log(`[AUTH] User info response:`, { status: response.status, ok: response.ok })

      if (response.ok) {
        const data = await response.json()
        console.log("[AUTH] User info data:", data)
        if (data.success && data.user) {
          const userInfoData = {
            uid: data.user.uid,
            email: data.user.email,
            name: data.user.name || "",
            photoURL: data.user.photoURL || null,
            role: data.user.role || "user",
            guideId: data.user.guideId || undefined,
          }
          console.log("[AUTH] Setting userInfo:", userInfoData)
          setUserInfo(userInfoData)
          return true
        }
        console.log("[AUTH] Response OK but no user data")
        return false
      } else {
        // If user not found (404), they might have just signed up - retry with delay
        if (response.status === 404 && retryCount < 3) {
          const delay = (retryCount + 1) * 1000 // 1s, 2s, 3s
          console.log(`[AUTH] User not found (404), retrying in ${delay}ms... (${retryCount + 1}/3)`)
          setTimeout(() => {
            fetchUserInfo(uid, retryCount + 1)
          }, delay)
          // Set temporary default userInfo while retrying
          setUserInfo({
            uid,
            email: null,
            name: "",
            photoURL: null,
            role: "user",
            guideId: undefined,
          })
          return false
        } else if (response.status === 404) {
          console.log("[AUTH] User not found after 3 retries, setting default userInfo")
          // After 3 retries, set default userInfo
          setUserInfo({
            uid,
            email: null,
            name: "",
            photoURL: null,
            role: "user",
            guideId: undefined,
          })
          return false
        }
        console.error("[AUTH] Failed to fetch user info:", response.status)
        return false
      }
    } catch (error) {
      console.error("[AUTH] Error fetching user info:", error)
      return false
    }
  }

  // Expose refetch function
  const refetchUserInfo = async () => {
    if (user) {
      await fetchUserInfo(user.uid, 0)
    }
  }

  // Fetch user info from MongoDB when user changes
  useEffect(() => {
    console.log("[AUTH] Setting up auth state listener...")
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        console.log("[AUTH] Auth state changed:", { hasUser: !!user, uid: user?.uid })
        setUser(user)
        if (user) {
          console.log("[AUTH] User authenticated, fetching user info...")
          await fetchUserInfo(user.uid, 0)
        } else {
          console.log("[AUTH] No user, clearing userInfo")
          setUserInfo(null)
        }
        console.log("[AUTH] Setting loading to false")
        setLoading(false)
      },
      (error) => {
        console.error("[AUTH] Auth state error:", error.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUser(null)
    setUserInfo(null)
  }

  return (
    <AuthContext.Provider value={{ user, userInfo, loading, signOut, refetchUserInfo }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

