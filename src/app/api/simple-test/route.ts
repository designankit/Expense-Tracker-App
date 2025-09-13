import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Simple test endpoint called")
    return NextResponse.json({ 
      success: true, 
      message: "API is working",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Simple test error:", error)
    return NextResponse.json(
      { error: "Simple test failed" },
      { status: 500 }
    )
  }
}
