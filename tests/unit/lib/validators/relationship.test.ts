import { describe, it, expect } from 'vitest'
import {
  validateParentCount,
  validateNoSelfRelationship,
  validateRelationshipType,
} from '@/lib/validators/relationship'

describe('Parent Count Validation', () => {
  it('should accept 0 parents', () => {
    const result = validateParentCount(0)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should accept 1 parent', () => {
    const result = validateParentCount(1)
    expect(result.valid).toBe(true)
  })

  it('should accept exactly 2 parents', () => {
    const result = validateParentCount(2)
    expect(result.valid).toBe(true)
  })

  it('should reject 3 parents', () => {
    const result = validateParentCount(3)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('A person cannot have more than 2 parents')
  })

  it('should reject more than 3 parents', () => {
    const result = validateParentCount(5)
    expect(result.valid).toBe(false)
  })
})

describe('No Self-Relationship Validation', () => {
  it('should accept different IDs', () => {
    const result = validateNoSelfRelationship('id1', 'id2')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should reject same ID', () => {
    const result = validateNoSelfRelationship('id1', 'id1')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain(
      'A person cannot have a relationship with themselves'
    )
  })

  it('should reject same UUID', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000'
    const result = validateNoSelfRelationship(uuid, uuid)
    expect(result.valid).toBe(false)
  })
})

describe('Relationship Type Validation', () => {
  it('should accept biological', () => {
    const result = validateRelationshipType('biological')
    expect(result.valid).toBe(true)
  })

  it('should accept adopted', () => {
    const result = validateRelationshipType('adopted')
    expect(result.valid).toBe(true)
  })

  it('should accept step', () => {
    const result = validateRelationshipType('step')
    expect(result.valid).toBe(true)
  })

  it('should reject invalid type', () => {
    const result = validateRelationshipType('invalid')
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('Invalid relationship type')
  })

  it('should reject empty string', () => {
    const result = validateRelationshipType('')
    expect(result.valid).toBe(false)
  })
})
