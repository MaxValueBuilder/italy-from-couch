"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { translations } from "./translations"

interface I18nContextType {
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const defaultContext: I18nContextType = {
  t: (key: string) => key,
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const t = (key: string): string => {
    const keys = key.split(".")
    let value: any = translations
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }

  return <I18nContext.Provider value={{ t }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    return defaultContext
  }
  return context
}
