import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
    }
    
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

    // Create sample expenses
    const sampleExpenses = [
      {
        user_id: userId,
        title: "Grocery Shopping",
        amount: 150.50,
        category: "Food",
        transaction_date: new Date().toISOString().split('T')[0],
        transaction_type: "expense" as const
      },
      {
        user_id: userId,
        title: "Gas Station",
        amount: 45.00,
        category: "Transportation",
        transaction_date: new Date().toISOString().split('T')[0],
        transaction_type: "expense" as const
      },
      {
        user_id: userId,
        title: "Salary",
        amount: 3000.00,
        category: "Income",
        transaction_date: new Date().toISOString().split('T')[0],
        transaction_type: "income" as const
      },
      {
        user_id: userId,
        title: "Coffee Shop",
        amount: 5.50,
        category: "Food",
        transaction_date: new Date().toISOString().split('T')[0],
        transaction_type: "expense" as const
      },
      {
        user_id: userId,
        title: "Movie Tickets",
        amount: 25.00,
        category: "Entertainment",
        transaction_date: new Date().toISOString().split('T')[0],
        transaction_type: "expense" as const
      }
    ]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: expenses, error } = await (supabase as any)
      .from('expenses')
      .insert(sampleExpenses)
      .select()

    if (error) {
      console.error('Sample expenses creation error:', error)
      return NextResponse.json({ error: 'Failed to create sample expenses', details: error }, { status: 500 })
    }

    return NextResponse.json({ 
      expenses: expenses || [],
      count: expenses?.length || 0,
      message: 'Sample expenses created successfully'
    })
  } catch (error) {
    console.error('Sample expenses API error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 })
  }
}
