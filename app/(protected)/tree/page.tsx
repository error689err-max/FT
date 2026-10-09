'use client'

import { useEffect, useState, useCallback } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'
import type { Database } from '@/types/database'
import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from 'reactflow'

type PersonRow = Database['public']['Tables']['person']['Row']

// Custom node component
function PersonNode({ data }: { data: { label: string; gender?: string; isAlive?: boolean } }) {
  const genderColor = {
    'Male': 'bg-blue-100 dark:bg-blue-900',
    'Female': 'bg-pink-100 dark:bg-pink-900',
    'Other': 'bg-purple-100 dark:bg-purple-900',
    'Prefer not to say': 'bg-gray-100 dark:bg-gray-700',
  }[data.gender || 'Other']

  const alive = data.isAlive ?? true

  return (
    <div
      className={`px-4 py-2 rounded-lg border-2 border-slate-400 dark:border-slate-600 ${genderColor} text-slate-900 dark:text-slate-100 shadow-md`}
    >
      <p className="font-medium text-sm whitespace-nowrap">{data.label}</p>
      <p className="text-xs text-slate-600 dark:text-slate-400">
        {alive ? '🟢' : '⚫'}
      </p>
    </div>
  )
}

const nodeTypes: NodeTypes = {
  person: PersonNode,
}

export default function TreeViewPage() {
  const [people, setPeople] = useState<PersonRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // Fetch all people
  const fetchPeople = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/people')
      if (!response.ok) {
        throw new Error('Failed to fetch people')
      }

      const data = await response.json()
      setPeople(data)

      // Build basic tree layout
      const basicNodes: ReactFlowNode[] = data.map((person: PersonRow, index: number) => ({
        id: person.id,
        data: {
          label: person.full_name,
          gender: person.gender,
          isAlive: person.is_alive,
        },
        position: { x: (index % 5) * 250, y: Math.floor(index / 5) * 150 },
        type: 'person',
      }))

      const basicEdges: ReactFlowEdge[] = []
      setNodes(basicNodes)
      setEdges(basicEdges)
    } catch (err: any) {
      setError(err.message || 'Failed to load family tree')
      setPeople([])
    } finally {
      setIsLoading(false)
    }
  }, [setNodes, setEdges])

  useEffect(() => {
    fetchPeople()
  }, [fetchPeople])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Family Tree
        </h1>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-600 dark:text-slate-400">Loading family tree...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Family Tree
        </h1>
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  if (people.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Family Tree
        </h1>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-600 dark:text-slate-400">
            Your family tree is empty. Add some people to get started.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
        Family Tree
      </h1>

      {/* Tree Visualization */}
      <div className="h-96 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Legend
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900 border-2 border-slate-400 rounded"></div>
            <span className="text-sm text-slate-600 dark:text-slate-400">Male</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-pink-100 dark:bg-pink-900 border-2 border-slate-400 rounded"></div>
            <span className="text-sm text-slate-600 dark:text-slate-400">Female</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">🟢</span>
            <span className="text-sm text-slate-600 dark:text-slate-400">Living</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">⚫</span>
            <span className="text-sm text-slate-600 dark:text-slate-400">Deceased</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">Total People</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{people.length}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">Living</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {people.filter(p => p.is_alive).length}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">Deceased</p>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {people.filter(p => !p.is_alive).length}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">Male</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {people.filter(p => p.gender === 'Male').length}
          </p>
        </div>
      </div>
    </div>
  )
}
