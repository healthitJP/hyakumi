import { Hono } from 'hono'
import { Foods } from './types/Foods'
import { QuerySchema } from './validators/queryValidator'
import { filterByTagNames, filterByCategories, filterByWhereConditions } from './utils/filter'
import { sortByNutrient, parseOrderString } from './utils/sort'
import {WhereCondition} from './types/Query'
import {NutritionEnum} from './types/NutritionEnum'
import foodsDataJson from './foods_data.json'

const foodsData: Foods = foodsDataJson as Foods

const app = new Hono()

app.get('/foods', async (c) => {
  try {
    const query = QuerySchema.parse(c.req.query())
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

    if (query.orders) {
      for (const order of query.orders) {
        const { tagName, isDesc } = parseOrderString(order)
        results = sortByNutrient(results, tagName, isDesc)
      }
    }

    const totalCount = results.length
    const offset = query.offset || 0
    const limit = query.limit || 10

    results = results.slice(offset, offset + limit)

    return c.json({
      contents: results,
      totalCount,
      offset,
      limit
    })
  } catch (error) {
    return c.json({ error: error }, 400)
  }
})


export default app