import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseClient'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data: recurringTransaction, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching recurring transaction:', error)
      return NextResponse.json(
        { error: 'Failed to fetch recurring transaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({ recurringTransaction })
  } catch (error) {
    console.error('Error in get recurring transaction API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { userId, ...updateData } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const { data: recurringTransaction, error } = await supabase
      .from('recurring_transactions')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating recurring transaction:', error)
      return NextResponse.json(
        { error: 'Failed to update recurring transaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({ recurringTransaction })
  } catch (error) {
    console.error('Error in update recurring transaction API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { error } = await supabase
      .from('recurring_transactions')
      .delete()
      .eq('id', params.id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting recurring transaction:', error)
      return NextResponse.json(
        { error: 'Failed to delete recurring transaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in delete recurring transaction API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
