"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var food_data_1 = require("./food_data");
var foundItem = undefined;
var ids = food_data_1.foodItems.map(function (item) { return item.id; });
var start = performance.now();
var _loop_1 = function (i) {
    var randomId = ids[Math.floor(Math.random() * ids.length)];
    foundItem = food_data_1.foodItems.find(function (item) { return item.id === randomId; });
};
// 100万回検索を試す（例）
for (var i = 0; i < 1000000; i++) {
    _loop_1(i);
}
var end = performance.now();
console.log("Time: ".concat(end - start, " ms"));
console.log(foundItem ? "Found: ".concat(foundItem.id) : 'Not found');
