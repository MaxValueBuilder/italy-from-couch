"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth/context"
import { createGuideProfile } from "@/lib/api/guides"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, AlertCircle } from "lucide-react"

const CITIES = ["Rome", "Florence", "Venice"] as const
const COMMON_SPECIALTIES = [
  "Ancient history",
  "Archaeology",
  "Renaissance art",
  "Architecture",
  "Food culture",
  "Local culture",
  "Hidden gems",
  "Photography",
  "Local markets",
  "Neighborhoods",
  "Venetian history",
  "Local secrets",
]
const COMMON_LANGUAGES = ["Italian", "English", "Spanish", "French", "German"]

export default function CompleteGuideProfilePage() {
  const router = useRouter()
  const { user, userInfo, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [city, setCity] = useState<"Rome" | "Florence" | "Venice">("Rome")
  const [specialties, setSpecialties] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [bio, setBio] = useState("")
  const [image, setImage] = useState("")

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return
    }

    // If no user, redirect to login
    if (!user) {
      router.push("/login?redirect=/guides/complete-profile")
      return
    }

    // Create effectiveUserInfo (fallback for new signups)
    const effectiveUserInfo = userInfo || {
      uid: user.uid,
      email: user.email,
      name: user.displayName || "",
      photoURL: user.photoURL,
      role: "guide" as const, // Assume guide since they're on this page
      guideId: undefined,
    }

    // If guide already has profile linked, redirect to dashboard
    if (effectiveUserInfo.guideId) {
      router.push("/guides/dashboard")
      return
    }

    // If user is on this page, allow them to proceed even if role is "user"
    // This handles the race condition where signup redirects before DB save completes
    // The auth context will automatically retry and update the role

    // Pre-fill name from user info
    if (effectiveUserInfo.name && !name) {
      setName(effectiveUserInfo.name)
    }
  }, [user, userInfo, authLoading, router, name])

  const toggleSpecialty = (specialty: string) => {
    setSpecialties((prev) =>
      prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty]
    )
  }

  const toggleLanguage = (language: string) => {
    setLanguages((prev) =>
      prev.includes(language) ? prev.filter((l) => l !== language) : [...prev, language]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validation
    if (!name.trim()) {
      setError("Name is required")
      return
    }
    if (!city) {
      setError("City is required")
      return
    }
    if (specialties.length === 0) {
      setError("Please select at least one specialty")
      return
    }
    if (languages.length === 0) {
      setError("Please select at least one language")
      return
    }
    if (!bio.trim()) {
      setError("Bio is required")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const result = await createGuideProfile({
        userId: user.uid,
        name: name.trim(),
        city,
        specialties,
        languages,
        bio: bio.trim(),
        image: image.trim() || undefined,
      })

      if (result.success && result._id) {
        // Force a full page reload to refresh auth context with new guideId
        // This ensures the auth context picks up the updated user info
        window.location.href = "/guides/dashboard"
      } else {
        setError(result.error || "Failed to create guide profile")
      }
    } catch (err: any) {
      setError(err.message || "Failed to create guide profile")
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while auth is loading or user/userInfo is not ready
  if (authLoading || !user || !userInfo) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </>
    )
  }

  // Create effectiveUserInfo (fallback for edge cases)
  const effectiveUserInfo = userInfo || {
    uid: user.uid,
    email: user.email,
    name: user.displayName || "",
    photoURL: user.photoURL,
    role: "guide" as const,
    guideId: undefined,
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold">Complete Your Guide Profile</h1>
            <p className="text-lg text-muted-foreground">
              Create your guide profile to start managing tours and streaming
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Guide Profile Information</CardTitle>
              <CardDescription>
                Fill in your details to create your guide profile. You can update this information later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-4">
                  <Label htmlFor="name" className="text-sm font-semibold">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                    disabled={loading}
                    className="py-6"
                  />
                </div>

                {/* City */}
                <div className="space-y-4">
                  <Label htmlFor="city" className="text-sm font-semibold">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={city}
                    onValueChange={(value) => setCity(value as typeof city)}
                    disabled={loading}
                    required
                  >
                    <SelectTrigger
                      id="city"
                      className="w-full  h-auto data-[size=default]:h-auto data-[size=default]:min-h-[3.5rem]"
                    >
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Specialties */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold">
                    Specialties <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">Select all that apply</p>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_SPECIALTIES.map((specialty) => (
                      <button
                        key={specialty}
                        type="button"
                        onClick={() => toggleSpecialty(specialty)}
                        disabled={loading}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          specialties.includes(specialty)
                            ? "bg-orange-600 text-white hover:bg-orange-700"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {specialty}
                      </button>
                    ))}
                  </div>
                  {specialties.length === 0 && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Please select at least one specialty
                    </p>
                  )}
                </div>

                {/* Languages */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold">
                    Languages <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">Select all languages you speak</p>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_LANGUAGES.map((language) => (
                      <button
                        key={language}
                        type="button"
                        onClick={() => toggleLanguage(language)}
                        disabled={loading}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          languages.includes(language)
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {language}
                      </button>
                    ))}
                  </div>
                  {languages.length === 0 && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Please select at least one language
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div className="space-y-4">
                  <Label htmlFor="bio" className="text-sm font-semibold">
                    Bio <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself, your experience, and what makes your tours special..."
                    required
                    disabled={loading}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-sm text-muted-foreground">
                    {bio.length} characters (minimum 50 recommended)
                  </p>
                </div>

                {/* Image URL (Optional) */}
                <div className="space-y-4">
                  <Label htmlFor="image" className="text-sm font-semibold">
                    Profile Image URL (Optional)
                  </Label>
                  <Input
                    id="image"
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://example.com/your-photo.jpg"
                    disabled={loading}
                    className="py-6"
                  />
                  <p className="text-sm text-muted-foreground">
                    You can add your profile image later if you don't have one ready
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full py-6 bg-orange-600 hover:bg-orange-700 text-white text-md"
                  disabled={loading || specialties.length === 0 || languages.length === 0}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    "Create Guide Profile"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
