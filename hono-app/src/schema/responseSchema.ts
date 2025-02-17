import { z } from '@hono/zod-openapi'
import { FoodItemSchema } from '../types/Foods'

export const FoodsResponseSchema = z.object({
  contents: z.array(FoodItemSchema).openapi({
    description: '食品データの配列',
  }),
  totalCount: z.number().openapi({
    example: 3,
    description: '食品データの総数',
  }),
  offset: z.number().openapi({
    example: 0,
    description: '取得開始位置',
  }),
  limit: z.number().openapi({
    example: 10,
    description: '取得件数',
  })
})

export type FoodsResponse = z.infer<typeof FoodsResponseSchema>
