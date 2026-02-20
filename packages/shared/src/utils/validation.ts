import { z } from 'zod'

export function validateSchema<T>(schema: z.Schema<T>, data: unknown): T | null {
  try {
    return schema.parse(data)
  } catch (error) {
    console.error('Validation error:', error)
    return null
  }
}

export function isValidIssue(data: unknown): boolean {
  // This would import issueSchema, but we'll keep simple for now
  return typeof data === 'object' && data !== null
}

export function isValidUser(data: unknown): boolean {
  return typeof data === 'object' && data !== null
}