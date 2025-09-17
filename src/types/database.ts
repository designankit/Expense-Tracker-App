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
