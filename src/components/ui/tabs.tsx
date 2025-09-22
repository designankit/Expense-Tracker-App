"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-14 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800/50 p-1.5 text-gray-600 dark:text-gray-400 border-2 border-gray-200/50 dark:border-gray-700/50 shadow-lg backdrop-blur-sm gap-1",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-3 text-sm font-semibold ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      // Base inactive state - subtle but visible
      "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:scale-[1.02] hover:shadow-sm",
      // Active state - prominent with color coding
      "data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg data-[state=active]:scale-105 data-[state=active]:border-2 data-[state=active]:border-slate-200 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-white dark:data-[state=active]:border-slate-400",
      // Special styling for expense/income tabs
      "data-[value=expenses]:data-[state=active]:border-rose-300 data-[value=expenses]:data-[state=active]:bg-rose-50 dark:data-[value=expenses]:data-[state=active]:border-rose-400 dark:data-[value=expenses]:data-[state=active]:bg-rose-950/20",
      "data-[value=incomes]:data-[state=active]:border-emerald-300 data-[value=incomes]:data-[state=active]:bg-emerald-50 dark:data-[value=incomes]:data-[state=active]:border-emerald-400 dark:data-[value=incomes]:data-[state=active]:bg-emerald-950/20",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
