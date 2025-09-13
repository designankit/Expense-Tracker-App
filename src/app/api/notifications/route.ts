import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // In a real app, you would fetch notifications from a database
    // For now, return empty array as notifications are handled client-side
    return NextResponse.json({ notifications: [] })
  } catch (error) {
    console.error("Notifications API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { title: _title, message: _message, type: _type, actionUrl: _actionUrl } = body

    // In a real app, you would save the notification to a database
    // For now, return success as notifications are handled client-side
    return NextResponse.json({ 
      success: true,
      message: "Notification created successfully" 
    })
  } catch (error) {
    console.error("Create notification API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
