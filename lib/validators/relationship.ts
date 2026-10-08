import type { RelationshipType } from '@/types/person'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validate parent count
 * Rule: Maximum 2 parents per person
 */
export function validateParentCount(
  parentCount: number
): ValidationResult {
  const errors: string[] = []

  if (parentCount > 2) {
    errors.push('A person cannot have more than 2 parents')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate no self-relationships
 * Rule: A person cannot be their own parent or partner
 */
export function validateNoSelfRelationship(
  id1: string,
  id2: string
): ValidationResult {
  const errors: string[] = []

  if (id1 === id2) {
    errors.push('A person cannot have a relationship with themselves')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate relationship type
 * Valid types: biological, adopted, step
 */
export function validateRelationshipType(
  type: string
): ValidationResult {
  const validTypes: RelationshipType[] = ['biological', 'adopted', 'step']
  const errors: string[] = []

  if (!validTypes.includes(type as RelationshipType)) {
    errors.push(
      `Invalid relationship type. Must be one of: ${validTypes.join(', ')}`
    )
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
