import foodsDataJson from './food_data_array.min.json'
import metaDataJson from './metadata_array.min.json'
import { FoodItem,Foods } from '../types/Foods'

export const getNutrientValues = (nutrient: string | null): { 
    value: number | null; 
    isTraceAmount: boolean; 
    estimated: boolean; 
} => {
    // nullの場合
    if (nutrient === null) {
        return {
            value: null,
            isTraceAmount: false,
            estimated: false
        }
    }

    // 括弧で囲まれているかチェック
    const matchBrackets = nutrient.match(/^\((.*)\)$/);
    if (matchBrackets) {
        const innerValue = matchBrackets[1];
        // 括弧内がTrの場合
        if (innerValue === 'Tr') {
            return {
                value: 0,
                isTraceAmount: true,
                estimated: true
            }
        }
        // 括弧内が数値の場合
        const numValue = parseFloat(innerValue);
        if (!isNaN(numValue)) {
            return {
                value: numValue,
                isTraceAmount: false,
                estimated: true
            }
        }
    }

    // 通常の数値の場合
    const numValue = parseFloat(nutrient);
    return {
        value: isNaN(numValue) ? 0 : numValue,
        isTraceAmount: false,
        estimated: false
    }
}

export const foodsData = foodsDataJson.map((food) => {
    const data = food.data
    const nutrients = data.slice(4).map((nutrient,index) => {
        const { value, isTraceAmount, estimated }: {
            value: number | null;
            isTraceAmount: boolean;
            estimated: boolean;
        } = getNutrientValues(nutrient)
        return {
            tagName:metaDataJson[index].name,
            value:value,
            unit:metaDataJson[index].unit,
            isTraceAmount:isTraceAmount,
            estimated:estimated,
            description:metaDataJson[index].description
        }
    })
    return {
        category: data[0] as string,
        foodId: data[1] as string,
        index: data[2] as string,
        foodName: data[3] as string,
        nutrients: nutrients
    } as FoodItem
}) as Foods