'use client'

import { useState, useEffect } from 'react'
import type { Database } from '@/types/database'
import type { PersonInput, Gender } from '@/types/person'

type PersonRow = Database['public']['Tables']['person']['Row']

interface PersonFormProps {
  person?: PersonRow | null
  onSubmit: (data: PersonInput) => Promise<void>
  onCancel: () => void
  isOpen: boolean
  availablePeople?: PersonRow[]
}

export function PersonForm({ person, onSubmit, onCancel, isOpen }: PersonFormProps) {
  const [formData, setFormData] = useState<PersonInput>({
    fullName: '',
    isAlive: true,
  })
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when person changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: person?.full_name || '',
        gender: person?.gender as Gender || undefined,
        birthDate: person?.birth_date ? new Date(person.birth_date) : undefined,
        deathDate: person?.death_date ? new Date(person.death_date) : undefined,
        isAlive: person?.is_alive ?? true,
        city: person?.city || undefined,
        country: person?.country || undefined,
        notes: person?.notes || undefined,
      })
      setErrors([])
    }
  }, [person, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setIsSubmitting(true)

    try {
      // Basic validation
      const newErrors: string[] = []
      if (!formData.fullName.trim()) {
        newErrors.push('Full name is required')
      }
      if (formData.birthDate && formData.deathDate && formData.birthDate > formData.deathDate) {
        newErrors.push('Birth date cannot be after death date')
      }
      if (!formData.isAlive && !formData.deathDate) {
        newErrors.push('Warning: Person marked as deceased but no death date provided')
      }

      if (newErrors.length > 0) {
        setErrors(newErrors)
        return
      }

      await onSubmit(formData)
    } catch (error: any) {
      if (error.message) {
        setErrors([error.message])
      } else {
        setErrors(['An unexpected error occurred'])
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFieldChange = (field: keyof PersonInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-md max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {person ? 'Edit Person' : 'Add Person'}
            </h2>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              ✕
            </button>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Enter full name"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">
                Gender
              </label>
              <select
                value={formData.gender || ''}
                onChange={(e) => handleFieldChange('gender', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">
                Birth Date
              </label>
              <input
                type="date"
                value={formData.birthDate ? formData.birthDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleFieldChange('birthDate', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Living Status */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isAlive}
                  onChange={(e) => handleFieldChange('isAlive', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-slate-900 dark:text-slate-100">Person is alive</span>
              </label>
            </div>

            {/* Death Date (if not alive) */}
            {!formData.isAlive && (
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">
                  Death Date
                </label>
                <input
                  type="date"
                  value={formData.deathDate ? formData.deathDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleFieldChange('deathDate', e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            )}

            {/* City */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">
                City
              </label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => handleFieldChange('city', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Enter city"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">
                Country
              </label>
              <input
                type="text"
                value={formData.country || ''}
                onChange={(e) => handleFieldChange('country', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Enter country"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleFieldChange('notes', e.target.value || undefined)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Enter notes or additional information"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : person ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}