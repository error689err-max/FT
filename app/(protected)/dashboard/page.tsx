import { createServerClientInstance } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Network, GitBranch, BarChart3, ArrowRight, TreePine } from 'lucide-react'
import { ExportButton } from './components/export-button'
import { getTreeStatistics, getAllParentChildRelationships, getAllPartnerships } from '@/lib/db/queries'

export default async function DashboardPage() {
  const supabase = await createServerClientInstance()
  const { data: { user } } = await supabase.auth.getUser()

  console.log('\n[Dashboard SSR] ────────────────────────────')
  console.log('[Dashboard SSR] user:', user?.email ?? 'null', '| id:', user?.id ?? 'null')

  const { data: treeMember, error: tmErr } = await supabase
    .from('tree_member')
    .select('tree_id, role')
    .eq('user_id', user!.id)
    .single() as { data: { tree_id: string; role: string } | null; error: any }

  console.log('[Dashboard SSR] treeMember:', JSON.stringify(treeMember), '| error:', tmErr?.message ?? 'none')

  // Fetch stats if tree exists
  let stats = null
  let relationshipCount = 0
  let treeName = 'My Family Tree'
  if (treeMember?.tree_id) {
    // Fetch tree name separately
    const { data: treeData } = await supabase
      .from('tree')
      .select('name')
      .eq('id', treeMember.tree_id)
      .single() as { data: { name: string } | null; error: any }
    if (treeData) treeName = treeData.name
    try {
      const [treeStats, parentChild, partnerships] = await Promise.all([
        getTreeStatistics(supabase, treeMember.tree_id),
        getAllParentChildRelationships(supabase, treeMember.tree_id),
        getAllPartnerships(supabase, treeMember.tree_id),
      ])
      stats = treeStats
      relationshipCount = parentChild.length + partnerships.length
      console.log('[Dashboard SSR] stats: total=', stats?.totalCount, 'alive=', stats?.aliveCount)
      console.log('[Dashboard SSR] relationships:', relationshipCount)
    } catch (e) {
      console.error('[Dashboard SSR] stats error:', e)
    }
  }
  console.log('────────────────────────────────────────────\n')

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Welcome */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TreePine size={20} className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{treeName}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Welcome back{user?.email ? ', ' + user.email.split('@')[0] : ''}!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's an overview of your family tree.
          </p>
        </div>
        <ExportButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total People',
            value: stats?.totalCount ?? 0,
            sub: `${stats?.aliveCount ?? 0} living`,
            color: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
            textColor: 'text-blue-700 dark:text-blue-400',
          },
          {
            label: 'Relationships',
            value: relationshipCount,
            sub: 'connections',
            color: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
            textColor: 'text-purple-700 dark:text-purple-400',
          },
          {
            label: 'Living',
            value: stats?.aliveCount ?? 0,
            sub: stats?.totalCount ? `${Math.round(((stats.aliveCount ?? 0) / stats.totalCount) * 100)}% of tree` : '—',
            color: 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800',
            textColor: 'text-green-700 dark:text-green-400',
          },
          {
            label: 'Deceased',
            value: stats?.deceasedCount ?? 0,
            sub: stats?.oldestAncestor?.full_name ? `Oldest: ${stats.oldestAncestor.full_name}` : '—',
            color: 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700',
            textColor: 'text-slate-600 dark:text-slate-400',
          },
        ].map(({ label, value, sub, color, textColor }) => (
          <div key={label} className={`rounded-xl border p-4 ${color}`}>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{label}</p>
            <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              href: '/people',
              icon: Users,
              title: 'Manage People',
              desc: 'Add, edit, or view family members',
              color: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 hover:border-blue-400',
              iconBg: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
            },
            {
              href: '/tree',
              icon: Network,
              title: 'Network Graph',
              desc: 'Explore relationships visually',
              color: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 hover:border-purple-400',
              iconBg: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400',
            },
            {
              href: '/related',
              icon: GitBranch,
              title: 'Find Relationships',
              desc: 'Discover how two people are related',
              color: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800 hover:border-orange-400',
              iconBg: 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400',
            },
            {
              href: '/stats',
              icon: BarChart3,
              title: 'Statistics',
              desc: 'View analytics about your tree',
              color: 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 hover:border-green-400',
              iconBg: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400',
            },
          ].map(({ href, icon: Icon, title, desc, color, iconBg }) => (
            <Link
              key={href}
              href={href}
              className={`group flex flex-col gap-3 p-4 rounded-xl border transition-all ${color}`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
                <Icon size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
              </div>
              <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform mt-auto" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent additions */}
      {stats?.recentAdditions && stats.recentAdditions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Recent Additions
            </h2>
            <Link href="/people" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            {stats.recentAdditions.slice(0, 5).map(person => (
              <Link
                key={person.id}
                href={`/people/${person.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {person.full_name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {person.full_name}
                  </p>
                  <p className="text-xs text-slate-400">
                    Added {new Date(person.created_at).toLocaleDateString()}
                  </p>
                </div>
                <ArrowRight size={14} className="text-slate-400 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
