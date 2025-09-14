"use client"

import { ThemeProvider } from "next-themes"
import { SearchProvider } from "@/contexts/SearchContext"
import { NotificationProvider } from "@/contexts/NotificationContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
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
  )
}
