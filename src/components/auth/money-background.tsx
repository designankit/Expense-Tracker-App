"use client"

import { useEffect, useRef } from "react"

export function MoneyBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Create floating money elements
    const createMoneyElement = () => {
      const moneyElement = document.createElement("div")
      const size = Math.random() * 40 + 20
      const duration = Math.random() * 15 + 10
      const delay = Math.random() * 3
      
      // Random money symbols and emojis
      const moneySymbols = ["💰", "💵", "💸", "💳", "💎", "🏦", "📊", "💹", "💲", "💱"]
      const symbol = moneySymbols[Math.floor(Math.random() * moneySymbols.length)]
      
      moneyElement.textContent = symbol
      moneyElement.className = "absolute text-4xl opacity-20 animate-float"
      moneyElement.style.left = `${Math.random() * 100}%`
      moneyElement.style.top = `${Math.random() * 100}%`
      moneyElement.style.fontSize = `${size}px`
      moneyElement.style.animationDuration = `${duration}s`
      moneyElement.style.animationDelay = `${delay}s`
      
      container.appendChild(moneyElement)
      
      // Remove element after animation
      setTimeout(() => {
        if (moneyElement.parentNode) {
          moneyElement.parentNode.removeChild(moneyElement)
        }
      }, (duration + delay) * 1000)
    }

    // Create initial money elements
    for (let i = 0; i < 12; i++) {
      createMoneyElement()
    }

    // Create new elements periodically
    const interval = setInterval(createMoneyElement, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 25%, #1d4ed8 50%, #2563eb 75%, #3b82f6 100%)",
      }}
    >
      {/* Additional gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-blue-700/40" />
      <div className="absolute inset-0 bg-gradient-to-tl from-blue-800/20 via-transparent to-blue-600/20" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  )
}
