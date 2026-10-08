export interface Person {
  id: string
  treeId: string
  fullName: string
  gender: Gender | null
  birthDate: Date | null
  deathDate: Date | null
  isAlive: boolean
  city: string | null
  country: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say'

export type RelationshipType = 'biological' | 'adopted' | 'step'

export interface PersonWithRelationships extends Person {
  parents: PersonParent[]
  partners: PersonPartner[]
  children: PersonChild[]
  siblings: PersonSibling[]
}

export interface PersonParent {
  id: string
  fullName: string
  relationshipType: RelationshipType
}

export interface PersonPartner {
  id: string
  fullName: string
  startDate: Date | null
  endDate: Date | null
}

export interface PersonChild {
  id: string
  fullName: string
  relationshipType: RelationshipType
  partnerId: string | null
}

export interface PersonSibling {
  id: string
  fullName: string
  type: 'full' | 'half'
  sharedParents: string[]
}

export interface PersonInput {
  fullName: string
  gender?: Gender | null
  birthDate?: Date | null
  deathDate?: Date | null
  isAlive: boolean
  city?: string | null
  country?: string | null
  notes?: string | null
  parents?: {
    personId: string
    relationshipType: RelationshipType
  }[]
}

export interface PersonFilters {
  search?: string
  gender?: Gender
  isAlive?: boolean
  city?: string
  country?: string
}
