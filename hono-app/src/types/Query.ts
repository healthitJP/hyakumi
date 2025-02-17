import { NutritionEnum } from "./NutritionEnum";

export type FoodQuery = {
  limit?: number;
  offset?: number;
  orders?: string[];
  nutrients?: NutritionEnum[];
  category?: number[];
  where?: WhereCondition[];
}

export type WhereCondition = {
  tagName: NutritionEnum;
  operator: '<' | '>';
  value: number;
}

export type OrderDirection = 'asc' | 'desc';
