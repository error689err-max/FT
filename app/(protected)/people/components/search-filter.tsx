'use client'

import { useState, useEffect } from 'react'
import type { PersonFilters } from '@/types/person'

interface SearchAndFilterProps {
  onSearchChange: (query: string) => void
  onFilterChange: (filters: PersonFilters) => void
}

export function SearchAndFilter({ onSearchChange, onFilterChange }: SearchAndFilterProps) {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<PersonFilters>({})

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(search)
    }, 300)

    return () => clearTimeout(timer)
  }, [search, onSearchChange])

  // Update filters when they change
  useEffect(() => {
    onFilterChange(filters)
  }, [filters, onFilterChange])

  const handleFilterChange = (key: keyof PersonFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }))
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4">
      {/* Search */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
          Search by name
        </label>
        <input
          id="search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Type to search..."
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Gender Filter */}
        <div>
          <label htmlFor="gender" className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">
            Gender
          </label>
          <select
            id="gender"
            value={filters.gender || ''}
            onChange={(e) => handleFilterChange('gender', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="">All</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        {/* Living Status Filter */}
        <div>
          <label htmlFor="isAlive" className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">
            Status
          </label>
          <select
            id="isAlive"
            value={filters.isAlive === undefined ? '' : filters.isAlive.toString()}
            onChange={(e) => handleFilterChange('isAlive', e.target.value === '' ? undefined : e.target.value === 'true')}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="">All</option>
            <option value="true">Living</option>
            <option value="false">Deceased</option>
          </select>
        </div>

        {/* City Filter */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">
            City
          </label>
          <input
            id="city"
            type="text"
            value={filters.city || ''}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            placeholder="Filter by city"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        {/* Country Filter */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">
            Country
          </label>
          <input
            id="country"
            type="text"
            value={filters.country || ''}
            onChange={(e) => handleFilterChange('country', e.target.value)}
            placeholder="Filter by country"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
      </div>

      {/* Clear Filters */}
      {(search || Object.values(filters).some(v => v !== undefined)) && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              setSearch('')
              setFilters({})
            }}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}