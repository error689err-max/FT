'use client'

import { useEffect, useState } from 'react'
import type { Database } from '@/types/database'

type PersonRow = Database['public']['Tables']['person']['Row']

interface Statistics {
  totalPeople: number
  livingPeople: number
  deceasedPeople: number
  maleCount: number
  femaleCount: number
  otherGenderCount: number
  averageAge: number | null
  withBirthDate: number
  withDeathDate: number
  withLocation: number
}

export default function StatsPage() {
  const [people, setPeople] = useState<PersonRow[]>([])
  const [stats, setStats] = useState<Statistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/people')
        if (!response.ok) {
          throw new Error('Failed to fetch people')
        }

        const data: PersonRow[] = await response.json()
        setPeople(data)

        // Calculate statistics
        const totalPeople = data.length
        const livingPeople = data.filter(p => p.is_alive).length
        const deceasedPeople = data.filter(p => !p.is_alive).length
        const maleCount = data.filter(p => p.gender === 'Male').length
        const femaleCount = data.filter(p => p.gender === 'Female').length
        const otherGenderCount = data.filter(p => p.gender && !['Male', 'Female'].includes(p.gender)).length

        // Calculate average age
        const now = new Date()
        const peopleWithBirthDate = data.filter(p => p.birth_date)
        const withBirthDate = peopleWithBirthDate.length
        const withDeathDate = data.filter(p => p.death_date).length
        const withLocation = data.filter(p => p.city || p.country).length

        let averageAge: number | null = null
        if (withBirthDate > 0) {
          const totalAge = peopleWithBirthDate.reduce((sum, person) => {
            const birthDate = new Date(person.birth_date!)
            const age = now.getFullYear() - birthDate.getFullYear()
            return sum + age
          }, 0)
          averageAge = Math.round(totalAge / withBirthDate)
        }

        setStats({
          totalPeople,
          livingPeople,
          deceasedPeople,
          maleCount,
          femaleCount,
          otherGenderCount,
          averageAge,
          withBirthDate,
          withDeathDate,
          withLocation,
        })
      } catch (err: any) {
        setError(err.message || 'Failed to load statistics')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Statistics
        </h1>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-600 dark:text-slate-400">Loading statistics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Statistics
        </h1>
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Statistics
        </h1>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-600 dark:text-slate-400">No data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
        Statistics
      </h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total People"
          value={stats.totalPeople}
          icon="👥"
          color="bg-blue-100 dark:bg-blue-900"
          textColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Living"
          value={stats.livingPeople}
          icon="🟢"
          color="bg-green-100 dark:bg-green-900"
          textColor="text-green-600 dark:text-green-400"
          subtitle={`${Math.round((stats.livingPeople / stats.totalPeople) * 100)}%`}
        />
        <StatCard
          title="Deceased"
          value={stats.deceasedPeople}
          icon="⚫"
          color="bg-gray-100 dark:bg-gray-700"
          textColor="text-gray-600 dark:text-gray-400"
          subtitle={`${Math.round((stats.deceasedPeople / stats.totalPeople) * 100)}%`}
        />
        <StatCard
          title="Average Age"
          value={stats.averageAge !== null ? `${stats.averageAge} years` : 'N/A'}
          icon="📅"
          color="bg-purple-100 dark:bg-purple-900"
          textColor="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Gender Distribution */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Gender Distribution
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Male</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.maleCount}</p>
            </div>
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-2xl">♂️</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Female</p>
              <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{stats.femaleCount}</p>
            </div>
            <div className="h-16 w-16 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center">
              <span className="text-2xl">♀️</span>
            </div>
          </div>
          {stats.otherGenderCount > 0 && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Other</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.otherGenderCount}</p>
              </div>
              <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <span className="text-2xl">🤷</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Completeness */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Data Completeness
        </h2>
        <div className="space-y-4">
          <CompletionBar
            label="Birth Dates"
            current={stats.withBirthDate}
            total={stats.totalPeople}
          />
          <CompletionBar
            label="Death Dates"
            current={stats.withDeathDate}
            total={stats.totalPeople}
          />
          <CompletionBar
            label="Location Information"
            current={stats.withLocation}
            total={stats.totalPeople}
          />
        </div>
      </div>

      {/* Sample of People */}
      {people.length > 0 && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Recent Additions
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {people.slice(0, 10).map(person => (
              <div
                key={person.id}
                className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {person.full_name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {person.birth_date
                      ? `b. ${new Date(person.birth_date).toLocaleDateString()}`
                      : 'No birth date'}
                  </p>
                </div>
                <span className="text-lg">
                  {person.is_alive ? '🟢' : '⚫'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: string
  color: string
  textColor: string
  subtitle?: string
}

function StatCard({ title, value, icon, color, textColor, subtitle }: StatCardProps) {
  return (
    <div className={`${color} rounded-lg border border-slate-200 dark:border-slate-700 p-4`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{title}</p>
          <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}

interface CompletionBarProps {
  label: string
  current: number
  total: number
}

function CompletionBar({ label, current, total }: CompletionBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {current}/{total} ({percentage}%)
        </p>
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
