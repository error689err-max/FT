'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
  type NodeTypes,
  type Node,
  type Edge,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from '@dagrejs/dagre'
import { Network, Users, RefreshCw, ChevronRight, X } from 'lucide-react'
import type { Database } from '@/types/database'

type PersonRow = Database['public']['Tables']['person']['Row']
type ParentChild = { parent_id: string; child_id: string; relationship_type: string }
type Partnership = { partner1_id: string; partner2_id: string }
type ViewMode = 'full' | 'nuclear' | 'ancestors' | 'descendants'

interface GraphData {
  people: PersonRow[]
  parentChild: ParentChild[]
  partnerships: Partnership[]
}

// ─── Constants ────────────────────────────────────────────────────────────────
const NODE_W = 200
const NODE_H = 88

// ─── Dagre layout ─────────────────────────────────────────────────────────────
function runDagreLayout(nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) return nodes

  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'TB', ranksep: 90, nodesep: 36, marginx: 32, marginy: 32 })
  g.setDefaultEdgeLabel(() => ({}))

  nodes.forEach(n => g.setNode(n.id, { width: NODE_W, height: NODE_H }))
  // Only use parent-child edges for layout (not partner edges)
  edges.filter(e => e.type !== 'straight').forEach(e => g.setEdge(e.source, e.target))

  dagre.layout(g)

  return nodes.map(n => {
    const dn = g.node(n.id)
    if (!dn) return n
    return { ...n, position: { x: dn.x - NODE_W / 2, y: dn.y - NODE_H / 2 } }
  })
}

// ─── Build graph from data ────────────────────────────────────────────────────
function buildGraph(
  people: PersonRow[],
  parentChild: ParentChild[],
  partnerships: Partnership[],
  viewMode: ViewMode,
  focusId?: string
): { nodes: Node[]; edges: Edge[] } {
  if (people.length === 0) return { nodes: [], edges: [] }

  // Filter by view mode
  let visibleIds = new Set(people.map(p => p.id))
  if (focusId && viewMode !== 'full') {
    visibleIds = getVisibleIds(focusId, viewMode, parentChild, partnerships, people)
  }

  const visible = people.filter(p => visibleIds.has(p.id))

  const nodes: Node[] = visible.map(p => ({
    id: p.id,
    type: 'person',
    position: { x: 0, y: 0 }, // dagre will set this
    data: buildNodeData(p, focusId),
  }))

  const edges: Edge[] = []

  // Parent-child edges
  parentChild.forEach(({ parent_id, child_id, relationship_type }) => {
    if (!visibleIds.has(parent_id) || !visibleIds.has(child_id)) return
    const isAdopted = relationship_type === 'adopted'
    const isStep = relationship_type === 'step'
    edges.push({
      id: `pc-${parent_id}-${child_id}`,
      source: parent_id,
      target: child_id,
      type: 'smoothstep',
      animated: false,
      style: {
        stroke: isAdopted ? '#f59e0b' : isStep ? '#8b5cf6' : '#94a3b8',
        strokeWidth: isAdopted || isStep ? 1.5 : 2,
        strokeDasharray: isAdopted ? '6 3' : isStep ? '4 4' : undefined,
      },
      markerEnd: {
        type: 'arrowclosed' as any,
        color: isAdopted ? '#f59e0b' : isStep ? '#8b5cf6' : '#94a3b8',
        width: 14,
        height: 14,
      },
    })
  })

  // Partner edges — straight horizontal lines
  partnerships.forEach(({ partner1_id, partner2_id }) => {
    if (!visibleIds.has(partner1_id) || !visibleIds.has(partner2_id)) return
    if (partner1_id > partner2_id) return // dedupe
    edges.push({
      id: `p-${partner1_id}-${partner2_id}`,
      source: partner1_id,
      target: partner2_id,
      type: 'straight',
      animated: false,
      style: { stroke: '#f472b6', strokeWidth: 2, strokeDasharray: '5 4' },
      label: '♥',
      labelStyle: { fontSize: 12, fill: '#f472b6', fontWeight: 600 },
      labelBgStyle: { fill: 'transparent' },
    })
  })

  // Apply Dagre layout
  const laidOutNodes = runDagreLayout(nodes, edges)
  return { nodes: laidOutNodes, edges }
}

