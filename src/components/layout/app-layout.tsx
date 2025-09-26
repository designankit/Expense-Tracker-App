"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { GlobalFloatingActionButton } from "./FloatingActionButton"

interface AppLayoutProps {
  children: React.ReactNode
  onTransactionAdded?: () => void
}

export function AppLayout({ children, onTransactionAdded }: AppLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <div className="flex h-screen bg-emerald-50 dark:bg-gray-900">
      {/* Sidebar - Hidden on mobile, visible on tablet and up */}
      <div className="hidden lg:block">
        <Sidebar 
          isCollapsed={isCollapsed} 
          onToggle={toggleSidebar}
        />
      </div>
      
      {/* Mobile Sidebar Overlay */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar 
          isCollapsed={false} 
          onToggle={() => setIsMobileMenuOpen(false)}
          className="h-full"
        />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <DashboardHeader onMobileMenuToggle={toggleMobileMenu} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-white dark:bg-gray-900">
          <div className="min-h-full max-w-none mx-0 p-0">
            <div className="p-0">
            {children}
            </div>
          </div>
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Global Floating Action Button */}
      <GlobalFloatingActionButton onTransactionAdded={onTransactionAdded} />
    </div>
  )
}
