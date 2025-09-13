import { User } from "@prisma/client"

export function hasCompletedSetup(user: User): boolean {
  // Check if user has explicitly set up their preferences
  // We'll use a more lenient check - if they have a name set, consider setup complete
  // This prevents the default values from triggering completion
  return !!(user.name && user.name.trim().length > 0)
}

export function getSetupProgress(user: User): {
  completed: boolean
  stepsCompleted: number
  totalSteps: number
} {
  const steps = [
    !!(user.name && user.name.trim().length > 0), // Profile step
    !!user.currency, // Currency step (has default)
    !!user.timezone, // Timezone step (has default)
    !!(user.categories && user.categories.length > 0), // Categories step (has default)
    true // Security step is optional
  ]
  
  const stepsCompleted = steps.filter(Boolean).length
  const totalSteps = steps.length
  
  return {
    completed: !!(user.name && user.name.trim().length > 0), // Only complete if name is set
    stepsCompleted,
    totalSteps
  }
}
