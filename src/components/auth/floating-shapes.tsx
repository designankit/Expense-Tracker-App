"use client"

import { useEffect, useRef } from "react"

export function FloatingShapes() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Create floating shapes
    const createShape = () => {
      const shape = document.createElement("div")
      const size = Math.random() * 100 + 50
      const duration = Math.random() * 20 + 10
      const delay = Math.random() * 5
      
      shape.className = "absolute rounded-full opacity-20 animate-float"
      shape.style.width = `${size}px`
      shape.style.height = `${size}px`
      shape.style.left = `${Math.random() * 100}%`
      shape.style.top = `${Math.random() * 100}%`
      shape.style.animationDuration = `${duration}s`
      shape.style.animationDelay = `${delay}s`
      
      // Random gradient colors
      const gradients = [
        "bg-gradient-to-br from-blue-400 to-purple-500",
        "bg-gradient-to-br from-purple-400 to-pink-500",
        "bg-gradient-to-br from-pink-400 to-red-500",
        "bg-gradient-to-br from-green-400 to-blue-500",
        "bg-gradient-to-br from-yellow-400 to-orange-500",
        "bg-gradient-to-br from-indigo-400 to-purple-500",
      ]
      
      shape.className += ` ${gradients[Math.floor(Math.random() * gradients.length)]}`
      
      container.appendChild(shape)
      
      // Remove shape after animation
      setTimeout(() => {
        if (shape.parentNode) {
          shape.parentNode.removeChild(shape)
        }
      }, (duration + delay) * 1000)
    }

    // Create initial shapes
    for (let i = 0; i < 8; i++) {
      createShape()
    }

    // Create new shapes periodically
    const interval = setInterval(createShape, 3000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
      }}
    >
      {/* Additional gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-pink-900/30" />
      <div className="absolute inset-0 bg-gradient-to-tl from-indigo-900/20 via-transparent to-cyan-900/20" />
    </div>
  )
}
