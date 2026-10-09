import { createServerClientInstance } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createServerClientInstance()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            Welcome to Your Family Tree
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Signed in as: <strong>{user?.email}</strong>
          </p>
        </div>
        <button
          onClick={() => {
            const link = document.createElement('a')
            link.href = '/api/export/tree'
            link.download = `family-tree-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded font-medium transition"
        >
          Export Data
        </button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Getting Started */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
            Getting Started
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Start building your family tree by adding family members.
          </p>
          <a
            href="/people"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded font-medium transition"
          >
            Add First Person
          </a>
        </div>

        {/* Features */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
            Available Features
          </h2>
          <ul className="space-y-2 text-slate-600 dark:text-slate-400">
            <li>✓ Manage family members and relationships</li>
            <li>✓ Visualize your family tree</li>
            <li>✓ Analyze how people are related</li>
            <li>✓ View family statistics</li>
            <li>✓ Export your family data</li>
          </ul>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <QuickLink href="/people" title="People" icon="👥" />
        <QuickLink href="/tree" title="Family Tree" icon="🌳" />
        <QuickLink href="/related" title="Find Relations" icon="🔗" />
        <QuickLink href="/stats" title="Statistics" icon="📊" />
      </div>

      {/* Info Section */}
      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          About This Application
        </h3>
        <p className="text-blue-800 dark:text-blue-200 text-sm">
          This is a multi-tenant family tree application. Your data is completely isolated and private.
          You can manage multiple family trees and share with family members to collaborate.
        </p>
      </div>
    </div>
  )
}

function QuickLink({ href, title, icon }: { href: string; title: string; icon: string }) {
  return (
    <Link
      href={href}
      className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition"
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className="font-semibold text-slate-900 dark:text-slate-100">{title}</div>
    </Link>
  )
}
