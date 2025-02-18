import { z } from '@hono/zod-openapi'
import { NutritionEnum } from '../types/NutritionEnum'

export const QuerySchema = z.object({
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100).default(10)).optional()
  .openapi({
    example: '10',
    description: '取得件数を指定します。デフォルト値は10です。上限値は100です。',
  }),
  offset: z.string().transform(Number).pipe(z.number().min(0).default(0)).optional()
  .openapi({
    example: '0',
    description: 'コンテンツを取得開始する位置を、指定した値だけ後ろにずらします。デフォルト値は0です。',
  }),
  order: z.string().optional()
  .openapi({
    example: 'ENERC_KCAL',
    description: '取得するコンテンツの並び替えを行います。デフォルトは日本食品標準成分表の順です。\n並び替え対象とする栄養素タグ名をorder=TAGNAME の形式で指定してください。そのタグの値で並び替えられます。\nまた、降順を指定する場合はタグ名の先頭に -（マイナス） を付与してください。\nnullの値が設定されているコンテンツは最後に並べられます。\n指定可能な並び順について\n栄養素の量によって並び替えられます。',
  }),
  nutrients: z.string()
    .transform(str => str.split(','))
    .refine(arr => arr.every(tag => Object.values(NutritionEnum).includes(tag as NutritionEnum)))
    .optional()
    .openapi({
      example: 'ENERC_KCAL,PROT-,FAT-,CHOCDF-,FIB-,WATER,NACL_EQ,ALC',
      description: '取得する栄養素を指定します。nutrients=REFUSE,ENERCのようにカンマ区切りで値を記載してください。',
    }),
  category: z.string()
    .transform(str => str.split(',').map(Number))
    .refine(arr => arr.every(num => num >= 1 && num <= 18))
    .optional()
    .openapi({
      example: '1,3',
      description: '取得する食べ物のcategoryを指定します。1~18の値をとれます。\nnutrients=1,03のようにカンマ区切りで値を記載してください。\nデフォルトではすべてのカテゴリが表示されます。\n対応は以下の通り\n1 穀類 2 いも及びでん粉類 70 3 砂糖及び甘味類 4 豆類 5 種実類 6 野菜類 7 果実類 8 きのこ類 9 藻類 10 魚介類 11 肉類 12 卵類 13 乳類 14 油脂類 15 菓子類 16 し好飲料類 17 調味料及び香辛料類 18 調理済み流通食品類 ',
    }),
  where: z.string()
    .transform(str => str.split(','))
    .refine(arr => arr.every(condition => {
      const matches = condition.match(/([A-Z_]+)([<>])(\d+)/)
      if (!matches) return false
      const [_, tag, op, value] = matches
      return tag && Object.keys(NutritionEnum).includes(tag) && 
             (op === '<' || op === '>') && 
             !isNaN(Number(value))
    }))
    .optional()
    .openapi({
      example: 'WATER>20,ENERC_KCAL<150',
      description: '栄養の条件を記述します。使える演算子は>か<でAND検索します。\nwhere=REFUSE>20,ENERC<5のようにカンマ区切りで値を記載してください。',
    }),
  foodName: z.string().optional()
    .openapi({
      example: '米',
      description: '食品名で検索します。部分一致で検索されます。',
    }),
})

export const NutrientsQuerySchema = z.object({
  nutrients: z.string()
    .transform(str => str.split(','))
    .refine(arr => arr.every(tag => Object.values(NutritionEnum).includes(tag as NutritionEnum)))
    .optional()
    .openapi({
      example: 'ENERC_KCAL,PROT-,FAT-,CHOCDF-,FIB-,WATER,NACL_EQ,ALC',
      description: '取得する栄養素を指定します。nutrients=REFUSE,ENERCのようにカンマ区切りで値を記載してください。',
    }),
})

export const FoodIdParamSchema = z.object({
  foodId: z.string()
    .regex(/^\d{5}$/)
    .openapi({
      example: '18039',
      description: '食品番号（5桁の数字）'
    })
})