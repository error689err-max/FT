'use client'

import { useState, useEffect, useCallback } from 'react'
import { GitBranch, ArrowRight, Search, RotateCcw, Users } from 'lucide-react'
import type { Database } from '@/types/database'

type PersonRow = Database['public']['Tables']['person']['Row']

interface RelationshipResult {
  relationship: string
  type: string
  distance: number
  person1: { id: string; name: string }
  person2: { id: string; name: string }
}

export default function RelatedPage() {
  const [people, setPeople] = useState<PersonRow[]>([])
  const [person1Id, setPerson1Id] = useState('')
  const [person2Id, setPerson2Id] = useState('')
  const [result, setResult] = useState<RelationshipResult | null>(null)
  const [isLoadingPeople, setIsLoadingPeople] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/people')
      .then(r => r.ok ? r.json() : Promise.reject('Failed to load'))
      .then(data => setPeople(data.sort((a: PersonRow, b: PersonRow) => a.full_name.localeCompare(b.full_name))))
      .catch(e => setError(String(e)))
      .finally(() => setIsLoadingPeople(false))
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!person1Id || !person2Id || person1Id === person2Id) return
    try {
      setIsAnalyzing(true)
      setError(null)
      setResult(null)
      const res = await fetch('/api/relationship-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person1Id, person2Id }),
      })
      if (!res.ok) throw new Error('Analysis failed')
      setResult(await res.json())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsAnalyzing(false)
    }
  }, [person1Id, person2Id])

  const swap = () => {
    const tmp = person1Id
    setPerson1Id(person2Id)
    setPerson2Id(tmp)
    setResult(null)
  }

  const p1 = people.find(p => p.id === person1Id)
  const p2 = people.find(p => p.id === person2Id)

  const typeColors: Record<string, string> = {
    'parent': 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    'child': 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    'sibling': 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    'grandparent': 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    'grandchild': 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    'aunt-uncle': 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
    'niece-nephew': 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
    'cousin': 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
    'spouse-partner': 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300',
    'self': 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    'not-related': 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
          <GitBranch size={18} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Relationship Finder</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Discover how two family members are related</p>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        {isLoadingPeople ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : people.length < 2 ? (
          <div className="text-center py-8">
            <Users size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400">Add at least 2 people to your tree first.</p>
          </div>
        ) : (
          <>
            {/* Selection row */}
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">First Person</label>
                <select
                  value={person1Id}
                  onChange={e => { setPerson1Id(e.target.value); setResult(null) }}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select person…</option>
                  {people.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
              </div>

              {/* Swap */}
              <button
                onClick={swap}
                className="mb-0.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 transition"
                title="Swap"
              >
                <RotateCcw size={15} />
              </button>

              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Second Person</label>
                <select
                  value={person2Id}
                  onChange={e => { setPerson2Id(e.target.value); setResult(null) }}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select person…</option>
                  {people.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected preview */}
            {p1 && p2 && (
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <PersonChip person={p1} />
                <ArrowRight size={16} className="text-slate-400 shrink-0" />
                <PersonChip person={p2} />
              </div>
            )}

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={!person1Id || !person2Id || person1Id === person2Id || isAnalyzing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition shadow-sm"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Search size={15} />
                  Find Relationship
                </>
              )}
            </button>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="p-5 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 rounded-xl text-center space-y-3">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Result</p>
                <div>
                  <span className="text-base font-semibold text-slate-800 dark:text-slate-200">{result.person1.name}</span>
                  <span className="text-slate-500 dark:text-slate-400 mx-2 text-sm">is</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${typeColors[result.type] ?? typeColors['not-related']}`}>
                    {result.relationship}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 mx-2 text-sm">of</span>
                  <span className="text-base font-semibold text-slate-800 dark:text-slate-200">{result.person2.name}</span>
                </div>
                {result.distance !== Infinity && result.type !== 'not-related' && result.type !== 'self' && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {result.distance} connection{result.distance !== 1 ? 's' : ''} apart
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Reference */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Relationship Types</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Direct', items: ['Parent / Child', 'Grandparent / Grandchild', 'Great-grandparent', 'Spouse / Partner'] },
            { label: 'Siblings', items: ['Full sibling', 'Half-sibling', 'Cousin (1st, 2nd…)', 'Cousin once removed'] },
            { label: 'Extended', items: ['Uncle / Aunt', 'Nephew / Niece', 'In-laws', 'Step relations'] },
          ].map(cat => (
            <div key={cat.label}>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">{cat.label}</p>
              <ul className="space-y-1">
                {cat.items.map(item => (
                  <li key={item} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PersonChip({ person }: { person: PersonRow }) {
  const avatarBg = person.gender === 'Male' ? 'bg-blue-500' : person.gender === 'Female' ? 'bg-pink-500' : 'bg-purple-500'
  const initials = person.full_name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <div className={`w-7 h-7 rounded-full ${avatarBg} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
        {initials}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{person.full_name}</p>
        <p className="text-xs text-slate-400">{person.gender ?? '—'}</p>
      </div>
    </div>
  )
}
