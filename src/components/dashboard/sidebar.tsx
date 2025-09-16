"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Receipt, 
  BarChart3, 
  Settings, 
  Plus,
  Menu,
  X
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import AddExpenseDialog from "@/components/AddExpenseDialog"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean
  onToggle?: () => void
}

const navigationItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard",
  },
  {
    title: "Expenses",
    icon: Receipt,
    url: "/expenses",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    url: "/analytics",
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/settings",
  },
]

export function Sidebar({ 
  className, 
  isCollapsed = false, 
  onToggle,
  ...props 
}: SidebarProps) {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)

  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex h-full flex-col bg-background/80 backdrop-blur-md border-r border-border/50 transition-all duration-300 relative",
          isCollapsed ? "w-16 sm:w-20" : "w-72",
          "hidden sm:flex", // Hide on mobile by default
          "sm:relative sm:translate-x-0", // Desktop positioning
          "fixed inset-y-0 left-0 z-50 translate-x-0", // Mobile positioning when shown
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="flex h-16 sm:h-18 items-center px-3 sm:px-4 border-b border-border/50 relative">
          {!isCollapsed && (
            <div className="flex items-center justify-center w-full h-full">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Finance Tracker</div>
              </div>
            </div>
          )}
          {isCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center w-full h-full">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">F</div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Finance Tracker</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = false // You can implement active state logic here
            const Icon = item.icon

            return (
              <div key={item.title}>
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-center px-2 h-10 rounded-xl transition-all duration-200",
                          isActive && "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                        )}
                        asChild
                      >
                        <a href={item.url}>
                          <Icon className="h-4 w-4" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start px-4 h-11 text-sm font-medium rounded-xl transition-all duration-200",
                      isActive && "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    )}
                    asChild
                  >
                    <a href={item.url} className="flex items-center space-x-3">
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </a>
                  </Button>
                )}
              </div>
            )
          })}
        </nav>

        {/* Add Expense Button */}
        <div className="p-3 sm:p-4 border-t border-border/50">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  className="w-full px-2 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-xl" 
                  size="sm"
                  onClick={() => setIsAddExpenseOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Add Expense</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button 
              className="w-full px-4 h-11 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-xl" 
              size="sm"
              onClick={() => setIsAddExpenseOpen(true)}
            >
              <Plus className="h-4 w-4 flex-shrink-0" />
              <span className="ml-2 truncate">Add Expense</span>
            </Button>
          )}
        </div>

        {/* Add Expense Dialog */}
        <AddExpenseDialog 
          open={isAddExpenseOpen} 
          onOpenChange={setIsAddExpenseOpen}
          onSubmit={() => {
            setIsAddExpenseOpen(false)
          }}
          onExpenseAdded={async () => {
            setIsAddExpenseOpen(false)
          }}
        />
      </div>
    </TooltipProvider>
  )
}