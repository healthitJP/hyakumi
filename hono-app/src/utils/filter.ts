import { Foods, FoodItem } from "../types/Foods";
import { NutritionEnum } from "../types/NutritionEnum";
import { WhereCondition } from "../types/Query";

export const filterByTagNames = (tags:NutritionEnum[], foodsData:Foods) => {
  return foodsData.map(food => {
    return {
      ...food,
      nutrients: food.nutrients.filter(nutrient => tags.includes(nutrient.tagName))
    };
  });
}

export const filterByCategories = (categories: number[], foods: Foods): Foods => {
  return foods.filter(food => categories.includes(Number(food.category)));
}

export const filterByWhereConditions = (conditions: WhereCondition[], foods: Foods): Foods => {
  return foods.filter(food => {
    return conditions.every(condition => {
      const nutrient = food.nutrients.find(n => n.tagName === condition.tagName);
      if (!nutrient?.value) return false;
      return condition.operator === '>' 
        ? nutrient.value > condition.value
        : nutrient.value < condition.value;
    });
  });
}

export const filterByFoodName = (foodName: string, foods: Foods): Foods => {
  return foods.filter(food => food.foodName.includes(foodName));
}