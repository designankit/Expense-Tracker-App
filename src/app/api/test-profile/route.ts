import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    console.log("Test profile endpoint called")
    
    const session = await getServerSession(authOptions)
    console.log("Session in test:", session)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log("User ID in test:", (session as any)?.user?.id)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session as any)?.user?.id) {
      return NextResponse.json(
        { error: "No session or user ID" },
        { status: 401 }
      )
    }

    // Test database connection
    console.log("Testing database connection...")
    const user = await prisma.user.findUnique({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { id: (session as any).user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      }
    })

    console.log("Found user:", user)

    return NextResponse.json({
      success: true,
      session: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (session as any).user.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        email: (session as any).user.email,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name: (session as any).user.name,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        image: (session as any).user.image,
      },
      user
    })
  } catch (error) {
    console.error("Test profile error:", error)
    return NextResponse.json(
      { 
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
