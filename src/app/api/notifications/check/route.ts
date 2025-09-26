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

    // Run all notification checks
    await notificationService.runAllChecks(userId)

    return NextResponse.json({ 
      success: true, 
      message: 'Notification checks completed' 
    })
  } catch (error) {
    console.error('Error in notification check API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
