"use client"

import * as React from "react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import {
  CreditCard,
  Home,
  Receipt,
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
      url: "/",
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
        isCollapsed ? "w-16" : "w-64",
        className
      )}
      {...props}
    >
              <div className="flex h-16 items-center px-6 border-b relative">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <Receipt className="h-6 w-6" />
            <span className="text-lg font-semibold">ExpenseTracker</span>
          </div>
        )}
        {isCollapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center w-full">
                <Receipt className="h-8 w-8" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>ExpenseTracker</p>
            </TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onToggle}
              className="h-10 w-10 absolute -right-5 top-1/2 -translate-y-1/2 bg-background border-2 hover:bg-accent transition-all duration-200 shadow-lg hover:shadow-xl z-10"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{isCollapsed ? "Expand sidebar" : "Collapse sidebar"}</p>
          </TooltipContent>
        </Tooltip>
      </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="space-y-1 px-3">
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
                          "w-full justify-center px-2",
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
                      "w-full justify-start px-3",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                      asChild
                    >
                      <a href={item.url} className="flex items-center space-x-3">
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span>{item.title}</span>
                      </a>
                    </Button>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
        <div className="p-3 border-t">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  className="w-full px-2" 
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
              className="w-full px-3" 
              size="sm"
              onClick={() => setIsAddExpenseOpen(true)}
            >
              <Plus className="h-4 w-4 flex-shrink-0" />
              <span className="ml-2">Add Expense</span>
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