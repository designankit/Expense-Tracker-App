import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest) {
  try {
    console.log("PATCH /api/user/update - Starting request")
    
    const session = await getServerSession(authOptions)
    console.log("Session:", session ? "Found" : "Not found")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log("User ID:", (session as any)?.user?.id)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session as any)?.user?.id) {
      console.log("Unauthorized - no session or user ID")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Request body:", body)
    const { name, image, currency, timezone, categories, emailNotif, twoFA } = body

    // Validate input
    const updateData: {
      name?: string;
      image?: string;
      currency?: string;
      timezone?: string;
      categories?: string[];
      emailNotif?: boolean;
      twoFA?: boolean;
    } = {}
    
    if (name !== undefined) updateData.name = name
    if (image !== undefined) updateData.image = image
    if (currency !== undefined) updateData.currency = currency
    if (timezone !== undefined) updateData.timezone = timezone
    if (categories !== undefined) updateData.categories = categories
    if (emailNotif !== undefined) updateData.emailNotif = emailNotif
    if (twoFA !== undefined) updateData.twoFA = twoFA

    console.log("Update data:", updateData)

    const updatedUser = await prisma.user.update({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { id: (session as any).user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        currency: true,
        timezone: true,
        categories: true,
        emailNotif: true,
        twoFA: true,
        createdAt: true,
        updatedAt: true
      }
    })

    console.log("User updated successfully:", updatedUser)
    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Error updating user:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json(
      { 
        error: "Failed to update user",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
