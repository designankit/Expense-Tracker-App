import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Sample transactions data
    const sampleTransactions = [
      {
        user_id: userId,
        title: 'Salary',
        amount: 50000,
        category: 'Income',
        transaction_date: new Date().toISOString().split('T')[0],
        transaction_type: 'income' as const,
        created_at: new Date().toISOString(),
      },
      {
        user_id: userId,
        title: 'Freelance Work',
        amount: 15000,
        category: 'Income',
        transaction_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        transaction_type: 'income' as const,
        created_at: new Date().toISOString(),
      },
      {
        user_id: userId,
        title: 'Rent',
        amount: 12000,
        category: 'Housing',
        transaction_date: new Date().toISOString().split('T')[0],
        transaction_type: 'expense' as const,
        created_at: new Date().toISOString(),
      },
      {
        user_id: userId,
        title: 'Groceries',
        amount: 3500,
        category: 'Food',
        transaction_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        transaction_type: 'expense' as const,
        created_at: new Date().toISOString(),
      },
      {
        user_id: userId,
        title: 'Transportation',
        amount: 2000,
        category: 'Transport',
        transaction_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        transaction_type: 'expense' as const,
        created_at: new Date().toISOString(),
      },
      {
        user_id: userId,
        title: 'Entertainment',
        amount: 1500,
        category: 'Entertainment',
        transaction_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        transaction_type: 'expense' as const,
        created_at: new Date().toISOString(),
      },
      {
        user_id: userId,
        title: 'Utilities',
        amount: 2500,
        category: 'Utilities',
        transaction_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        transaction_type: 'expense' as const,
        created_at: new Date().toISOString(),
      },
      {
        user_id: userId,
        title: 'Healthcare',
        amount: 3000,
        category: 'Healthcare',
        transaction_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        transaction_type: 'expense' as const,
        created_at: new Date().toISOString(),
      }
    ]

    // Sample savings goals data
    const sampleSavingsGoals = [
      {
        user_id: userId,
        goal_name: 'Emergency Fund',
        target_amount: 100000,
        saved_amount: 25000,
        target_date: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
        priority: 'High' as const,
        goal_icon: 'PiggyBank',
        description: 'Build a safety net for unexpected expenses',
        created_at: new Date().toISOString(),
      },
      {
        user_id: userId,
        goal_name: 'Vacation Fund',
        target_amount: 50000,
        saved_amount: 15000,
        target_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
        priority: 'Medium' as const,
        goal_icon: 'Plane',
        description: 'Summer vacation fund',
        created_at: new Date().toISOString(),
      }
    ]

    // Insert sample transactions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: transactionsData, error: transactionsError } = await (supabase as any)
      .from('expenses')
      .insert(sampleTransactions)
      .select()

    if (transactionsError) {
      console.error('Error inserting transactions:', transactionsError)
      return NextResponse.json({ error: 'Failed to insert transactions' }, { status: 500 })
    }

    // Insert sample savings goals
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: savingsData, error: savingsError } = await (supabase as any)
      .from('savings')
      .insert(sampleSavingsGoals)
      .select()

    if (savingsError) {
      console.error('Error inserting savings goals:', savingsError)
      return NextResponse.json({ error: 'Failed to insert savings goals' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Sample data added successfully',
      transactions: transactionsData?.length || 0,
      savings: savingsData?.length || 0
    }, { status: 200 })

  } catch (error: unknown) {
    console.error('Error adding sample data:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}