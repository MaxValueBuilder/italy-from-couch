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
export async function signUp(email: string, password: string, name?: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Save user to MongoDB
    await saveUserToDatabase(user, name)

    return user
  } catch (error: any) {
    console.error("[AUTH] Sign up error:", error.message)
    throw error
  }
}

// Sign in with email/password
export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Save/update user to MongoDB (in case user doesn't exist in DB)
    await saveUserToDatabase(user)

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
async function saveUserToDatabase(user: User, name?: string) {
  const userData = {
    uid: user.uid,
    email: user.email,
    name: name || user.displayName || "",
    photoURL: user.photoURL || "",
    provider: user.providerData[0]?.providerId || "password",
  }

  try {
    const response = await fetch("/api/auth/save-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("[AUTH] Failed to save user to database:", response.status, errorData)
      // Don't throw - we don't want to block auth if DB save fails
      return
    }
  } catch (error: any) {
    console.error("[AUTH] Error saving user to database:", error.message)
    // Don't throw - we don't want to block auth if DB save fails
  }
}

