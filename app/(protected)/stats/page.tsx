'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart3, Users, Heart, MapPin, Calendar, TrendingUp, RefreshCw } from 'lucide-react'
import type { Database } from '@/types/database'

type PersonRow = Database['public']['Tables']['person']['Row']

interface Stats {
  total: number
  living: number
  deceased: number
  male: number
  female: number
  other: number
  withBirthDate: number
  withDeathDate: number
  withLocation: number
  averageAge: number | null
  oldest: PersonRow | null
  youngest: PersonRow | null
}

function calcStats(people: PersonRow[]): Stats {
  const now = new Date()
  const living = people.filter(p => p.is_alive)
  const withBirth = people.filter(p => p.birth_date)

  let averageAge: number | null = null
  if (withBirth.length > 0) {
    const total = withBirth.reduce((sum, p) => {
      const birth = new Date(p.birth_date!)
      return sum + (now.getFullYear() - birth.getFullYear())
    }, 0)
    averageAge = Math.round(total / withBirth.length)
  }

  const sorted = [...withBirth].sort(
    (a, b) => new Date(a.birth_date!).getTime() - new Date(b.birth_date!).getTime()
  )

  return {
    total: people.length,
    living: living.length,
    deceased: people.filter(p => !p.is_alive).length,
    male: people.filter(p => p.gender === 'Male').length,
    female: people.filter(p => p.gender === 'Female').length,
    other: people.filter(p => p.gender && !['Male', 'Female'].includes(p.gender)).length,
    withBirthDate: withBirth.length,
    withDeathDate: people.filter(p => p.death_date).length,
    withLocation: people.filter(p => p.city || p.country).length,
    averageAge,
    oldest: sorted[0] ?? null,
    youngest: sorted[sorted.length - 1] ?? null,
  }
}

export default function StatsPage() {
  const [people, setPeople] = useState<PersonRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch('/api/people')
      if (!res.ok) throw new Error('Failed to fetch')
      setPeople(await res.json())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading statistics…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <button onClick={load} className="text-sm text-blue-600 hover:underline">Retry</button>
        </div>
      </div>
    )
  }

  if (people.length === 0) {
    return (
      <div className="space-y-5">
        <PageHeader />
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BarChart3 size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No data yet</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">Add people to see statistics.</p>
          <Link href="/people" className="text-sm text-blue-600 hover:underline">Go to People →</Link>
        </div>
      </div>
    )
  }

  const s = calcStats(people)
  const genderTotal = s.male + s.female + s.other

  // Top locations
  const locationMap = new Map<string, number>()
  people.forEach(p => {
    const loc = [p.city, p.country].filter(Boolean).join(', ')
    if (loc) locationMap.set(loc, (locationMap.get(loc) ?? 0) + 1)
  })
  const topLocations = Array.from(locationMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <PageHeader />
        <button
          onClick={load}
          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Members', value: s.total, sub: 'in your tree', color: 'blue' },
          { label: 'Living', value: s.living, sub: pct(s.living, s.total), color: 'green' },
          { label: 'Deceased', value: s.deceased, sub: pct(s.deceased, s.total), color: 'slate' },
          { label: 'Avg Age', value: s.averageAge !== null ? `${s.averageAge}` : '—', sub: 'years old', color: 'purple' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4`}>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
            <p className={`text-3xl font-bold mt-1 text-${color}-600 dark:text-${color}-400`}>{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Gender + Completeness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gender */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <Users size={15} /> Gender Distribution
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Male', count: s.male, color: 'bg-blue-500' },
              { label: 'Female', count: s.female, color: 'bg-pink-500' },
              { label: 'Other / Unknown', count: s.other + (s.total - genderTotal), color: 'bg-purple-400' },
            ].map(({ label, count, color }) => {
              const p = genderTotal > 0 ? Math.round((count / s.total) * 100) : 0
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400">{label}</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{count} <span className="font-normal text-slate-400">({p}%)</span></span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${p}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Completeness */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <TrendingUp size={15} /> Data Completeness
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Birth Dates', count: s.withBirthDate, icon: <Calendar size={13} /> },
              { label: 'Death Dates', count: s.withDeathDate, icon: <Calendar size={13} /> },
              { label: 'Location', count: s.withLocation, icon: <MapPin size={13} /> },
            ].map(({ label, count, icon }) => {
              const p = s.total > 0 ? Math.round((count / s.total) * 100) : 0
              const barColor = p >= 75 ? 'bg-green-500' : p >= 40 ? 'bg-yellow-500' : 'bg-red-400'
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">{icon}{label}</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{count}/{s.total} <span className="font-normal text-slate-400">({p}%)</span></span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${p}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Notable people + Top locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Notable */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <Heart size={15} /> Notable Members
          </h2>
          <div className="space-y-3">
            {s.oldest && (
              <NotableRow label="Oldest Known" person={s.oldest} note="earliest birth date" />
            )}
            {s.youngest && s.youngest.id !== s.oldest?.id && (
              <NotableRow label="Youngest Known" person={s.youngest} note="latest birth date" />
            )}
            {people.filter(p => !p.is_alive).length > 0 && (
              <div className="flex justify-between items-center py-2 border-t border-slate-100 dark:border-slate-800 first:border-0">
                <span className="text-xs text-slate-500 dark:text-slate-400">Deceased members</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{s.deceased}</span>
              </div>
            )}
          </div>
        </div>

        {/* Locations */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <MapPin size={15} /> Top Locations
          </h2>
          {topLocations.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">No location data available.</p>
          ) : (
            <div className="space-y-2">
              {topLocations.map(([loc, count]) => (
                <div key={loc} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-700 dark:text-slate-300 truncate">{loc}</span>
                      <span className="text-slate-500 dark:text-slate-400 shrink-0 ml-2">{count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full"
                        style={{ width: `${Math.round((count / topLocations[0][1]) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent additions */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Recent Additions</h2>
          <Link href="/people" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {[...people]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 6)
            .map(person => (
              <Link
                key={person.id}
                href={`/people/${person.id}`}
                className="flex items-center gap-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-2 px-2 rounded-lg transition-colors group"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                  person.gender === 'Male' ? 'bg-blue-500' : person.gender === 'Female' ? 'bg-pink-500' : 'bg-purple-500'
                }`}>
                  {person.full_name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {person.full_name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {person.birth_date ? `b. ${new Date(person.birth_date).getFullYear()}` : 'No birth date'}
                    {person.city ? ` · ${person.city}` : ''}
                  </p>
                </div>
                <span className={`w-2 h-2 rounded-full shrink-0 ${person.is_alive ? 'bg-green-400' : 'bg-slate-400'}`} />
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
}

function PageHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
        <BarChart3 size={18} />
      </div>
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Statistics</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Insights about your family tree</p>
      </div>
    </div>
  )
}

function pct(part: number, total: number) {
  if (total === 0) return '0%'
  return `${Math.round((part / total) * 100)}% of tree`
}

function NotableRow({ label, person, note }: { label: string; person: PersonRow; note: string }) {
  return (
    <div className="flex items-center justify-between py-2 first:pt-0">
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <Link href={`/people/${person.id}`} className="text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          {person.full_name}
        </Link>
        <p className="text-xs text-slate-400">{note}</p>
      </div>
      {person.birth_date && (
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 shrink-0 ml-3">
          {new Date(person.birth_date).getFullYear()}
        </span>
      )}
    </div>
  )
}
