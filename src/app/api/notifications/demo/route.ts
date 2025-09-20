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

    // Create demo notifications
    const demoNotifications = [
      {
        user_id: userId,
        title: "Welcome to Expensio!",
        message: "Your expense tracker is ready to use. Start by adding your first expense.",
        type: "success" as const,
        action_url: "/expenses"
      },
      {
        user_id: userId,
        title: "Search Feature Available",
        message: "You can now search through your expenses using the search bar in the header.",
        type: "info" as const,
        action_url: "/expenses"
      },
      {
        user_id: userId,
        title: "Budget Alert",
        message: "You've spent 80% of your monthly budget. Consider reviewing your expenses.",
        type: "warning" as const,
        action_url: "/analytics"
      }
    ]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: notifications, error } = await (supabase as any)
      .from('notifications')
      .insert(demoNotifications)
      .select()

    if (error) {
      console.error('Demo notifications creation error:', error)
      return NextResponse.json({ error: 'Failed to create demo notifications' }, { status: 500 })
    }

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Demo notifications API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
