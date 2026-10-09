'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { Database } from '@/types/database'

type PersonRow = Database['public']['Tables']['person']['Row']

export default function PersonDetailPage() {
  const params = useParams()
  const personId = params.id as string

  const [person, setPerson] = useState<PersonRow | null>(null)
  const [parents, setParents] = useState<PersonRow[]>([])
  const [children, setChildren] = useState<PersonRow[]>([])
  const [partners, setPartners] = useState<PersonRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Fetch person details
  useEffect(() => {
    const fetchPerson = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/people/${personId}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Person not found')
            return
          }
          throw new Error('Failed to load person')
        }

        const personData = await response.json()
        setPerson(personData)

        // Fetch related people
        const [parentsRes, childrenRes, partnersRes] = await Promise.all([
          fetch(`/api/people/${personId}/parents`),
          fetch(`/api/people/${personId}/children`),
          fetch(`/api/people/${personId}/partners`),
        ])

        if (parentsRes.ok) {
          const parentsData = await parentsRes.json()
          setParents(parentsData)
        }

        if (childrenRes.ok) {
          const childrenData = await childrenRes.json()
          setChildren(childrenData)
        }

        if (partnersRes.ok) {
          const partnersData = await partnersRes.json()
          setPartners(partnersData)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load person details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPerson()
  }, [personId])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/people" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← Back to People
          </Link>
        </div>
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !person) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/people" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← Back to People
          </Link>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
          <p className="text-red-700 dark:text-red-300">{error || 'Person not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/people" className="text-blue-600 dark:text-blue-400 hover:underline">
        ← Back to People
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          {person.full_name}
        </h1>
        <button
          onClick={handleEdit}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded font-medium"
        >
          Edit
        </button>
      </div>

      {/* Person Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Personal Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Full Name</p>
              <p className="text-slate-900 dark:text-slate-100 font-medium">
                {person.full_name}
              </p>
            </div>

            {person.gender && (
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Gender</p>
                <p className="text-slate-900 dark:text-slate-100">{person.gender}</p>
              </div>
            )}

            {person.birth_date && (
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Birth Date</p>
                <p className="text-slate-900 dark:text-slate-100">
                  {new Date(person.birth_date).toLocaleDateString()}
                </p>
              </div>
            )}

            {person.death_date && (
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Death Date</p>
                <p className="text-slate-900 dark:text-slate-100">
                  {new Date(person.death_date).toLocaleDateString()}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
              <p className="text-slate-900 dark:text-slate-100">
                {person.is_alive ? '🟢 Living' : '⚫ Deceased'}
              </p>
            </div>

            {person.city && (
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">City</p>
                <p className="text-slate-900 dark:text-slate-100">{person.city}</p>
              </div>
            )}

            {person.country && (
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Country</p>
                <p className="text-slate-900 dark:text-slate-100">{person.country}</p>
              </div>
            )}

            {person.notes && (
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Notes</p>
                <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                  {person.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Relationships Summary */}
        <div className="space-y-4">
          {/* Parents */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Parents ({parents.length})
            </h3>
            {parents.length > 0 ? (
              <ul className="space-y-2">
                {parents.map(parent => (
                  <li key={parent.id}>
                    <Link
                      href={`/people/${parent.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {parent.full_name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">No parents added</p>
            )}
          </div>

          {/* Partners */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Partners ({partners.length})
            </h3>
            {partners.length > 0 ? (
              <ul className="space-y-2">
                {partners.map(partner => (
                  <li key={partner.id}>
                    <Link
                      href={`/people/${partner.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {partner.full_name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">No partners added</p>
            )}
          </div>

          {/* Children */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Children ({children.length})
            </h3>
            {children.length > 0 ? (
              <ul className="space-y-2">
                {children.map(child => (
                  <li key={child.id}>
                    <Link
                      href={`/people/${child.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {child.full_name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">No children added</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal would go here */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Edit {person.full_name}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Edit form coming soon
            </p>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
