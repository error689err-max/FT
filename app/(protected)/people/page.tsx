'use client'

import { useState, useEffect, useCallback } from 'react'
import { SearchAndFilter } from './components/search-filter'
import { PersonTable } from './components/person-table'
import { PersonForm } from './components/person-form'
import type { Database } from '@/types/database'
import type { PersonFilters, PersonInput } from '@/types/person'

type PersonRow = Database['public']['Tables']['person']['Row']

export default function PeoplePage() {
  const [people, setPeople] = useState<PersonRow[]>([])
  const [filteredPeople, setFilteredPeople] = useState<PersonRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<PersonRow | null>(null)
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<PersonFilters>({})

  // Fetch people from API
  const fetchPeople = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (filters.gender) params.set('gender', filters.gender)
      if (filters.isAlive !== undefined) params.set('isAlive', filters.isAlive.toString())
      if (filters.city) params.set('city', filters.city)
      if (filters.country) params.set('country', filters.country)

      const response = await fetch(`/api/people?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch people')
      }

      const data = await response.json()
      setPeople(data)
      setFilteredPeople(data)
    } catch (err: any) {
      setError(err.message)
      setPeople([])
      setFilteredPeople([])
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, filters])

  // Fetch people on component mount and when filters change
  useEffect(() => {
    fetchPeople()
  }, [fetchPeople])

  // Handle search change
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  // Handle filter change
  const handleFilterChange = useCallback((newFilters: PersonFilters) => {
    setFilters(newFilters)
  }, [])

  // Handle form submission
  const handleFormSubmit = async (data: PersonInput) => {
    try {
      const url = editingPerson ? `/api/people/${editingPerson.id}` : '/api/people'
      const method = editingPerson ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 409) {
          // Duplicate name - ask for confirmation
          const confirm = window.confirm(errorData.message + '\n\nDo you want to add this person anyway?')
          if (confirm) {
            const retryResponse = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...data, checkDuplicates: false }),
            })
            if (!retryResponse.ok) {
              const retryErrorData = await retryResponse.json()
              throw new Error(retryErrorData.error || 'Failed to save person')
            }
          } else {
            return // User cancelled
          }
        } else {
          throw new Error(errorData.error || 'Failed to save person')
        }
      }

      // Success - refresh the list and close form
      await fetchPeople()
      setIsFormOpen(false)
      setEditingPerson(null)
    } catch (error: any) {
      throw new Error(error.message || 'An unexpected error occurred')
    }
  }

  // Handle edit
  const handleEdit = (person: PersonRow) => {
    setEditingPerson(person)
    setIsFormOpen(true)
  }

  // Handle delete
  const handleDelete = async (personId: string) => {
    try {
      const response = await fetch(`/api/people/${personId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 409) {
          alert(errorData.message)
          return
        }
        throw new Error(errorData.error || 'Failed to delete person')
      }

      // Success - refresh the list
      await fetchPeople()
    } catch (error: any) {
      alert('Error deleting person: ' + error.message)
    }
  }

  // Handle add new person
  const handleAddNew = () => {
    setEditingPerson(null)
    setIsFormOpen(true)
  }

  // Handle form cancel
  const handleFormCancel = () => {
    setIsFormOpen(false)
    setEditingPerson(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          People
        </h1>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded font-medium"
        >
          Add Person
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={() => fetchPeople()}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <SearchAndFilter
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
      />

      {/* People Table */}
      <PersonTable
        people={filteredPeople}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {/* Person Form Modal */}
      <PersonForm
        person={editingPerson}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        isOpen={isFormOpen}
        availablePeople={people}
      />
    </div>
  )
}
