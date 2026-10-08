import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-8 px-4 max-w-2xl">
        <div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Family Tree
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Build, explore, and understand your family connections
          </p>
        </div>

        <div className="space-y-4 text-slate-700 dark:text-slate-300">
          <p>Organize your family history with an intuitive, multi-tenant platform.</p>
          <ul className="text-left inline-block space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400">✓</span>
              Manage multiple family trees
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400">✓</span>
              Visualize relationships and family structures
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400">✓</span>
              Track ancestors, descendants, and connections
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400">✓</span>
              Collaborate with family members
            </li>
          </ul>
        </div>

        <div className="pt-4">
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  )
}
