import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validatePassword,
  validatePersonInput,
  findDuplicateNames,
} from '@/lib/validators/person'

describe('Email Validation', () => {
  it('should accept valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true)
    expect(validateEmail('a@b.c')).toBe(true)
  })

  it('should reject empty string', () => {
    expect(validateEmail('')).toBe(false)
  })

  it('should reject strings without @', () => {
    expect(validateEmail('notanemail')).toBe(false)
    expect(validateEmail('user.com')).toBe(false)
  })

  it('should reject emails over 254 characters', () => {
    const longEmail = 'a'.repeat(250) + '@.c'
    expect(validateEmail(longEmail)).toBe(false)
  })

  it('should accept emails at 254 character limit', () => {
    const limitEmail = 'a'.repeat(249) + '@.c'
    expect(validateEmail(limitEmail)).toBe(true)
  })
})

describe('Password Validation', () => {
  it('should accept password of 8 characters', () => {
    expect(validatePassword('12345678')).toBe(true)
  })

  it('should accept password over 8 characters', () => {
    expect(validatePassword('mypassword')).toBe(true)
    expect(validatePassword('a'.repeat(100))).toBe(true)
  })

  it('should reject password under 8 characters', () => {
    expect(validatePassword('1234567')).toBe(false)
    expect(validatePassword('')).toBe(false)
    expect(validatePassword('abc')).toBe(false)
  })
})

describe('Person Input Validation', () => {
  it('should reject missing full name', () => {
    const result = validatePersonInput({
      fullName: '',
      isAlive: true,
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Full name is required')
  })

  it('should accept valid person input', () => {
    const result = validatePersonInput({
      fullName: 'John Doe',
      isAlive: true,
    })
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should reject birth date after death date', () => {
    const result = validatePersonInput({
      fullName: 'John Doe',
      isAlive: false,
      birthDate: new Date('2000-01-01'),
      deathDate: new Date('1990-01-01'),
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Birth date cannot be after death date')
  })

  it('should warn if deceased without death date', () => {
    const result = validatePersonInput({
      fullName: 'John Doe',
      isAlive: false,
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain(
      'Warning: Person marked as deceased but no death date provided'
    )
  })

  it('should accept birth date equal to death date', () => {
    const sameDate = new Date('1950-01-01')
    const result = validatePersonInput({
      fullName: 'John Doe',
      isAlive: false,
      birthDate: sameDate,
      deathDate: sameDate,
    })
    expect(result.valid).toBe(true)
  })
})

describe('Duplicate Name Detection', () => {
  it('should find exact duplicate', () => {
    const result = findDuplicateNames('John Doe', ['John Doe', 'Jane Doe'])
    expect(result).toContain('John Doe')
  })

  it('should find case-insensitive duplicates', () => {
    const result = findDuplicateNames('john doe', ['John Doe', 'Jane Doe'])
    expect(result).toContain('John Doe')
  })

  it('should return empty array if no duplicates', () => {
    const result = findDuplicateNames('Bob Smith', ['John Doe', 'Jane Doe'])
    expect(result).toHaveLength(0)
  })

  it('should handle empty list', () => {
    const result = findDuplicateNames('John Doe', [])
    expect(result).toHaveLength(0)
  })
})
