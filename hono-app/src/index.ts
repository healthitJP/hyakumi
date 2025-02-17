import { OpenAPIHono } from '@hono/zod-openapi'
import { Foods, FoodItemSchema } from './types/Foods'
import { QuerySchema, NutrientsQuerySchema, FoodIdParamSchema } from './validators/queryValidator'
import { filterByTagNames, filterByCategories, filterByWhereConditions } from './utils/filter'
import { sortByNutrient, parseOrderString } from './utils/sort'
import {WhereCondition} from './types/Query'
import {NutritionEnum} from './types/NutritionEnum'
import foodsDataJson from './foods_data.json'
import { FoodsResponseSchema } from './schema/responseSchema'
import { createRoute } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'

const foodsData: Foods = foodsDataJson as Foods

const app = new OpenAPIHono()
const VERSIONTAG = "v1"
const VERSION = "1.0.0"

// ルートへのアクセスを/uiにリダイレクト
app.get('/', (c) => c.redirect('/ui'))

const route = createRoute({
  method: 'get',
  path: `${VERSIONTAG}/foods`,
  summary: "栄養評価のされた食品データのリストを取得する",
  description:"食品データの一覧を取得します。食品データは100gあたりの栄養価が含まれています。\n\n<details><summary>パラメータの説明</summary>\n\n| パラメータ | 型 | 説明 |\n|----------|-----|------|\n| limit | number | 取得件数を指定します。デフォルト値は10です。上限値は100です。 |\n| offset | number | コンテンツを取得開始する位置を、指定した値だけ後ろにずらします。デフォルト値は0です。 |\n| order | string | 取得するコンテンツの並び替えを行います。デフォルトは日本食品標準成分表の順です。並び替え対象とする栄養価タグ名をorders=TAGNAME の形式で指定してください。降順の場合はタグ名の先頭に-を付与。 |\n| nutrients | string | 取得する栄養素を指定します。nutrients=REFUSE,ENERCのようにカンマ区切りで取得したい栄養価タグ名を記載してください。 |\n| category | string | 取得する食べ物の	カテゴリーを指定します。1~18の値をとれます。カンマ区切りで複数指定可能。 |\n| where | string | 栄養の条件を記述します。使える演算子は>もしくは<でAND検索をします。where=REFUSE>20,ENERC<5のように栄養価タグ名を用いた不等式をカンマ区切りで記載します。 |</details>",
  operationId: "getFoodsData",
  request: {
    query: QuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: FoodsResponseSchema,
        },
      },
      description: 'Retrieve foods',
    },
    400: {
      description: 'Error'
    }
  },
})

app.openapi(route, async (c) => {
  try {
    const query = c.req.valid('query')
    let results = foodsData // データソースから取得

    if (query.category) {
      results = filterByCategories(query.category, results)
    }

    if (query.where) {
      // where条件のパースと適用
      const conditions = query.where.map(str => {
        const matches = str.match(/([A-Z_]+)([<>])(\d+)/)
        if (!matches) {
          throw new Error('Invalid where condition format')
        }
        const [_, tag, op, value] = matches
        return { tagName: tag, operator: op, value: Number(value) }
      }) as WhereCondition[]
      results = filterByWhereConditions(conditions, results)
    }

    if (query.nutrients) {
      results = filterByTagNames((query.nutrients as NutritionEnum[]), results)
    }

    if (query.order) {
      const { tagName, isDesc } = parseOrderString(query.order)
      results = sortByNutrient(results, tagName, isDesc)
    }

    const totalCount = results.length
    const offset = query.offset || 0
    const limit = query.limit || 10

    results = results.slice(offset, offset + limit)

    const response = {
      contents: results,
      totalCount,
      offset,
      limit
    }

    return c.json(response)
  } catch (error) {
    return c.json({ error: error }, 400)
  }
})

const singleFoodRoute = createRoute({
  method: 'get',
  path: `${VERSIONTAG}/foods/{foodId}`,
  summary: "指定した食品データを取得する",  
  description:"`foodId` で指定した食品データを取得します。食品データは100gあたりの栄養価が含まれています。\n\n<details><summary>パラメータの説明</summary>\n\n| パラメータ | 型 | 説明 |\n|----------|-----|------|\n| foodId | string | 5桁の食品番号（例：18039） |\n| nutrients | string | 取得する栄養素を指定します。nutrients=REFUSE,ENERCのようにカンマ区切りで取得したい栄養価タグ名を記載してください。 |\n</details>",
  operationId: "getAFoodData",
  request: {
    query: NutrientsQuerySchema,
    params: FoodIdParamSchema
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: FoodItemSchema,
        },
      },
      description: 'Retrieve a single food item',
    },
    404: {
      description: 'Food not found'
    },
    400: {
      description: 'Invalid request'
    }
  },
})

app.openapi(singleFoodRoute, async (c) => {
  try {
    const { foodId } = c.req.valid('param')
    const query = c.req.valid('query')
    
    let food = foodsData.find(food => food.foodId === foodId)
    
    if (!food) {
      return c.json({ error: 'Food not found' }, 404)
    }

    if (query.nutrients) {
      food = {
        ...food,
        nutrients: food.nutrients.filter(nutrient =>
          query.nutrients && query.nutrients.includes(nutrient.tagName)
        )
      }
    }

    return c.json(food)
  } catch (error) {
    return c.json({ error: error }, 400)
  }
})

