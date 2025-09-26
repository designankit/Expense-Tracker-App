export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          title: string
          amount: number
          category: string | null
          transaction_date: string | null
          transaction_type: 'income' | 'expense'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          amount: number
          category?: string | null
          transaction_date?: string | null
          transaction_type?: 'income' | 'expense'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          amount?: number
          category?: string | null
          transaction_date?: string | null
          transaction_type?: 'income' | 'expense'
          created_at?: string
        }
      }
      custom_categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          transaction_type: 'income' | 'expense'
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          transaction_type: 'income' | 'expense'
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          transaction_type?: 'income' | 'expense'
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          read: boolean
          action_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          read?: boolean
          action_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'info' | 'success' | 'warning' | 'error'
          read?: boolean
          action_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recurring_transactions: {
        Row: {
          id: string
          user_id: string
          title: string
          amount: number
          category: string | null
          transaction_type: 'income' | 'expense'
          frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
          start_date: string
          end_date: string | null
          next_due_date: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          amount: number
          category?: string | null
          transaction_type: 'income' | 'expense'
          frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
          start_date: string
          end_date?: string | null
          next_due_date: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          amount?: number
          category?: string | null
          transaction_type?: 'income' | 'expense'
          frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
          start_date?: string
          end_date?: string | null
          next_due_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Expense = Database['public']['Tables']['expenses']['Row']
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert']
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update']

export type Notification = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']

export type RecurringTransaction = Database['public']['Tables']['recurring_transactions']['Row']
export type RecurringTransactionInsert = Database['public']['Tables']['recurring_transactions']['Insert']
export type RecurringTransactionUpdate = Database['public']['Tables']['recurring_transactions']['Update']
