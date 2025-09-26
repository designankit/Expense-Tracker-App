"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { FloatingActionButton as FAB } from "@/components/ui/floating-action-button"
import { QuickAddDialog } from "@/components/transactions/QuickAddDialog"

interface GlobalFloatingActionButtonProps {
  onTransactionAdded?: () => void
}

export function GlobalFloatingActionButton({ onTransactionAdded }: GlobalFloatingActionButtonProps) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const pathname = usePathname()

  // Don't show FAB on auth pages or landing page
  const shouldShowFAB = !['/login', '/signup', '/', '/landing'].includes(pathname)

  if (!shouldShowFAB) {
    return null
  }

  return (
    <>
      <FAB
        onClick={() => setIsQuickAddOpen(true)}
        isOpen={isQuickAddOpen}
        className="fixed bottom-6 right-6 z-50"
      />
      
      <QuickAddDialog
        open={isQuickAddOpen}
        onOpenChange={setIsQuickAddOpen}
        onTransactionAdded={onTransactionAdded}
      />
    </>
  )
}
