'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Settings,
  TreePine,
  Shield,
  Download,
  LogOut,
  Edit2,
  Check,
  X,
  Calendar,
} from 'lucide-react'
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
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/tree-info')
      .then(r => r.ok ? r.json() : Promise.reject('Failed to load'))
      .then(data => {
        setTree(data.tree)
        setTreeMember(data.treeMember)
        setNewTreeName(data.tree.name)
      })
      .catch(e => setError(String(e)))
      .finally(() => setIsLoading(false))
  }, [])

  const handleSave = async () => {
    if (!newTreeName.trim()) return
    try {
      setIsSaving(true)
      const res = await fetch('/api/tree-info', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTreeName }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setTree(prev => prev ? { ...prev, name: newTreeName } : null)
      setIsEditing(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const handleExport = () => {
    const link = document.createElement('a')
    link.href = '/api/export/tree'
    link.download = `family-tree-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const roleDescriptions: Record<string, string> = {
    owner: 'You have full control — add, edit, and delete anything.',
    editor: 'You can add and modify people and relationships.',
    viewer: 'You can view the tree but not make changes.',
  }

  return (
    <div className="space-y-5 max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          <Settings size={18} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage your tree and account</p>
        </div>
      </div>

      {/* Success toast */}
      {saveSuccess && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-400">
          <Check size={15} /> Tree name updated successfully
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <X size={15} /> {error}
        </div>
      )}

      {/* Tree info */}
      <Section icon={<TreePine size={15} />} title="Tree Information">
        <Field label="Tree Name">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={newTreeName}
                onChange={e => setNewTreeName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setIsEditing(false) }}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSave}
                disabled={isSaving || !newTreeName.trim()}
                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition disabled:opacity-50"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => { setIsEditing(false); setNewTreeName(tree?.name ?? '') }}
                className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{tree?.name}</span>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
              >
                <Edit2 size={14} />
              </button>
            </div>
          )}
        </Field>

        <Field label="Created">
          <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
            <Calendar size={13} />
            {tree?.created_at ? new Date(tree.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
          </div>
        </Field>
      </Section>

      {/* Role */}
      <Section icon={<Shield size={15} />} title="Your Access">
        <div className="flex items-start gap-3">
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
            treeMember?.role === 'owner'
              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
              : treeMember?.role === 'editor'
              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}>
            {treeMember?.role ?? '—'}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {roleDescriptions[treeMember?.role ?? ''] ?? ''}
          </p>
        </div>
      </Section>

      {/* Data */}
      <Section icon={<Download size={15} />} title="Data & Export">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Download a full JSON backup of your family tree — people, relationships, and partnerships.
        </p>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition"
        >
          <Download size={15} />
          Export Family Tree
        </button>
      </Section>

      {/* Account */}
      <Section icon={<LogOut size={15} />} title="Account">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Sign out from all devices. You can sign back in anytime.
        </p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </Section>
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <span className="text-slate-500 dark:text-slate-400">{icon}</span>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</span>
      </div>
      <div className="px-5 py-4 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">{label}</p>
      {children}
    </div>
  )
}