app.doc(`/doc`, {
  openapi: '3.0.0',
  info: {
    version: VERSION,
    title: 'Hyakumi API',
    description: '百味APIは[日本食品標準成分表（八訂）増補2023年](https://www.mext.go.jp/a_menu/syokuhinseibun/mext_00001.html)のデータに基づき、食品100g当たりに含まれるの栄養成分データを提供します。2400種類以上の食品に対して100種類以上の栄養価のデータを提供しています。また、このAPIは[Yousay](https://ko-fi.com/yousaykonichwa)によって主に日曜日に開発および管理されており、コードの全文は[こちらのリポジトリ](https://github.com/healthitJP/hyakumi)です。提案やご要望、感想は先ほどのリポジトリか[こちら](https://form.typeform.com/to/fdKd5jNw)からお願いします。\n\n#### 🔥このAPIは[炎](https://github.com/honojs)によって動いています。\n<details><summary>🦌API内で扱われる各種分類について</summary>\n\n## 食品群ー一覧\n食品群の分類及び配列は[食品成分表2015年版](https://www.mext.go.jp/a_menu/syokuhinseibun/1365297.htm)を踏襲し、植物性食品、きのこ類、藻類、動物性食品、加工食品の順に並べています。 \n1. 穀類\n2. いも及びでん粉類\n3. 砂糖及び甘味類\n4. 豆類\n5. 種実類\n6. 野菜類\n7. 果実類\n8. きのこ類\n9. 藻類\n10. 魚介類\n11. 肉類\n12. 卵類\n13. 乳類\n14. 油脂類\n15. 菓子類\n16. し好飲料類\n17. 調味料及び香辛料類\n18. 調理済み流通食品類\n\n## 栄養価タグ（FAO/INFOODS）について\n\nFAO/INFOODSは、国際連合食糧農業機関（Food and Agriculture Organization of the United Nations：FAO）が提供するInternational food composition table/database directory(INFOODS)の栄養成分の識別子システムです。\nこのシステムは、食品成分データの国際的な標準化と交換を促進するために使用されています。より多くの識別子については[日本食品標準成分表（八訂）増補2023年](https://www.mext.go.jp/a_menu/syokuhinseibun/mext_00001.html)でご確認ください。\n\n### 主要な栄養価タグ一覧\n\n#### エネルギー・主要栄養素\n| タグ名 | 説明 | 単位 |\n|--------|------|------|\n| ENERC | エネルギー | kJ |\n| ENERC_KCAL | エネルギー | kcal |\n| PROT- | たんぱく質 | g |\n| FAT- | 脂質 | g |\n| CHOCDF- | 炭水化物 | g |\n| FIB- | 食物繊維総量 | g |\n\n#### ビタミン類\n| タグ名 | 説明 | 単位 |\n|--------|------|------|\n| VITA_RAE | ビタミンA | μgRAE |\n| THIA | ビタミンB1 | mg |\n| RIBF | ビタミンB2 | mg |\n| NIA | ナイアシン | mg |\n| VITB6A | ビタミンB6 | mg |\n| VITB12 | ビタミンB12 | μg |\n| VITC | ビタミンC | mg |\n| VITD | ビタミンD | μg |\n| TOCPHA | ビタミンE（α-トコフェロール） | mg |\n| FOL | 葉酸 | μg |\n\n\n#### ミネラル類\n| タグ名 | 説明 | 単位 |\n|--------|------|------|\n| NA | ナトリウム | mg |\n| K | カリウム | mg |\n| CA | カルシウム | mg |\n| MG | マグネシウム | mg |\n| P | リン | mg |\n| FE | 鉄 | mg |\n| ZN | 亜鉛 | mg |\n| CU | 銅 | mg |\n| MN | マンガン | mg |\n| ID | ヨウ素 | μg |\n| SE | セレン | μg |\n| CR | クロム | μg |\n| MO | モリブデン | μg |\n\n#### 脂質関連\n| タグ名 | 説明 | 単位 |\n|--------|------|------|\n| FASAT | 飽和脂肪酸 | g |\n| FAMS | 一価不飽和脂肪酸 | g |\n| FAPU | 多価不飽和脂肪酸 | g |\n| CHOLE | コレステロール | mg |\n\n#### その他\n| タグ名 | 説明 | 単位 |\n|--------|------|------|\n| REFUSE | 廃棄率 | % |\n| WATER | 水分 | g |\n| ASH | 灰分 | g |\n| NACL_EQ | 食塩相当量 | g |\n| ALC | アルコール | g|\n\n注意事項：\n- 各栄養素の値は食品100g当たりの含有量を示します\n- 値が`null`の場合、その栄養素の測定が行われていないことを示します\n- `isTraceAmount: true`の場合、その栄養素が微量（tr）であることを示します\n- `estimated: true`の場合、計算による推定値であることを示します\n\n</details>',
  },
})
app.get(`/ui`, swaggerUI({ url: `/doc` }))
export default app