import { z } from '@hono/zod-openapi'
import { NutritionEnum } from "./NutritionEnum";

export const NutrientSchema = z.object({
	tagName: z.nativeEnum(NutritionEnum).openapi({
    example: NutritionEnum.REFUSE,
    description: '栄養素のFAO/INFOODSのタグ名（成分識別子）',
  }),
	value: z.number().nullable().openapi({
    example: 0,
    description: '食品100gあたりの栄養素の値',
  }),
	unit: z.string().openapi({
    example: '%',
    description: '栄養素の単位',
  }),
	isTraceAmount: z.boolean().openapi({
    example: false,
    description: '微量かどうか',
  }),
	estimated: z.boolean().openapi({
    example: false,
    description: '推定値かどうか',
  }),
	description: z.string().openapi({
    example: '廃棄率',
    description: '栄養素の説明',
  }),
})

export type Nutrient = z.infer<typeof NutrientSchema>

export const FoodItemSchema = z.object({
	foodId: z.string().openapi({
    example: '18039',
    description: '食品番号',
  }),
	category: z.string().openapi({
    example: '18',
    description: '食品群',
  }),
	index: z.string().openapi({
    example: '2481',
    description: '索引番号',
  }),
	foodName: z.string().openapi({
    example: '韓国料理　和え物類　もやしのナムル',
    description: '食品名',
  }),
	nutrients: z.array(NutrientSchema).openapi({
    description: '栄養素の配列',
  }),
})

export type FoodItem = z.infer<typeof FoodItemSchema>

export const FoodsSchema = z.array(FoodItemSchema)

export type Foods = z.infer<typeof FoodsSchema>

