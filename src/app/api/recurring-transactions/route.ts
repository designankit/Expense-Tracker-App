import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseClient'
import { calculateNextDueDate } from '@/types/recurring-transaction'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    
    const { 
      userId, 
      title, 
      amount, 
      category, 
      transaction_type, 
      frequency, 
      start_date, 
      end_date 
    } = body

    if (!userId || !title || !amount || !transaction_type || !frequency || !start_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate next due date
    const startDate = new Date(start_date)
    const nextDueDate = calculateNextDueDate(frequency, startDate)

    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert([{
        user_id: userId,
        title,
        amount: parseFloat(amount),
        category,
        transaction_type,
        frequency,
        start_date,
        end_date: end_date || null,
        next_due_date: nextDueDate.toISOString().split('T')[0],
        is_active: true
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating recurring transaction:', error)
      return NextResponse.json(
        { error: 'Failed to create recurring transaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({ recurringTransaction: data })
  } catch (error) {
    console.error('Error in create recurring transaction API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const { data: recurringTransactions, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('next_due_date', { ascending: true })

    if (error) {
      console.error('Error fetching recurring transactions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch recurring transactions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ recurringTransactions })
  } catch (error) {
    console.error('Error in get recurring transactions API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

