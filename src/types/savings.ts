export interface Savings {
  id: string
  user_id: string
  goal_name: string
  target_amount: number
  saved_amount: number
  created_at: string
}

export interface CreateSavings {
  goal_name: string
  target_amount: number
  saved_amount?: number
}

export interface UpdateSavings {
  goal_name?: string
  target_amount?: number
  saved_amount?: number
}
