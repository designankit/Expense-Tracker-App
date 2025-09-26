import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseClient'
import { notificationService } from '@/lib/notification-service'

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a cron job (you can add additional security here)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient()

    // Generate recurring transactions
    const { data: generateResult, error: generateError } = await supabase.rpc('generate_recurring_transactions')
    
    if (generateError) {
      console.error('Error generating recurring transactions:', generateError)
    }

    // Get all active users to run notification checks
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        auth_users:user_id (
          id,
          email
        )
      `)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Run notification checks for all users
    if (users && users.length > 0) {
      const notificationPromises = users.map(user => 
        notificationService.runAllChecks(user.id, user.auth_users?.email)
      )
      
      await Promise.all(notificationPromises)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Daily cron job completed successfully',
      generatedTransactions: generateResult,
      usersChecked: users?.length || 0
    })
  } catch (error) {
    console.error('Error in daily cron job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Allow GET for testing
export async function GET() {
  return NextResponse.json({ 
    message: 'Daily cron endpoint is active',
    timestamp: new Date().toISOString()
  })
}
