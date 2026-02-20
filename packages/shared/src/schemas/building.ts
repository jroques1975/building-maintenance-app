import { z } from 'zod'

export const buildingSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string().optional(),
  units: z.number().int().positive().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type Building = z.infer<typeof buildingSchema>