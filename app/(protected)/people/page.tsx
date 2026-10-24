'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, Plus, LayoutGrid, List, Search, Filter, X, RefreshCw } from 'lucide-react'
import { PersonForm } from './components/person-form'
import { PersonTable } from './components/person-table'
import { PersonGrid } from './components/person-grid'
import type { Database } from '@/types/database'
import type { PersonFilters, PersonInput } from '@/types/person'

type PersonRow = Database['public']['Tables']['person']['Row']
type ViewMode = 'table' | 'grid'

export default function PeoplePage() {
  const [people, setPeople] = useState<PersonRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<PersonRow | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<PersonFilters>({})
  const [showFilters, setShowFilters] = useState(false)

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

      const res = await fetch(`/api/people?${params}`)
      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.error || 'Failed to fetch people')
      }
      setPeople(await res.json())
    } catch (err: any) {
      setError(err.message)
      setPeople([])
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, filters])

  useEffect(() => { fetchPeople() }, [fetchPeople])

  const handleFormSubmit = async (data: PersonInput) => {
    const url = editingPerson ? `/api/people/${editingPerson.id}` : '/api/people'
    const method = editingPerson ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      if (res.status === 409) {
        const confirm = window.confirm(err.message + '\n\nAdd anyway?')
        if (confirm) {
          const retry = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, checkDuplicates: false }),
          })
          if (!retry.ok) {
            const e = await retry.json()
            throw new Error(e.error || 'Failed to save')
          }
        } else return
      } else {
        throw new Error(err.error || 'Failed to save')
      }
    }

    await fetchPeople()
    setIsFormOpen(false)
    setEditingPerson(null)
  }

  const handleDelete = async (personId: string) => {
    const res = await fetch(`/api/people/${personId}`, { method: 'DELETE' })
    if (!res.ok) {
      const e = await res.json()
      if (res.status === 409) { alert(e.message); return }
      alert('Delete failed: ' + (e.error || ''))
      return
    }
    await fetchPeople()
  }

  const hasFilters = !!searchQuery || !!filters.gender || filters.isAlive !== undefined || !!filters.city || !!filters.country

  const clearFilters = () => {
    setSearchQuery('')
    setFilters({})
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <Users size={18} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">People</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isLoading ? 'Loading…' : `${people.length} member${people.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <button
          onClick={() => { setEditingPerson(null); setIsFormOpen(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
        >
          <Plus size={16} />
          Add Person
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search people…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition ${
            showFilters || hasFilters
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Filter size={15} />
          Filters
          {hasFilters && (
            <span className="w-4 h-4 text-xs rounded-full bg-blue-600 text-white flex items-center justify-center">
              !
            </span>
          )}
        </button>

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 hover:text-red-500 transition"
          >
            <X size={14} />
            Clear
          </button>
        )}

        <div className="flex items-center gap-0.5 border border-slate-200 dark:border-slate-700 rounded-lg p-1 bg-white dark:bg-slate-900 ml-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md transition ${
              viewMode === 'table' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Table view"
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition ${
              viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Grid view"
          >
            <LayoutGrid size={15} />
          </button>
        </div>

        <button
          onClick={fetchPeople}
          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          title="Refresh"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Gender</label>
            <select
              value={filters.gender ?? ''}
              onChange={e => setFilters(f => ({ ...f, gender: e.target.value as any || undefined }))}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</label>
            <select
              value={filters.isAlive === undefined ? '' : String(filters.isAlive)}
              onChange={e => setFilters(f => ({ ...f, isAlive: e.target.value === '' ? undefined : e.target.value === 'true' }))}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="true">Living</option>
              <option value="false">Deceased</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">City</label>
            <input
              type="text"
              placeholder="Filter by city…"
              value={filters.city ?? ''}
              onChange={e => setFilters(f => ({ ...f, city: e.target.value || undefined }))}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Country</label>
            <input
              type="text"
              placeholder="Filter by country…"
              value={filters.country ?? ''}
              onChange={e => setFilters(f => ({ ...f, country: e.target.value || undefined }))}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-700 dark:text-red-400 flex-1">{error}</p>
          <button onClick={fetchPeople} className="text-sm text-red-600 hover:underline shrink-0">Retry</button>
        </div>
      )}

      {/* Content */}
      {viewMode === 'table' ? (
        <PersonTable
          people={people}
          onEdit={p => { setEditingPerson(p); setIsFormOpen(true) }}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      ) : (
        <PersonGrid
          people={people}
          onEdit={p => { setEditingPerson(p); setIsFormOpen(true) }}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      )}

      {/* Form modal */}
      <PersonForm
        person={editingPerson}
        onSubmit={handleFormSubmit}
        onCancel={() => { setIsFormOpen(false); setEditingPerson(null) }}
        isOpen={isFormOpen}
        availablePeople={people}
      />
    </div>
  )
}
