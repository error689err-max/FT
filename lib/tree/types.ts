import type { Node, Edge } from '@xyflow/react'
import type { Person } from '@/types/person'

export interface PersonNodeData extends Record<string, unknown> {
  person: Person
  isDeceased: boolean
}

export type PersonNode = Node<PersonNodeData>
export type PersonEdge = Edge

export interface LayoutResult {
  nodes: PersonNode[]
  edges: PersonEdge[]
}

export interface GenerationInfo {
  generation: number
  people: string[]
}
