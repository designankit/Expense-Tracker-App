"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { SearchProvider } from "@/contexts/SearchContext"
import { NotificationProvider } from "@/contexts/NotificationContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SearchProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </SearchProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
