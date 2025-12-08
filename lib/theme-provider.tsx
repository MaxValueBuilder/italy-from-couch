"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface ThemeContextType {
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [theme, setThemeState] = useState<"light" | "dark">("light")

  useEffect(() => {
    // Check localStorage and system preference
    const saved = localStorage.getItem("theme") as "light" | "dark" | null
    const isDark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches

    const initialTheme = isDark ? "dark" : "light"
    setThemeState(initialTheme)
    applyTheme(initialTheme)
    setMounted(true)

    // Listen for storage changes (cross-tab synchronization)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme" && e.newValue) {
        const newTheme = e.newValue as "light" | "dark"
        setThemeState(newTheme)
        applyTheme(newTheme)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const applyTheme = (theme: "light" | "dark") => {
    const html = document.documentElement
    if (theme === "dark") {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }
  }

  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme)
    localStorage.setItem("theme", newTheme)
    applyTheme(newTheme)
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div data-theme={theme}>{children}</div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    // Fallback for when used outside provider
  return {
      theme: typeof document !== "undefined" 
        ? (document.documentElement.classList.contains("dark") ? "dark" : "light")
        : "light",
    setTheme: (newTheme: "light" | "dark") => {
      if (typeof document !== "undefined") {
        const html = document.documentElement
        if (newTheme === "dark") {
          html.classList.add("dark")
        } else {
          html.classList.remove("dark")
        }
        localStorage.setItem("theme", newTheme)
      }
    },
  }
  }
  return context
}
