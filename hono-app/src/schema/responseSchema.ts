import { z } from 'zod'
import { FoodItemSchema } from '../types/Foods'

export const FoodsResponseSchema = z.object({
  contents: z.array(FoodItemSchema),
  totalCount: z.number(),
  offset: z.number(),
  limit: z.number()
})

export type FoodsResponse = z.infer<typeof FoodsResponseSchema>
