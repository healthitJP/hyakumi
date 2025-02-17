import { z } from '@hono/zod-openapi'
import { NutritionEnum } from '../types/NutritionEnum'

export const QuerySchema = z.object({
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100).default(10)).optional(),
  offset: z.string().transform(Number).pipe(z.number().min(0).default(0)).optional(),
  orders: z.string().transform(str => str.split(',')).optional(),
  nutrients: z.string()
    .transform(str => str.split(','))
    .refine(arr => arr.every(tag => Object.keys(NutritionEnum).includes(tag)))
    .optional(),
  category: z.string()
    .transform(str => str.split(',').map(Number))
    .refine(arr => arr.every(num => num >= 1 && num <= 18))
    .optional(),
  where: z.string()
    .transform(str => str.split(','))
    .refine(arr => arr.every(condition => {
      const matches = condition.match(/([A-Z_]+)([<>])(\d+)/)
      if (!matches) return false
      const [_, tag, op, value] = matches
      return tag && Object.keys(NutritionEnum).includes(tag) && 
             (op === '<' || op === '>') && 
             !isNaN(Number(value))
    }))
    .optional()
})