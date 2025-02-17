import { FoodItem } from '../types/Foods'
import { NutritionEnum } from '../types/NutritionEnum'

export const sortByNutrient = (foods: FoodItem[], tagName: NutritionEnum, isDesc: boolean = false) => {
  return [...foods].sort((a, b) => {
    const valueA = a.nutrients.find(n => n.tagName === tagName)?.value ?? null
    const valueB = b.nutrients.find(n => n.tagName === tagName)?.value ?? null
    
    if (valueA === null) return 1
    if (valueB === null) return -1
    if (valueA === valueB) return 0
    
    return isDesc 
      ? valueB - valueA 
      : valueA - valueB
  })
}

export const parseOrderString = (orderStr: string): { tagName: NutritionEnum, isDesc: boolean } => {
  const isDesc = orderStr.startsWith('-')
  const tagName = (isDesc ? orderStr.slice(1) : orderStr) as NutritionEnum
  return { tagName, isDesc }
}
