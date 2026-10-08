import type { Person } from './person'

export type ComputedRelationship =
  | 'self'
  | 'parent'
  | 'child'
  | 'sibling'
  | 'grandparent'
  | 'grandchild'
  | 'aunt-uncle'
  | 'niece-nephew'
  | 'cousin'
  | 'spouse-partner'
  | 'not-related'

export interface RelationshipLabel {
  label: string
  type: ComputedRelationship
  distance: number
}

export interface RelationshipPath {
  person1: Person
  person2: Person
  path: Person[]
  commonAncestors: Person[]
  relationship: RelationshipLabel
}

export interface CousinRelationship {
  degree: number
  removed: number
}

export interface FamilyGraph {
  nodes: Map<string, Person>
  parentEdges: Map<string, string[]>
  childEdges: Map<string, string[]>
  partnerEdges: Map<string, string[]>
}
