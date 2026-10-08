import type { Node, Edge } from 'reactflow'
import type { Person } from '@/types/person'

export interface PersonNodeData {
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