function buildNodeData(p: PersonRow, focusId?: string) {
  return {
    name: p.full_name,
    gender: p.gender,
    birthYear: p.birth_date ? String(new Date(p.birth_date).getFullYear()) : undefined,
    deathYear: p.death_date ? String(new Date(p.death_date).getFullYear()) : undefined,
    isAlive: p.is_alive,
    city: p.city,
    country: p.country,
    isFocus: p.id === focusId,
    personId: p.id,
  }
}

function getVisibleIds(
  focusId: string,
  mode: ViewMode,
  parentChild: ParentChild[],
  partnerships: Partnership[],
  people: PersonRow[]
): Set<string> {
  const ids = new Set<string>([focusId])
  const childMap = new Map<string, string[]>()
  const parentMap = new Map<string, string[]>()
  const partnerMap = new Map<string, string[]>()
  people.forEach(p => { childMap.set(p.id, []); parentMap.set(p.id, []); partnerMap.set(p.id, []) })
  parentChild.forEach(({ parent_id, child_id }) => {
    childMap.get(parent_id)?.push(child_id)
    parentMap.get(child_id)?.push(parent_id)
  })
  partnerships.forEach(({ partner1_id, partner2_id }) => {
    partnerMap.get(partner1_id)?.push(partner2_id)
    partnerMap.get(partner2_id)?.push(partner1_id)
  })

  if (mode === 'nuclear') {
    parentMap.get(focusId)?.forEach(id => ids.add(id))
    partnerMap.get(focusId)?.forEach(id => ids.add(id))
    childMap.get(focusId)?.forEach(id => ids.add(id))
    // Also add children's other parent (so the couple is shown)
    childMap.get(focusId)?.forEach(cid => parentMap.get(cid)?.forEach(pid => ids.add(pid)))
  } else if (mode === 'ancestors') {
    const q = [focusId]
    while (q.length > 0) {
      const id = q.shift()!
      parentMap.get(id)?.forEach(pid => { if (!ids.has(pid)) { ids.add(pid); q.push(pid) } })
      partnerMap.get(id)?.forEach(pid => ids.add(pid))
    }
  } else if (mode === 'descendants') {
    const q = [focusId]
    while (q.length > 0) {
      const id = q.shift()!
      childMap.get(id)?.forEach(cid => { if (!ids.has(cid)) { ids.add(cid); q.push(cid) } })
      partnerMap.get(id)?.forEach(pid => ids.add(pid))
    }
  }
  return ids
}

// ─── Person Node ──────────────────────────────────────────────────────────────
interface PersonNodeData {
  name: string
  gender: string | null
  birthYear?: string
  deathYear?: string
  isAlive: boolean
  city?: string | null
  country?: string | null
  isFocus?: boolean
  personId: string
  [key: string]: unknown
}

const GENDER_STYLES: Record<string, { border: string; avatar: string; bg: string }> = {
  Male:               { border: 'border-blue-300 dark:border-blue-700',   avatar: 'bg-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950/60' },
  Female:             { border: 'border-pink-300 dark:border-pink-700',   avatar: 'bg-pink-500',   bg: 'bg-pink-50 dark:bg-pink-950/60' },
  Other:              { border: 'border-purple-300 dark:border-purple-700', avatar: 'bg-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/60' },
  'Prefer not to say':{ border: 'border-slate-300 dark:border-slate-600', avatar: 'bg-slate-500',  bg: 'bg-slate-50 dark:bg-slate-800' },
}
const DEFAULT_STYLE = GENDER_STYLES['Prefer not to say']

