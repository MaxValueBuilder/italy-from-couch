"use client"

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  User,
} from "firebase/auth"
import { auth } from "@/lib/firebase/config"

const googleProvider = new GoogleAuthProvider()

// Sign up with email/password
export async function signUp(
  email: string,
  password: string,
  name?: string,
  role: "user" | "guide" = "user"
) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Save user to MongoDB
    await saveUserToDatabase(user, name, role)

    // Give MongoDB a moment to be ready for queries
    // This helps prevent race conditions when fetching userInfo immediately after signup
    await new Promise((resolve) => setTimeout(resolve, 500))

    return user
  } catch (error: any) {
    console.error("[AUTH] Sign up error:", error.message)
    throw error
  }
}

// Sign in with email/password
export async function signIn(email: string, password: string) {
  try {
    console.log("[AUTH] Starting sign in with email:", email)
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    console.log("[AUTH] Firebase sign in successful, uid:", user.uid)

    // Save/update user to MongoDB (in case user doesn't exist in DB)
    console.log("[AUTH] Saving user to database...")
    const saveResult = await saveUserToDatabase(user)
    console.log("[AUTH] User saved to database:", saveResult)

    return user
  } catch (error: any) {
    console.error("[AUTH] Sign in error:", error.message)
    throw error
  }
}

// Sign in with Google
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user

    // Save user to MongoDB
    await saveUserToDatabase(user)

    return user
  } catch (error: any) {
    console.error("[AUTH] Google sign in error:", error.message)
    throw error
  }
}

// Save user to MongoDB
async function saveUserToDatabase(user: User, name?: string, role?: "user" | "guide") {
  const userData = {
    uid: user.uid,
    email: user.email,
    name: name || user.displayName || "",
    photoURL: user.photoURL || "",
    provider: user.providerData[0]?.providerId || "password",
    role: role || "user", // Default to "user" if not specified
  }

  try {
    console.log("[AUTH] Saving user to database:", { uid: userData.uid, email: userData.email, role: userData.role })
    const response = await fetch("/api/auth/save-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    console.log("[AUTH] Save user response status:", response.status)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("[AUTH] Failed to save user to database:", response.status, errorData)
      return false
    }

    const result = await response.json()
    console.log("[AUTH] User saved to database successfully:", result)
    return true
  } catch (error: any) {
    console.error("[AUTH] Error saving user to database:", error.message)
    return false
  }
}

