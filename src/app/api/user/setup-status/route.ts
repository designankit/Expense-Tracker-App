import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getSetupProgress } from "@/lib/setup-check"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { id: (session as any).user.id },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const setupProgress = getSetupProgress(user)

    return NextResponse.json({ 
      setupProgress,
      user: {
        id: user.id,
        name: user.name,
        currency: user.currency,
        timezone: user.timezone,
        categories: user.categories,
        emailNotif: user.emailNotif,
        twoFA: user.twoFA
      }
    })
  } catch (error) {
    console.error("Error checking setup status:", error)
    return NextResponse.json(
      { error: "Failed to check setup status" },
      { status: 500 }
    )
  }
}
