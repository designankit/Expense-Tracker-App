"use client"

import { ThemeProvider } from "next-themes"
import { SearchProvider } from "@/contexts/SearchContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { SupabaseProvider } from "@/components/supabase-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SupabaseProvider>
        <SearchProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </SearchProvider>
      </SupabaseProvider>
    </ThemeProvider>
  )
}
