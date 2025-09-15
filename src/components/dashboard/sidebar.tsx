"use client"

import * as React from "react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import {
  CreditCard,
  Home,
  Settings,
  BarChart3,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import AddExpenseDialog from "@/components/AddExpenseDialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Expenses",
      url: "/expenses",
      icon: CreditCard,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ className, isCollapsed = false, onToggle, ...props }: SidebarProps) {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const pathname = usePathname()

  return (
    <TooltipProvider>
          <div
      className={cn(
        "flex h-full flex-col bg-background border-r transition-all duration-300 relative",
        isCollapsed ? "w-16 sm:w-20" : "w-72",
        "hidden sm:flex", // Hide on mobile by default
        "sm:relative sm:translate-x-0", // Desktop positioning
        "fixed inset-y-0 left-0 z-50 translate-x-0", // Mobile positioning when shown
        className
      )}
      {...props}
    >
              <div className="flex h-14 sm:h-16 items-center px-2 sm:px-4 border-b relative">
        {!isCollapsed && (
          <div className="flex items-center justify-center w-full h-full">
            <img
              src="/Expensio%20Tracker%20Logo.png"
              alt="Expensio Tracker"
              className="h-10 w-3/4 sm:h-12 sm:w-3/4 object-contain mx-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                if (nextElement) {
                  nextElement.style.display = 'block';
                }
              }}
            />
            <div className="text-center hidden">
              <div className="text-xl sm:text-2xl font-bold text-primary mb-1">ET</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Expensio Tracker</div>
            </div>
          </div>
        )}
        {isCollapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center w-full h-full">
                <img
                  src="/Favicon.png"
                  alt="Expensio Tracker"
                  className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = 'block';
                    }
                  }}
                />
                <div className="text-lg sm:text-xl font-bold text-primary hidden">ET</div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Expensio Tracker</p>
            </TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8 sm:h-10 sm:w-10 absolute -right-4 sm:-right-5 top-1/2 -translate-y-1/2 bg-background border-2 hover:bg-accent transition-all duration-200 shadow-lg hover:shadow-xl z-10"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{isCollapsed ? "Expand sidebar" : "Collapse sidebar"}</p>
          </TooltipContent>
        </Tooltip>
      </div>
        <div className="flex-1 overflow-auto py-3 sm:py-4">
          <nav className="space-y-1 px-2 sm:px-3">
            {data.navMain.map((item) => {
              const isActive = pathname === item.url
              
              return (
                <div key={item.title}>
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-center px-1 sm:px-2 h-8 sm:h-10",
                          isActive && "bg-primary text-primary-foreground"
                        )}
                          asChild
                        >
                          <a href={item.url}>
                            <item.icon className="h-4 w-4" />
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
                      "w-full justify-start px-2 sm:px-3 h-8 sm:h-10 text-sm sm:text-base",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                      asChild
                    >
                      <a href={item.url} className="flex items-center space-x-2 sm:space-x-3">
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </a>
                    </Button>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
        <div className="p-2 sm:p-3 border-t">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  className="w-full px-1 sm:px-2 h-8 sm:h-10" 
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
              className="w-full px-2 sm:px-3 h-8 sm:h-10 text-sm sm:text-base" 
              size="sm"
              onClick={() => setIsAddExpenseOpen(true)}
            >
              <Plus className="h-4 w-4 flex-shrink-0" />
              <span className="ml-2 truncate">Add Expense</span>
            </Button>
          )}
        </div>
      </div>
      
      {/* Add Expense Dialog */}
      <AddExpenseDialog 
        open={isAddExpenseOpen} 
        onOpenChange={setIsAddExpenseOpen} 
      />
    </TooltipProvider>
  )
}