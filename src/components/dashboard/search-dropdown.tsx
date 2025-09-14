"use client"

import { useState, useEffect, useRef } from "react"
import { Search, TrendingUp, TrendingDown, Calendar } from "lucide-react"
// import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// Currency formatting function
const formatCurrency = (amount: number, currency: string = "INR"): string => {
  const symbols = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£"
  }
  return `${symbols[currency as keyof typeof symbols] || "₹"}${amount.toLocaleString()}`
}
import { formatDate } from "@/lib/format"

interface SearchSuggestion {
  id: string
  title: string
  subtitle: string
  amount: number
  date: string
  type: 'expense' | 'income'
}

interface SearchDropdownProps {
  query: string
  isOpen: boolean
  onClose: () => void
  onSelectSuggestion: (suggestion: SearchSuggestion) => void
}

export function SearchDropdown({ query, isOpen, onClose, onSelectSuggestion }: SearchDropdownProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const formatAmount = (amount: number) => formatCurrency(amount, "INR")

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim() || query.length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`, {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          setSuggestions(data.suggestions || [])
        }
      } catch (error) {
        console.error("Failed to fetch search suggestions:", error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 200)
    return () => clearTimeout(debounceTimer)
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen || (!query.trim() && !isLoading)) {
    return null
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200 w-[28rem] min-w-[24rem]"
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
      }}
    >
      {isLoading ? (
        <div className="p-8 flex flex-col items-center justify-center">
          <div className="relative mb-4">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 dark:border-gray-700"></div>
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Searching expenses...</span>
          <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">This may take a moment</span>
        </div>
      ) : suggestions.length > 0 ? (
        <div className="p-4">
          <div className="mb-4 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
              {suggestions.length} result{suggestions.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="space-y-2">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                onClick={() => onSelectSuggestion(suggestion)}
                className="group relative flex items-center p-5 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 dark:hover:from-blue-950/30 dark:hover:to-indigo-950/30 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-lg border border-transparent hover:border-blue-200/50 dark:hover:border-blue-800/50"
              >
                {/* Gradient border effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative flex items-center space-x-5 flex-1">
                  {/* Enhanced icon */}
                  <div className={`relative p-4 rounded-2xl shadow-sm transition-all duration-200 ${
                    suggestion.type === 'expense' 
                      ? 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 group-hover:shadow-xl group-hover:shadow-red-500/25' 
                      : 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 group-hover:shadow-xl group-hover:shadow-green-500/25'
                  }`}>
                    {suggestion.type === 'expense' ? (
                      <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                    ) : (
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    )}
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                      suggestion.type === 'expense' ? 'bg-red-500' : 'bg-green-500'
                    }`}></div>
                  </div>

                  {/* Content - Better use of width */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                          {suggestion.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {suggestion.subtitle}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className={`text-lg font-bold ${
                          suggestion.type === 'expense' 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-green-600 dark:text-green-400'
                        }`}>
                          {suggestion.type === 'expense' ? '-' : '+'}{formatAmount(suggestion.amount)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant="secondary" 
                          className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-full"
                        >
                          {suggestion.subtitle.split(' • ')[0]}
                        </Badge>
                        
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3 mr-1.5" />
                          {formatDate(suggestion.date)}
                        </div>
                      </div>
                      
                      {/* Hover indicator */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">View Details</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Click any expense to view details
            </p>
          </div>
        </div>
      ) : query.length >= 2 ? (
        <div className="p-10 text-center">
          <div className="relative mb-6">
            <Search className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
          </div>
          <div className="max-w-xs mx-auto">
            <p className="text-base font-medium text-gray-600 dark:text-gray-400 mb-2">
              No expenses found
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              Try searching for &quot;{query}&quot; in categories or notes
            </p>
            <div className="text-xs text-gray-400 dark:text-gray-600">
              <p>💡 Try different keywords like:</p>
              <p className="mt-1">• Category names (Food, Travel, etc.)</p>
              <p>• Expense types (expense, income)</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
