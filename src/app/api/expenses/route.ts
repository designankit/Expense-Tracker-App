import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    console.log("Expenses API: Getting session...")
    const session = await getServerSession(authOptions)
    console.log("Expenses API: Session:", session ? "Found" : "Not found")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log("Expenses API: User ID:", (session as any)?.user?.id)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session as any)?.user?.id) {
      console.log("Expenses API: No session or user ID, returning 401")
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const expenses = await prisma.expense.findMany({
      where: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userId: (session as any).user.id
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error("Get expenses error:", error)
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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { amount, category, type, date, note } = await request.json()

    if (!amount || !category || !type || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        category,
        type,
        date: new Date(date),
        note,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userId: (session as any).user.id
      }
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error("Create expense error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
