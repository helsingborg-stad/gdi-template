import * as Koa from 'koa'
import * as Debug from 'debug'
import { GQLEndpoint } from './types'

const debug = Debug('application:gql-middleware')

/** Create Koa middleware that executes given GraphQL endpoint, passing {query, variables} */
export function makeGqlMiddleware<TContext, TModel>(
	endpoint: GQLEndpoint<TContext, TModel>,
	{
		mapQuery = q => q,
		mapVariables = v => v,
	}: {
        mapQuery?: (q: any) => any,
        mapVariables?: (q: any) => any
    } = {}
): Koa.Middleware {
	debug('creating middleware')
	return async ctx => {
		const { request: { body: { query, variables } } } = ctx as any
		const result = await endpoint({
			context: ctx as TContext,
			query: mapQuery(query),
			variables: mapVariables(variables),
		})
		ctx.body = result
	}
}