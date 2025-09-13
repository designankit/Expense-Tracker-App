import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const limit = parseInt(searchParams.get("limit") || "5")

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ suggestions: [] })
    }

    const searchTerm = query.trim().toLowerCase()

    // Search expenses by category, note, and type
    const expenses = await prisma.expense.findMany({
      where: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userId: (session as any).user.id,
        OR: [
          {
            category: {
              contains: searchTerm,
              mode: "insensitive"
            }
          },
          {
            note: {
              contains: searchTerm,
              mode: "insensitive"
            }
          },
          {
            type: {
              contains: searchTerm,
              mode: "insensitive"
            }
          }
        ]
      },
      select: {
        id: true,
        amount: true,
        category: true,
        note: true,
        type: true,
        date: true
      },
      take: limit,
      orderBy: {
        date: "desc"
      }
    })

    // Format suggestions
    const suggestions = expenses.map(expense => ({
      id: expense.id,
      title: expense.note || expense.category,
      subtitle: `${expense.category} • ${expense.type}`,
      amount: expense.amount,
      date: expense.date,
      type: expense.type
    }))

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
