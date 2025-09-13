"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DashboardSkeleton } from "./dashboard-skeleton"

export function SkeletonDemo() {
  const [showSkeleton, setShowSkeleton] = useState(false)

  const toggleSkeleton = () => {
    setShowSkeleton(!showSkeleton)
    if (!showSkeleton) {
      // Auto-hide skeleton after 3 seconds for demo
      setTimeout(() => setShowSkeleton(false), 3000)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <Button onClick={toggleSkeleton} variant="outline">
          {showSkeleton ? "Hide" : "Show"} Skeleton Loader
        </Button>
      </div>
      {showSkeleton && <DashboardSkeleton />}
    </div>
  )
}
