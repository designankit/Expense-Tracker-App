import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Check if expense belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userId: (session as any).user.id
      }
    })

    if (!existingExpense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      )
    }

    const expense = await prisma.expense.update({
      where: {
        id: id
      },
      data: {
        amount: parseFloat(amount),
        category,
        type,
        date: new Date(date),
        note
      }
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error("Update expense error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session as any)?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if expense belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userId: (session as any).user.id
      }
    })

    if (!existingExpense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      )
    }

    await prisma.expense.delete({
      where: {
        id: id
      }
    })

    return NextResponse.json({ message: "Expense deleted successfully" })
  } catch (error) {
    console.error("Delete expense error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
