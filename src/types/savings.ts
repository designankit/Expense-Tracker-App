export interface Savings {
  id: string
  user_id: string
  goal_name: string
  target_amount: number
  saved_amount: number
  target_date?: string
  priority: 'High' | 'Medium' | 'Low'
  goal_icon: string
  description?: string
  created_at: string
}

export interface GoalContribution {
  id: string
  goal_id: string
  user_id: string
  amount: number
  contribution_date: string
  note?: string
  created_at: string
}

export interface CreateSavings {
  goal_name: string
  target_amount: number
  saved_amount?: number
  target_date?: string
  priority?: 'High' | 'Medium' | 'Low'
  goal_icon?: string
  description?: string
}

export interface UpdateSavings {
  goal_name?: string
  target_amount?: number
  saved_amount?: number
  target_date?: string
  priority?: 'High' | 'Medium' | 'Low'
  goal_icon?: string
  description?: string
}

export interface CreateContribution {
  goal_id: string
  amount: number
  contribution_date?: string
  note?: string
}

export type GoalStatus = 'On Track' | 'Slightly Behind' | 'At Risk' | 'Completed'
export type PriorityLevel = 'High' | 'Medium' | 'Low'
