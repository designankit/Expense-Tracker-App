"use client"

import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FloatingActionButtonProps {
  onClick: () => void
  isOpen?: boolean
  className?: string
}

export function FloatingActionButton({ 
  onClick, 
  isOpen = false, 
  className = "" 
}: FloatingActionButtonProps) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className={`fixed bottom-6 right-6 z-50 ${className}`}
    >
      <Button
        onClick={onClick}
        size="lg"
        className="h-14 w-14 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-200 group"
        aria-label="Add new expense"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Plus className="h-6 w-6 text-white" />
          )}
        </motion.div>
      </Button>
      
      {/* Ripple effect on click */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 1.2, opacity: 0 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="absolute inset-0 rounded-full bg-emerald-500"
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
