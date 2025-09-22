"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface ConfettiAnimationProps {
  trigger: boolean
  onComplete?: () => void
}

export function ConfettiAnimation({ trigger, onComplete }: ConfettiAnimationProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (trigger) {
      setShowConfetti(true)
      const timer = setTimeout(() => {
        setShowConfetti(false)
        onComplete?.()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [trigger, onComplete])

  if (!showConfetti) return null

  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    x: Math.random() * 100,
    color: ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'][Math.floor(Math.random() * 5)]
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: piece.color,
            left: `${piece.x}%`,
            top: '-10px'
          }}
          initial={{ y: -10, rotate: 0 }}
          animate={{
            y: window.innerHeight + 10,
            rotate: 360,
            x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50]
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* Sparkle effects */}
      {Array.from({ length: 20 }, (_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-1 h-1 bg-yellow-400 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [1, 1, 0]
          }}
          transition={{
            duration: 1,
            delay: Math.random() * 2,
            repeat: 2
          }}
        />
      ))}
    </div>
  )
}
