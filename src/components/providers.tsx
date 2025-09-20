"use client"

import { ThemeProvider } from "next-themes"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { UserPreferencesProvider } from "@/contexts/UserPreferencesContext"
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
        <UserPreferencesProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </UserPreferencesProvider>
      </SupabaseProvider>
    </ThemeProvider>
  )
}
