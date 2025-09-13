"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface SearchContextType {
  searchQuery: string
  setSearchQuery: (query: string) => void
  isDropdownOpen: boolean
  setIsDropdownOpen: (open: boolean) => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <SearchContext.Provider value={{ 
      searchQuery, 
      setSearchQuery, 
      isDropdownOpen, 
      setIsDropdownOpen 
    }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}
