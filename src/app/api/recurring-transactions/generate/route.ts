import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST() {
  try {
    
    // Call the database function to generate recurring transactions
    const { data, error } = await supabase.rpc('generate_recurring_transactions')
    
    if (error) {
      console.error('Error generating recurring transactions:', error)
      return NextResponse.json(
        { error: 'Failed to generate recurring transactions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Recurring transactions generated successfully',
      data 
    })
  } catch (error) {
    console.error('Error in generate recurring transactions API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get all recurring transactions for the user
    const { data: recurringTransactions, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
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
