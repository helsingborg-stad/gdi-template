import { makeExecutableSchema } from '@graphql-tools/schema'
import { graphql } from 'graphql'
import { mapValues } from '../util'
import { GQLEndpoint, GQLEndpointArgs, GQLModule } from './types'

/** create endpoint function that given parameters resolves against a GraphQL module  */
export function makeGqlEndpoint<TContext = any, TModel = any>({ schema, resolvers }: GQLModule<TContext, TModel>): GQLEndpoint<TContext, TModel> {
	const es = makeExecutableSchema({
		typeDefs:schema,
		// wrap resolver going from indexed arguments to parameter object
		resolvers: mapValues(
			resolvers,
			entity => mapValues(entity, resolver => (source, args, ctx, info) => resolver({ source, ctx, args, info }))),
	})

	return ({ context, model, query, variables }: GQLEndpointArgs<TContext, TModel>) => graphql({
		schema: es,
		source: query,
		rootValue: model,
		contextValue: context,
		variableValues: variables,
	})
}
