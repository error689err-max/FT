'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Database } from '@/types/database'

type PersonRow = Database['public']['Tables']['person']['Row']

export default function RelatedPage() {
  const [people, setPeople] = useState<PersonRow[]>([])
  const [person1Id, setPerson1Id] = useState<string>('')
  const [person2Id, setPerson2Id] = useState<string>('')
  const [relationship, setRelationship] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  // Fetch all people
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/people')
        if (!response.ok) {
          throw new Error('Failed to fetch people')
        }

        const data = await response.json()
        setPeople(data.sort((a: PersonRow, b: PersonRow) => a.full_name.localeCompare(b.full_name)))
      } catch (err: any) {
        setError(err.message || 'Failed to load people')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPeople()
  }, [])

  // Analyze relationship
  const handleAnalyze = useCallback(async () => {
    if (!person1Id || !person2Id) {
      setAnalysisError('Please select two people')
      return
    }

    if (person1Id === person2Id) {
      setAnalysisError('Please select two different people')
      return
    }

    try {
      setAnalysisError(null)
      setRelationship(null)

      // Fetch relationship analysis
      const response = await fetch('/api/relationship-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person1Id,
          person2Id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze relationship')
      }

      const data = await response.json()
      setRelationship(data.relationship)
    } catch (err: any) {
      setAnalysisError(err.message || 'Failed to analyze relationship')
    }
  }, [person1Id, person2Id])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          How Are We Related
        </h1>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-600 dark:text-slate-400">Loading people...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          How Are We Related
        </h1>
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  if (people.length < 2) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          How Are We Related
        </h1>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-600 dark:text-slate-400">
            You need at least 2 people in your tree to analyze relationships.
          </p>
        </div>
      </div>
    )
  }

  const person1 = people.find(p => p.id === person1Id)
  const person2 = people.find(p => p.id === person2Id)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
        How Are We Related
      </h1>

      {/* Main Analysis Card */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">
          Find the Relationship Between Two People
        </h2>

        {/* Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Person 1 Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Person 1
            </label>
            <select
              value={person1Id}
              onChange={(e) => setPerson1Id(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a person...</option>
              {people.map(person => (
                <option key={person.id} value={person.id}>
                  {person.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Person 2 Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Person 2
            </label>
            <select
              value={person2Id}
              onChange={(e) => setPerson2Id(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a person...</option>
              {people.map(person => (
                <option key={person.id} value={person.id}>
                  {person.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={!person1Id || !person2Id}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:bg-blue-700 dark:hover:bg-blue-600 dark:disabled:bg-slate-700 text-white rounded font-medium transition-colors"
        >
          Find Relationship
        </button>

        {/* Error Display */}
        {analysisError && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
            <p className="text-sm text-red-700 dark:text-red-300">{analysisError}</p>
          </div>
        )}

        {/* Result Display */}
        {relationship && person1 && person2 && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Relationship:</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {person1.full_name} is the <span className="text-blue-600 dark:text-blue-400">{relationship}</span> of {person2.full_name}
            </p>
          </div>
        )}
      </div>

      {/* Common Relationships Reference */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Common Relationships
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Direct Relations</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• Parent / Child</li>
              <li>• Grandparent / Grandchild</li>
              <li>• Great-grandparent / Great-grandchild</li>
              <li>• Spouse / Partner</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Siblings & Cousins</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• Sibling / Brother / Sister</li>
              <li>• Cousin (1st, 2nd, etc.)</li>
              <li>• Half-sibling</li>
              <li>• Step-sibling</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">In-Laws & Extended</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• In-law (parent, sibling, etc.)</li>
              <li>• Uncle / Aunt</li>
              <li>• Nephew / Niece</li>
              <li>• Cousin once removed</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Step & Adopted</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• Stepparent / Stepchild</li>
              <li>• Adopted parent / child</li>
              <li>• Step-sibling</li>
              <li>• No relation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