function PersonNodeComponent({ data, selected }: NodeProps) {
  const d = data as PersonNodeData
  const style = GENDER_STYLES[d.gender ?? ''] ?? DEFAULT_STYLE
  const initials = d.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2 !border-0" />
      <div
        style={{ width: NODE_W, minHeight: NODE_H }}
        className={[
          'rounded-xl border-2 shadow-sm cursor-pointer select-none overflow-hidden transition-all',
          style.bg,
          style.border,
          selected ? 'ring-2 ring-offset-2 ring-blue-500 shadow-lg scale-105' : 'hover:shadow-md hover:scale-[1.02]',
          d.isFocus ? 'ring-2 ring-offset-1 ring-yellow-400' : '',
          !d.isAlive ? 'opacity-70' : '',
        ].join(' ')}
      >
        <div className="flex items-center gap-2.5 p-3">
          {/* Avatar */}
          <div className={`shrink-0 w-10 h-10 rounded-full ${style.avatar} flex items-center justify-center text-white text-xs font-bold`}>
            {initials}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate leading-tight">
              {d.name}
            </p>
            {(d.birthYear || d.deathYear) && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                {d.birthYear ?? '?'}{d.deathYear ? ` – ${d.deathYear}` : d.isAlive ? '' : ' – ?'}
              </p>
            )}
            {(d.city || d.country) && (
              <p className="text-[10px] text-slate-400 truncate leading-snug">
                {[d.city, d.country].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
          {/* Status dot */}
          <div className={`shrink-0 w-2 h-2 rounded-full ${d.isAlive ? 'bg-green-400' : 'bg-slate-400'}`} />
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2 !border-0" />
    </>
  )
}

const nodeTypes: NodeTypes = { person: PersonNodeComponent }

// ─── Inner graph (needs ReactFlow context) ────────────────────────────────────
function GraphInner({
  graphData,
  viewMode,
  focusPerson,
  onNodeClick,
}: {
  graphData: GraphData
  viewMode: ViewMode
  focusPerson: string
  onNodeClick: (person: PersonRow) => void
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const { fitView } = useReactFlow()
  const initialised = useRef(false)

  useEffect(() => {
    const { nodes: n, edges: e } = buildGraph(
      graphData.people,
      graphData.parentChild,
      graphData.partnerships,
      viewMode,
      focusPerson || undefined
    )
    setNodes(n)
    setEdges(e)
    // Give nodes time to mount before fitting
    setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 50)
    initialised.current = true
  }, [graphData, viewMode, focusPerson, setNodes, setEdges, fitView])

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const person = graphData.people.find(p => p.id === node.id)
    if (person) onNodeClick(person)
  }, [graphData, onNodeClick])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      onNodeClick={handleNodeClick}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      minZoom={0.05}
      maxZoom={2.5}
      attributionPosition="bottom-left"
      proOptions={{ hideAttribution: false }}
    >
      <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="#e2e8f0" />
      <Controls className="!rounded-xl !border-slate-200 dark:!border-slate-700 !bg-white dark:!bg-slate-900 !shadow-md" showInteractive={false} />
      <MiniMap
        nodeColor={n => {
          const gender = (n.data as PersonNodeData).gender
          return gender === 'Male' ? '#3b82f6' : gender === 'Female' ? '#ec4899' : gender === 'Other' ? '#8b5cf6' : '#94a3b8'
        }}
        maskColor="rgba(148,163,184,0.08)"
        className="!rounded-xl !border-slate-200 dark:!border-slate-700 !bg-white dark:!bg-slate-900"
        zoomable
        pannable
      />
      <Panel position="top-right">
        <GraphLegend />
      </Panel>
    </ReactFlow>
  )
}

