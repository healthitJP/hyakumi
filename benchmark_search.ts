import { foodItems,FoodItem } from './food_data';


let foundItem: FoodItem | undefined = undefined;

const ids = foodItems.map(item => item.id);

const start = performance.now();
// 100万回検索を試す（例）
for (let i = 0; i < 1_000_000; i++) {
  const randomId = ids[Math.floor(Math.random() * ids.length)];
  foundItem = foodItems.find(item => item.id === randomId);
}
const end = performance.now();
console.log(`Time: ${end - start} ms`);
console.log(foundItem ? `Found: ${foundItem.id}` : 'Not found');
