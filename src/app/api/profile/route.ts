import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session as any)?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { id: (session as any).user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("Profile update request received")
    
    const session = await getServerSession(authOptions)
    console.log("Session:", session ? "found" : "not found")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log("User ID:", (session as any)?.user?.id)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session as any)?.user?.id) {
      console.log("No session or user ID")
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log("Request body:", { name: body.name, image: body.image ? "provided" : "not provided" })

    console.log("Attempting to update user in database...")
    console.log("Update data:", { name: body.name, image: body.image ? "image provided" : "no image" })
    
    const user = await prisma.user.update({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { id: (session as any).user.id },
      data: {
        name: body.name,
        image: body.image,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      }
    })

    console.log("Successfully updated user:", user)
    console.log("User image after update:", user.image)
    return NextResponse.json(user)
  } catch (error) {
    console.error("Update profile error details:", error)
    console.error("Error name:", error instanceof Error ? error.name : "Unknown")
    console.error("Error message:", error instanceof Error ? error.message : "Unknown")
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack")
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
