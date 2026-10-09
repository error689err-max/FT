'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Database } from '@/types/database'

type PersonRow = Database['public']['Tables']['person']['Row']

interface PersonTableProps {
  people: PersonRow[]
  onEdit: (person: PersonRow) => void
  onDelete: (personId: string) => void
  isLoading?: boolean
}

export function PersonTable({ people, onEdit, onDelete, isLoading }: PersonTableProps) {
  const [sortField, setSortField] = useState<keyof PersonRow>('full_name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Sort people
  const sortedPeople = [...people].sort((a, b) => {
    const aVal = a[sortField]
    const bVal = b[sortField]
    
    if (aVal === null && bVal === null) return 0
    if (aVal === null) return 1
    if (bVal === null) return -1
    
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const handleSort = (field: keyof PersonRow) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleDelete = async (personId: string) => {
    if (window.confirm('Are you sure you want to delete this person? This cannot be undone.')) {
      setDeletingId(personId)
      try {
        await onDelete(personId)
      } finally {
        setDeletingId(null)
      }
    }
  }

  const SortIcon = ({ field }: { field: keyof PersonRow }) => {
    if (field !== sortField) return <span className="text-slate-400">↕️</span>
    return sortDirection === 'asc' ? <span>↑</span> : <span>↓</span>
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-8">
        <div className="flex items-center justify-center">
          <div className="text-slate-600 dark:text-slate-400">Loading people...</div>
        </div>
      </div>
    )
  }

  if (people.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-8">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">No people in your tree yet</p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Click "Add Person" to get started
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th 
                className="text-left px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => handleSort('full_name')}
              >
                <div className="flex items-center gap-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                  Name <SortIcon field="full_name" />
                </div>
              </th>
              <th 
                className="text-left px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => handleSort('birth_date')}
              >
                <div className="flex items-center gap-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                  Birth Date <SortIcon field="birth_date" />
                </div>
              </th>
              <th 
                className="text-left px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => handleSort('city')}
              >
                <div className="flex items-center gap-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                  Location <SortIcon field="city" />
                </div>
              </th>
              <th 
                className="text-left px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => handleSort('is_alive')}
              >
                <div className="flex items-center gap-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                  Status <SortIcon field="is_alive" />
                </div>
              </th>
              <th className="text-right px-4 py-3">
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {sortedPeople.map((person) => (
              <tr key={person.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3">
                  <Link
                    href={`/people/${person.id}`}
                    className="flex items-center gap-2 hover:underline"
                  >
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {person.full_name}
                    </span>
                    {person.gender && (
                      <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                        {person.gender}
                      </span>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {person.birth_date ? new Date(person.birth_date).getFullYear() : '—'}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {[person.city, person.country].filter(Boolean).join(', ') || '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    person.is_alive 
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}>
                    {person.is_alive ? 'Living' : 'Deceased'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(person)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(person.id)}
                      disabled={deletingId === person.id}
                      className="text-sm text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                    >
                      {deletingId === person.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}