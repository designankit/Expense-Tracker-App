"use client"

import AddExpenseDialog from "@/components/AddExpenseDialog"

interface QuickAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTransactionAdded?: () => void
}

export function QuickAddDialog({ open, onOpenChange, onTransactionAdded }: QuickAddDialogProps) {
  return (
    <AddExpenseDialog 
      open={open} 
      onOpenChange={onOpenChange}
      onExpenseAdded={async () => {
        onTransactionAdded?.()
      }}
    />
  )
}


