"use client"

import { useI18n } from "@/lib/i18n/context"
import { useTheme } from "@/lib/theme-provider"
import { useAuth } from "@/lib/auth/context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X, Sun, Moon, User, LogOut } from "lucide-react"

export function Header() {
  const i18n = useI18n()
  const theme = useTheme()
  const { user, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navLinks = [
    { href: "/", label: i18n.t("nav.home") },
    { href: "/about", label: i18n.t("nav.about") },
    { href: "/tours", label: i18n.t("nav.tours") },
    { href: "/guides", label: i18n.t("nav.guides") },
    { href: "/blog", label: i18n.t("nav.blog") },
    { href: "/faq", label: i18n.t("nav.faq") },
    { href: "/contact", label: i18n.t("nav.contact") },
  ]

  // Don't render interactive content until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-bold text-xl tracking-wider text-foreground hover:text-orange-600 transition-colors"
          >
            ITALY FROM COUCH
          </Link>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-bold text-xl tracking-wider text-foreground hover:text-orange-600 transition-colors"
        >
          ITALY FROM COUCH
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <button
            onClick={() => theme.setTheme(theme.theme === "light" ? "dark" : "light")}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            {theme.theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Auth buttons - desktop */}
          {user ? (
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/profile">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <User size={16} />
                  {user.displayName || user.email?.split("@")[0]}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="flex items-center gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="max-w-6xl mx-auto px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <div className="space-y-2 mt-4">
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    {user.displayName || user.email?.split("@")[0]}
                  </div>
                </Link>
                <button
                  onClick={() => {
                    signOut()
                    setIsMenuOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2 mt-4">
                <Link
                  href="/login"
                  className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block w-full bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg transition-colors text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
