"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var food_data_1 = require("./food_data");
// 文字列の栄養価データを数値に変換する関数
function parseNutritionValue(value) {
    if (value === '-' || value === 'Tr')
        return undefined;
    var numStr = value.split(' ')[0]; // 単位を除去
    return parseFloat(numStr);
}
// 指定されたカロリー範囲の食品を検索する関数
function searchByKcalRange(minKcal, maxKcal) {
    return food_data_1.foodItems.filter(function (item) {
        var kcalStr = item.ENERC_KCAL;
        var kcal = parseNutritionValue(kcalStr);
        return kcal !== undefined && kcal >= minKcal && kcal <= maxKcal;
    });
}
var MIN_KCAL = 404;
var MAX_KCAL = 800;
// ベンチマーク実行
var start = performance.now();
// 10000回検索を実行
for (var i = 0; i < 10000; i++) {
    var results = searchByKcalRange(MIN_KCAL, MAX_KCAL);
}
var end = performance.now();
// 最終結果の出力
var finalResults = searchByKcalRange(MIN_KCAL, MAX_KCAL);
console.log("\u691C\u7D22\u6642\u9593: ".concat(end - start, " ms"));
console.log("".concat(MIN_KCAL, "~").concat(MAX_KCAL, "kcal\u306E\u98DF\u54C1\u6570: ").concat(finalResults.length));
console.log('最初の5件:');
finalResults.slice(0, 5).forEach(function (item) {
    console.log("- ".concat(item.name, ": ").concat(item.ENERC_KCAL));
});
