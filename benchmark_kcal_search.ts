import { foodItems, FoodItem } from './food_data';

// 文字列の栄養価データを数値に変換する関数
function parseNutritionValue(value: string): number | undefined {
    if (value === '-' || value === 'Tr') return undefined;
    const numStr = value.split(' ')[0];  // 単位を除去
    return parseFloat(numStr);
}

// 指定されたカロリー範囲の食品を検索する関数
function searchByKcalRange(minKcal: number, maxKcal: number): FoodItem[] {
    return foodItems.filter(item => {
        const kcalStr = item.ENERC_KCAL;
        const kcal = parseNutritionValue(kcalStr);
        return kcal !== undefined && kcal >= minKcal && kcal <= maxKcal;
    });
}

const MIN_KCAL = 404;
const MAX_KCAL = 800;

// ベンチマーク実行
const start = performance.now();
// 10000回検索を実行
for (let i = 0; i < 10000; i++) {
    const results = searchByKcalRange(MIN_KCAL, MAX_KCAL);
}
const end = performance.now();

// 最終結果の出力
const finalResults = searchByKcalRange(MIN_KCAL, MAX_KCAL);
console.log(`検索時間: ${end - start} ms`);
console.log(`${MIN_KCAL}~${MAX_KCAL}kcalの食品数: ${finalResults.length}`);
console.log('最初の5件:');
finalResults.slice(0, 5).forEach(item => {
    console.log(`- ${item.name}: ${item.ENERC_KCAL}`);
});
