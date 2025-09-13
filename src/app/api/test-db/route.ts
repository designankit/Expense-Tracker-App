import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    
    return NextResponse.json({ 
      success: true, 
      userCount,
      message: "Database connection successful" 
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Database connection failed" 
      },
      { status: 500 }
    )
  }
}
