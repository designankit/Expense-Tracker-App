import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Reset setup by clearing the name - this will make setup incomplete
    const updatedUser = await prisma.user.update({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { id: (session as any).user.id },
      data: {
        name: null,
        emailNotif: false,
        twoFA: false
      },
      select: {
        id: true,
        name: true,
        email: true,
        currency: true,
        timezone: true,
        categories: true,
        emailNotif: true,
        twoFA: true
      }
    })

    return NextResponse.json({ 
      message: "Setup status reset successfully",
      user: updatedUser
    })
  } catch (error) {
    console.error("Error resetting setup status:", error)
    return NextResponse.json(
      { error: "Failed to reset setup status" },
      { status: 500 }
    )
  }
}
