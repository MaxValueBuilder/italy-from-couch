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
      const response = await fetch(`/api/auth/user?uid=${uid}`)

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUserInfo({
            uid: data.user.uid,
            email: data.user.email,
            name: data.user.name || "",
            photoURL: data.user.photoURL || null,
            role: data.user.role || "user",
            guideId: data.user.guideId || undefined,
          })
          return true
        }
        return false
      } else {
        // If user not found (404), they might have just signed up - retry with delay
        if (response.status === 404 && retryCount < 3) {
          const delay = (retryCount + 1) * 1000 // 1s, 2s, 3s
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
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        setUser(user)
        if (user) {
          await fetchUserInfo(user.uid, 0)
        } else {
          setUserInfo(null)
        }
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

