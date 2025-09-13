"use client"

import { useEffect, useRef } from "react"
import { DollarSign, TrendingUp, PiggyBank, CreditCard } from "lucide-react"

export function MoneyCharacter() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Create floating money icons
    const createFloatingIcon = () => {
      const icon = document.createElement("div")
      const icons = ["💰", "💵", "💸", "💳", "💎"]
      const selectedIcon = icons[Math.floor(Math.random() * icons.length)]
      
      icon.textContent = selectedIcon
      icon.className = "absolute text-2xl opacity-30 animate-float"
      icon.style.left = `${Math.random() * 100}%`
      icon.style.top = `${Math.random() * 100}%`
      icon.style.animationDuration = `${Math.random() * 8 + 4}s`
      icon.style.animationDelay = `${Math.random() * 2}s`
      
      container.appendChild(icon)
      
      // Remove after animation
      setTimeout(() => {
        if (icon.parentNode) {
          icon.parentNode.removeChild(icon)
        }
      }, 12000)
    }

    // Create initial icons
    for (let i = 0; i < 6; i++) {
      createFloatingIcon()
    }

    // Create new icons periodically
    const interval = setInterval(createFloatingIcon, 3000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center p-8">
      {/* Background with floating icons */}
      <div 
        ref={containerRef}
        className="absolute inset-0 overflow-hidden rounded-2xl m-4"
        style={{
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #bae6fd 50%, #7dd3fc 75%, #38bdf8 100%)"
        }}
      />
      
      {/* Main character area */}
      <div className="relative z-10 text-center space-y-6">
        {/* Animated piggy bank */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center animate-pulse-glow shadow-2xl animate-piggy-bounce">
            <PiggyBank className="w-16 h-16 text-white" />
          </div>
          {/* Floating coins around piggy bank */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center animate-money-float">
            <DollarSign className="w-4 h-4 text-blue-800 animate-coin-spin" />
          </div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-300 rounded-full flex items-center justify-center animate-money-float" style={{ animationDelay: '1s' }}>
            <CreditCard className="w-3 h-3 text-blue-800" />
          </div>
          <div className="absolute top-4 -left-4 w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center animate-money-float" style={{ animationDelay: '2s' }}>
            <span className="text-xs">💰</span>
          </div>
        </div>

        {/* Motivational text */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-800">
            Track Your Expenses
          </h3>
          <p className="text-gray-600 text-sm">
            Every penny counts! Start managing your money wisely.
          </p>
        </div>

        {/* Stats or tips */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/50 rounded-2xl p-3 backdrop-blur-sm shadow-lg">
            <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-gray-700 font-medium">Save More</p>
          </div>
          <div className="bg-white/50 rounded-2xl p-3 backdrop-blur-sm shadow-lg">
            <CreditCard className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-gray-700 font-medium">Track All</p>
          </div>
        </div>

        {/* Animated progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"
            style={{ width: '75%' }}
          />
        </div>
        <p className="text-xs text-gray-600">Financial Health: 75%</p>
      </div>
    </div>
  )
}
