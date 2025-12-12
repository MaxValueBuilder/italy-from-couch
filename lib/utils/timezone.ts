import { format, formatInTimeZone, toZonedTime, fromZonedTime } from "date-fns-tz"
import { addMinutes } from "date-fns"

/**
 * Get user's timezone from browser
 */
export function getUserTimezone(): string {
  if (typeof window !== "undefined") {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }
  return "UTC"
}

/**
 * Convert a date from one timezone to another
 */
export function convertTimezone(
  date: Date,
  fromTimezone: string,
  toTimezone: string
): Date {
  const zonedDate = toZonedTime(date, fromTimezone)
  return fromZonedTime(zonedDate, toTimezone)
}

/**
 * Format date in a specific timezone
 */
export function formatInTimezone(
  date: Date,
  formatStr: string,
  timezone: string
): string {
  return formatInTimeZone(date, timezone, formatStr)
}

/**
 * Get timezone abbreviation (e.g., "CET", "EST")
 */
export function getTimezoneAbbr(timezone: string, date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    timeZoneName: "short",
  })
  const parts = formatter.formatToParts(date)
  const tzName = parts.find((part) => part.type === "timeZoneName")
  return tzName?.value || timezone
}

/**
 * Convert tour time to user's local time
 */
export function convertTourTimeToUserTime(
  tourTime: Date,
  tourTimezone: string,
  userTimezone: string
): Date {
  return convertTimezone(tourTime, tourTimezone, userTimezone)
}

/**
 * Format date with timezone info for display
 */
export function formatWithTimezone(
  date: Date,
  timezone: string,
  includeDate: boolean = true
): string {
  const dateStr = includeDate
    ? formatInTimeZone(date, timezone, "MMM d, yyyy")
    : ""
  const timeStr = formatInTimeZone(date, timezone, "h:mm a")
  const tzAbbr = getTimezoneAbbr(timezone, date)

  return includeDate ? `${dateStr} at ${timeStr} ${tzAbbr}` : `${timeStr} ${tzAbbr}`
}

/**
 * Get all available timezones (common ones for Italy tours)
 */
export const COMMON_TIMEZONES = [
  { value: "Europe/Rome", label: "Rome (CET/CEST)", abbr: "CET" },
  { value: "America/New_York", label: "New York (EST/EDT)", abbr: "EST" },
  { value: "America/Chicago", label: "Chicago (CST/CDT)", abbr: "CST" },
  { value: "America/Denver", label: "Denver (MST/MDT)", abbr: "MST" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST/PDT)", abbr: "PST" },
  { value: "Europe/London", label: "London (GMT/BST)", abbr: "GMT" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)", abbr: "CET" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)", abbr: "JST" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)", abbr: "AEST" },
]

/**
 * Get timezone for a city (Italy cities use Europe/Rome)
 */
export function getCityTimezone(city: string): string {
  const cityTimezones: Record<string, string> = {
    Rome: "Europe/Rome",
    Florence: "Europe/Rome",
    Venice: "Europe/Rome",
  }
  return cityTimezones[city] || "Europe/Rome"
}

/**
 * Check if a date is in the past
 */
export function isPastDate(date: Date, timezone: string): boolean {
  const now = new Date()
  const zonedDate = toZonedTime(date, timezone)
  const zonedNow = toZonedTime(now, timezone)
  return zonedDate < zonedNow
}

/**
 * Add duration to a date in a specific timezone
 */
export function addDuration(date: Date, minutes: number, timezone: string): Date {
  const zonedDate = toZonedTime(date, timezone)
  const newDate = addMinutes(zonedDate, minutes)
  return fromZonedTime(newDate, timezone)
}

