"use client"

import { useI18n } from "@/lib/i18n/context"
import { useTheme } from "@/lib/theme-provider"
import { useAuth } from "@/lib/auth/context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, X, Sun, Moon, User, LogOut } from "lucide-react"

export function Header() {
  const i18n = useI18n()
  const theme = useTheme()
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navLinks = [
    { href: "/", label: i18n.t("nav.home") },
    { href: "/about", label: i18n.t("nav.about") },
    { href: "/tours", label: i18n.t("nav.tours") },
    { href: "/bookings", label: "Bookings" },
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
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href))
            return (
            <Link
              key={link.href}
              href={link.href}
                className={`text-sm transition-colors ${
                  isActive
                    ? "text-orange-600 dark:text-orange-400 font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {link.label}
            </Link>
            )
          })}
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
            <div className="hidden sm:flex items-center py-20">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 transition-all hover:opacity-80">
                    <Avatar className="h-9 w-9 border-2 border-border hover:border-orange-600 transition-colors">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "User"} />
                      <AvatarFallback className="bg-orange-600 text-white font-semibold">
                        {user.displayName
                          ? user.displayName.charAt(0).toUpperCase()
                          : user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 py-2 px-2">
                  <DropdownMenuLabel className="font-normal py-4 px-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.displayName || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="py-3 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-orange-50 dark:focus:bg-orange-900/20 focus:text-orange-600 dark:focus:text-orange-400">
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator/>
                  <DropdownMenuItem
                    onClick={signOut}
                    className="py-3 text-red-600 dark:text-red-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-orange-50 dark:focus:bg-orange-900/20 focus:text-orange-600 dark:focus:text-orange-400"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/login">
                <Button variant="outline" className="hover:text-orange-600 hover:bg-orange-50">
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
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href))
              return (
              <Link
                key={link.href}
                href={link.href}
                  className={`block px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "text-orange-600 dark:text-orange-400 font-semibold bg-orange-50 dark:bg-orange-900/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
              )
            })}
            {user ? (
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-3 px-3 py-2 border-b border-border pb-4">
                  <Avatar className="h-10 w-10 border-2 border-border">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "User"} />
                    <AvatarFallback className="bg-orange-600 text-white font-semibold">
                      {user.displayName
                        ? user.displayName.charAt(0).toUpperCase()
                        : user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-foreground">
                      {user.displayName || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    Profile
                  </div>
                </Link>
                <button
                  onClick={() => {
                    signOut()
                    setIsMenuOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-muted rounded-lg transition-colors flex items-center gap-2"
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
