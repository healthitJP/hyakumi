import { z } from 'zod'
import { NutritionEnum } from "./NutritionEnum";

export const NutrientSchema = z.object({
	tagName: z.nativeEnum(NutritionEnum),
	value: z.number().nullable(),
	unit: z.string(),
	isTraceAmount: z.boolean(),
	estimated: z.boolean(),
	description: z.string(),
})

export type Nutrient = z.infer<typeof NutrientSchema>

export const FoodItemSchema = z.object({
	foodId: z.string(),
	category: z.string(),
	index: z.string(),
	foodName: z.string(),
	nutrients: z.array(NutrientSchema),
})

export type FoodItem = z.infer<typeof FoodItemSchema>

export const FoodsSchema = z.array(FoodItemSchema)

export type Foods = z.infer<typeof FoodsSchema>

