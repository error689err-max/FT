'use client'

import Link from 'next/link'
import { MapPin, Calendar, Edit2, Trash2, ExternalLink } from 'lucide-react'
import type { Database } from '@/types/database'

type PersonRow = Database['public']['Tables']['person']['Row']

const genderColors: Record<string, { bg: string; text: string; avatar: string }> = {
  Male: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', avatar: 'bg-blue-500' },
  Female: { bg: 'bg-pink-50 dark:bg-pink-950/40', text: 'text-pink-700 dark:text-pink-400', avatar: 'bg-pink-500' },
  Other: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-400', avatar: 'bg-purple-500' },
  'Prefer not to say': { bg: 'bg-slate-50 dark:bg-slate-800/60', text: 'text-slate-600 dark:text-slate-400', avatar: 'bg-slate-500' },
}

interface PersonGridProps {
  people: PersonRow[]
  onEdit: (person: PersonRow) => void
  onDelete: (id: string) => void
  isLoading: boolean
}

export function PersonGrid({ people, onEdit, onDelete, isLoading }: PersonGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
              <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (people.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">👥</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">No people found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your search or filters.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {people.map(person => {
        const colors = genderColors[person.gender ?? 'Prefer not to say'] ?? genderColors['Prefer not to say']
        const initials = person.full_name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
        const birthYear = person.birth_date ? new Date(person.birth_date).getFullYear() : null
        const deathYear = person.death_date ? new Date(person.death_date).getFullYear() : null
        const location = [person.city, person.country].filter(Boolean).join(', ')

        return (
          <div
            key={person.id}
            className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
          >
            {/* Card header */}
            <div className={`px-4 pt-4 pb-3 ${colors.bg}`}>
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-full ${colors.avatar} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/people/${person.id}`} className="block">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-tight">
                      {person.full_name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1.5 mt-1">
                    {person.gender && (
                      <span className={`text-xs font-medium ${colors.text}`}>{person.gender}</span>
                    )}
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className={`inline-flex items-center gap-1 text-xs ${person.is_alive ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${person.is_alive ? 'bg-green-400' : 'bg-slate-400'}`} />
                      {person.is_alive ? 'Living' : 'Deceased'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card body */}
            <div className="px-4 py-3 space-y-1.5">
              {(birthYear || deathYear) && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar size={11} className="shrink-0" />
                  <span>
                    {birthYear ?? '?'}{deathYear ? ` – ${deathYear}` : ''}
                  </span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin size={11} className="shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              )}
              {person.notes && (
                <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 italic">
                  "{person.notes}"
                </p>
              )}
            </div>

            {/* Card footer — actions */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800">
              <Link
                href={`/people/${person.id}`}
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                View <ExternalLink size={10} />
              </Link>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(person)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition"
                  title="Edit"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete "${person.full_name}"? This cannot be undone.`)) {
                      onDelete(person.id)
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