// ─── Legend ────────────────────────────────────────────────────────────────────
function GraphLegend() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-md p-3 text-xs space-y-2 min-w-[148px]">
      <p className="font-semibold text-slate-600 dark:text-slate-400 text-[11px] uppercase tracking-wider">Legend</p>
      <div className="space-y-1.5">
        {[
          { color: 'bg-blue-500', label: 'Male' },
          { color: 'bg-pink-500', label: 'Female' },
          { color: 'bg-purple-500', label: 'Other' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <span className="text-slate-600 dark:text-slate-400">{label}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100 dark:border-slate-800 pt-2 space-y-1.5">
        <div className="flex items-center gap-2">
          <svg width="22" height="8"><line x1="0" y1="4" x2="22" y2="4" stroke="#94a3b8" strokeWidth="2"/></svg>
          <span className="text-slate-500 dark:text-slate-400">Biological</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="22" height="8"><line x1="0" y1="4" x2="22" y2="4" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,3"/></svg>
          <span className="text-slate-500 dark:text-slate-400">Adopted</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="22" height="8"><line x1="0" y1="4" x2="22" y2="4" stroke="#f472b6" strokeWidth="2" strokeDasharray="5,4"/></svg>
          <span className="text-slate-500 dark:text-slate-400">Partner ♥</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="22" height="8"><line x1="0" y1="4" x2="22" y2="4" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4,4"/></svg>
          <span className="text-slate-500 dark:text-slate-400">Step</span>
        </div>
      </div>
      <div className="border-t border-slate-100 dark:border-slate-800 pt-2 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-slate-500 dark:text-slate-400">Living</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span className="text-slate-500 dark:text-slate-400">Deceased</span>
        </div>
      </div>
    </div>
  )
}

// ─── Person detail side-panel ─────────────────────────────────────────────────
function PersonPanel({ person, graphData, onClose }: { person: PersonRow; graphData: GraphData; onClose: () => void }) {
  const parents = graphData.parentChild
    .filter(r => r.child_id === person.id)
    .map(r => ({ rel: r, p: graphData.people.find(x => x.id === r.parent_id) }))
    .filter(x => x.p)

  const children = graphData.parentChild
    .filter(r => r.parent_id === person.id)
    .map(r => graphData.people.find(x => x.id === r.child_id))
    .filter(Boolean) as PersonRow[]

  const partners = graphData.partnerships
    .filter(p => p.partner1_id === person.id || p.partner2_id === person.id)
    .map(p => graphData.people.find(x => x.id === (p.partner1_id === person.id ? p.partner2_id : p.partner1_id)))
    .filter(Boolean) as PersonRow[]

  const style = GENDER_STYLES[person.gender ?? ''] ?? DEFAULT_STYLE
  const initials = person.full_name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const by = person.birth_date ? new Date(person.birth_date).getFullYear() : null
  const dy = person.death_date ? new Date(person.death_date).getFullYear() : null

  return (
    <aside className="w-72 shrink-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Details</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Identity */}
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${style.avatar} flex items-center justify-center text-white font-bold text-base shrink-0`}>
            {initials}
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 leading-tight">{person.full_name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{person.gender ?? 'Unknown'}</p>
            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full mt-1 font-medium ${
              person.is_alive
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${person.is_alive ? 'bg-green-500' : 'bg-slate-400'}`} />
              {person.is_alive ? 'Living' : 'Deceased'}
            </span>
          </div>
        </div>

        {/* Facts */}
        <div className="grid grid-cols-2 gap-2">
          {by && <Fact label="Born" value={String(by)} />}
          {dy && <Fact label="Died" value={String(dy)} />}
          {(person.city || person.country) && (
            <Fact label="Location" value={[person.city, person.country].filter(Boolean).join(', ')} span />
          )}
        </div>

        {/* Relations */}
        {parents.length > 0 && (
          <RelList title="Parents" items={parents.map(x => ({
            name: x.p!.full_name,
            href: `/people/${x.p!.id}`,
            sub: x.rel.relationship_type,
            color: 'bg-blue-400',
          }))} />
        )}
        {partners.length > 0 && (
          <RelList title="Partners" items={partners.map(x => ({
            name: x.full_name,
            href: `/people/${x.id}`,
            color: 'bg-pink-400',
          }))} />
        )}
        {children.length > 0 && (
          <RelList title="Children" items={children.map(x => ({
            name: x.full_name,
            href: `/people/${x.id}`,
            color: 'bg-green-400',
          }))} />
        )}

        {person.notes && (
          <div>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Notes</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg p-3 leading-relaxed italic">
              "{person.notes}"
            </p>
          </div>
        )}

        <a
          href={`/people/${person.id}`}
          className="flex w-full items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition"
        >
          Full Profile <ChevronRight size={12} />
        </a>
      </div>
    </aside>
  )
}

function Fact({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <div className={`bg-slate-50 dark:bg-slate-800 rounded-lg p-2.5 ${span ? 'col-span-2' : ''}`}>
      <p className="text-[10px] text-slate-400 dark:text-slate-500">{label}</p>
      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5 truncate">{value}</p>
    </div>
  )
}

