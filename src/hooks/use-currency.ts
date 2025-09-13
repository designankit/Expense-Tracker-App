"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { formatCurrency, getCurrencySymbol, CurrencyCode } from "@/lib/currency"

// interface UserSettings {
//   currency: CurrencyCode
//   timezone: string
//   categories: string[]
//   emailNotif: boolean
//   twoFA: boolean
// }

export function useCurrency() {
  const { data: session } = useSession()
  const [userCurrency, setUserCurrency] = useState<CurrencyCode>("INR")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserCurrency = async () => {
      if (!session?.user?.id) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch("/api/user/setup-status")
        if (response.ok) {
          const data = await response.json()
          setUserCurrency((data.user.currency as CurrencyCode) || "INR")
        }
      } catch (error) {
        console.error("Error fetching user currency:", error)
        setUserCurrency("INR")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserCurrency()
  }, [session])

  const formatAmount = (amount: number): string => {
    return formatCurrency(amount, userCurrency)
  }

  const getSymbol = (): string => {
    return getCurrencySymbol(userCurrency)
  }

  return {
    currency: userCurrency,
    formatAmount,
    getSymbol,
    isLoading
  }
}
