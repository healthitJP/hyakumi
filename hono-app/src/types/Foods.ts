import { NutritionEnum } from "./NutritionEnum";
export type Nutrient = {
	tagName: NutritionEnum;
	value: number | null;
	unit: string;
	isTraceAmount: boolean;
	estimated: boolean;
	description: string;
}

export type FoodItem = {
	foodId: string;
	category: string;
	index: string;
	foodName: string;
	nutrients: Nutrient[];
}

export type Foods = FoodItem[]

