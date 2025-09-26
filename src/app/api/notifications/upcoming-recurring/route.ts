import { NextRequest, NextResponse } from 'next/server'
import { notificationService } from '@/lib/notification-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check for upcoming recurring transactions
    await notificationService.checkUpcomingRecurringTransactions(userId)

    return NextResponse.json({ 
      success: true, 
      message: 'Upcoming recurring transactions check completed' 
    })
  } catch (error) {
    console.error('Error in upcoming recurring transactions check API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