function RelList({ title, items }: {
  title: string
  items: { name: string; href: string; sub?: string; color: string }[]
}) {
  return (
    <div>
      <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">{title}</p>
      <div className="space-y-1">
        {items.map((item, i) => (
          <a key={i} href={item.href}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition group">
            <span className={`w-2 h-2 rounded-full ${item.color} shrink-0`} />
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.name}
              </p>
              {item.sub && <p className="text-[10px] text-slate-400 capitalize">{item.sub}</p>}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function NetworkGraphPage() {
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('full')
  const [focusPerson, setFocusPerson] = useState('')
  const [selected, setSelected] = useState<PersonRow | null>(null)

  const fetchGraph = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch('/api/graph')
      if (!res.ok) throw new Error('Failed to load graph')
      setGraphData(await res.json())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchGraph() }, [fetchGraph])

  if (isLoading) return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500">Loading network graph…</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center space-y-3">
        <p className="text-red-500">{error}</p>
        <button onClick={fetchGraph} className="text-sm text-blue-600 hover:underline">Try again</button>
      </div>
    </div>
  )

  if (!graphData || graphData.people.length === 0) return (
    <div className="h-full flex flex-col gap-5">
      <PageHeader />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Network size={48} className="mx-auto text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400">Add family members to see the graph.</p>
          <a href="/people" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            <Users size={14} /> Add People
          </a>
        </div>
      </div>
    </div>
  )

  const { people, parentChild, partnerships } = graphData
  const stats = {
    people: people.length,
    living: people.filter(p => p.is_alive).length,
    connections: parentChild.length + partnerships.length,
    generations: countGenerations(people, parentChild),
  }

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center justify-between shrink-0">
        <PageHeader />
        <button onClick={fetchGraph} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition" title="Refresh">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-2 shrink-0">
        {[
          { label: 'People', value: stats.people, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Living', value: stats.living, color: 'text-green-600 dark:text-green-400' },
          { label: 'Connections', value: stats.connections, color: 'text-purple-600 dark:text-purple-400' },
          { label: 'Generations', value: stats.generations, color: 'text-orange-600 dark:text-orange-400' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {/* View mode tabs */}
        <div className="flex items-center p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl gap-0.5">
          {(['full', 'nuclear', 'ancestors', 'descendants'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                viewMode === mode
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {mode === 'full' ? 'Full Tree' : mode === 'nuclear' ? 'Nuclear' : mode}
            </button>
          ))}
        </div>

        {/* Focus person picker */}
        {viewMode !== 'full' && (
          <select
            value={focusPerson}
            onChange={e => setFocusPerson(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pick a person…</option>
            {people.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
        )}
      </div>

      {/* Graph + Panel */}
      <div className="flex flex-1 gap-3 min-h-0">
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[500px]">
          <ReactFlowProvider>
            <GraphInner
              graphData={graphData}
              viewMode={viewMode}
              focusPerson={focusPerson}
              onNodeClick={setSelected}
            />
          </ReactFlowProvider>
        </div>

        {selected && (
          <PersonPanel
            person={selected}
            graphData={graphData}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  )
}

function PageHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
        <Network size={18} />
      </div>
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Network Graph</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Click any node to explore connections</p>
      </div>
    </div>
  )
}

function countGenerations(people: PersonRow[], parentChild: ParentChild[]): number {
  if (people.length === 0) return 0
  const childIds = new Set(parentChild.map(r => r.child_id))
  const roots = people.filter(p => !childIds.has(p.id)).map(p => p.id)
  if (roots.length === 0) return 1

  const childMap = new Map<string, string[]>()
  people.forEach(p => childMap.set(p.id, []))
  parentChild.forEach(({ parent_id, child_id }) => childMap.get(parent_id)?.push(child_id))

  let max = 0
  const bfs = (ids: string[], depth: number) => {
    if (ids.length === 0) return
    max = Math.max(max, depth)
    const next: string[] = []
    ids.forEach(id => childMap.get(id)?.forEach(cid => next.push(cid)))
    bfs(next, depth + 1)
  }
  bfs(roots, 1)
  return max
}
