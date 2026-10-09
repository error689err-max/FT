'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/database'

type TreeRow = Database['public']['Tables']['tree']['Row']
type TreeMemberRow = Database['public']['Tables']['tree_member']['Row']

export default function SettingsPage() {
  const router = useRouter()
  const [tree, setTree] = useState<TreeRow | null>(null)
  const [treeMember, setTreeMember] = useState<TreeMemberRow | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newTreeName, setNewTreeName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch tree info
        const response = await fetch('/api/tree-info')
        if (!response.ok) {
          throw new Error('Failed to load tree settings')
        }

        const data = await response.json()
        setTree(data.tree)
        setTreeMember(data.treeMember)
        setNewTreeName(data.tree.name)
      } catch (err: any) {
        setError(err.message || 'Failed to load settings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSaveTreeName = async () => {
    try {
      setIsSaving(true)
      setSaveMessage(null)

      const response = await fetch('/api/tree-info', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTreeName }),
      })

      if (!response.ok) {
        throw new Error('Failed to update tree name')
      }

      setSaveMessage('Tree name updated successfully')
      setIsEditing(false)
      setTree(prev => prev ? { ...prev, name: newTreeName } : null)
    } catch (err: any) {
      setError(err.message || 'Failed to save tree name')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        router.push('/')
      }
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Settings
        </h1>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-600 dark:text-slate-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Settings
        </h1>
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
        Settings
      </h1>

      {/* Tree Settings */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Tree Information
        </h2>

        {saveMessage && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded">
            <p className="text-sm text-green-700 dark:text-green-300">{saveMessage}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tree Name
            </label>
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTreeName}
                  onChange={(e) => setNewTreeName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSaveTreeName}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:bg-blue-700 dark:hover:bg-blue-600 dark:disabled:bg-slate-700 text-white rounded font-medium"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setNewTreeName(tree?.name || '')
                  }}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded font-medium"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <p className="text-slate-900 dark:text-slate-100">{tree?.name}</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Your Role
            </label>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              <p className="text-slate-900 dark:text-slate-100 capitalize font-medium">
                {treeMember?.role}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {treeMember?.role === 'owner' && 'You have full control over this tree'}
                {treeMember?.role === 'editor' && 'You can add and modify people and relationships'}
                {treeMember?.role === 'viewer' && 'You can view the tree but cannot make changes'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Created
            </label>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              <p className="text-slate-900 dark:text-slate-100">
                {tree?.created_at ? new Date(tree.created_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Export */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Data & Privacy
        </h2>
        <div className="space-y-3">
          <button
            onClick={() => {
              const link = document.createElement('a')
              link.href = '/api/export/tree'
              link.download = `family-tree-${new Date().toISOString().split('T')[0]}.json`
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded font-medium text-left"
          >
            📥 Export Family Tree Data
          </button>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Download your family tree data in JSON format for backup or import to another application.
          </p>
        </div>
      </div>

      {/* Account Settings */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Account
        </h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded font-medium"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
