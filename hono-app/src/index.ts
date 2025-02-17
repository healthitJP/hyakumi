import { OpenAPIHono } from '@hono/zod-openapi'
import { Foods } from './types/Foods'
import { QuerySchema } from './validators/queryValidator'
import { filterByTagNames, filterByCategories, filterByWhereConditions } from './utils/filter'
import { sortByNutrient, parseOrderString } from './utils/sort'
import {WhereCondition} from './types/Query'
import {NutritionEnum} from './types/NutritionEnum'
import foodsDataJson from './foods_data.json'
import { FoodsResponseSchema } from './schema/responseSchema'
import { createRoute } from '@hono/zod-openapi'
import { z } from '@hono/zod-openapi'

const foodsData: Foods = foodsDataJson as Foods

const app = new OpenAPIHono()

const route = createRoute({
  method: 'get',
  path: '/foods',
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

app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'My Foods API',
  },
})

export default app