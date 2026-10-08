import { createServerClientInstance } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createServerClientInstance()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
          Welcome to Your Family Tree
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Signed in as: <strong>{user?.email}</strong>
        </p>
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
            Features Coming Soon
          </h2>
          <ul className="space-y-2 text-slate-600 dark:text-slate-400">
            <li>✓ Manage family members and relationships</li>
            <li>✓ Visualize your family tree</li>
            <li>✓ Analyze how people are related</li>
            <li>✓ View family statistics</li>
          </ul>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          About This Application
        </h3>
        <p className="text-blue-800 dark:text-blue-200 text-sm">
          This is a multi-tenant family tree application. Your data is completely isolated and private.
          You can manage multiple family trees and invite family members to collaborate.
        </p>
      </div>
    </div>
  )
}
