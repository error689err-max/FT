import type { PersonInput } from '@/types/person'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validate email format
 * Rule: Must be between 1 and 254 characters and contain an @ symbol
 */
export function validateEmail(email: string): boolean {
  if (!email) return false
  if (email.length < 1 || email.length > 254) return false
  return email.includes('@')
}

/**
 * Validate password strength
 * Rule: Must be at least 8 characters
 */
export function validatePassword(password: string): boolean {
  return password.length >= 8
}

/**
 * Validate person input
 * Rules:
 *   - full_name is required
 *   - birth_date must be before death_date (if both provided)
 *   - if is_alive is false, should have a death_date (warning, not error)
 */
export function validatePersonInput(input: PersonInput): ValidationResult {
  const errors: string[] = []

  // Full name is required
  if (!input.fullName || input.fullName.trim().length === 0) {
    errors.push('Full name is required')
  }

  // Birth date must be before death date
  if (input.birthDate && input.deathDate) {
    if (input.birthDate > input.deathDate) {
      errors.push('Birth date cannot be after death date')
    }
  }

  // If deceased, should have death date (warning level)
  if (input.isAlive === false && !input.deathDate) {
    errors.push('Warning: Person marked as deceased but no death date provided')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Check for duplicate names in a list of people
 * Returns the names of any duplicates found
 */
export function findDuplicateNames(
  fullName: string,
  existingNames: string[]
): string[] {
  return existingNames.filter(
    (name) => name.toLowerCase() === fullName.toLowerCase()
  )
}
