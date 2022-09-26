export interface GQLModule<TContext = any, TModel = any> {
    schema: string
    resolvers: ResolverMap<TContext, TModel> // | ResolverMap<TContext, TModel>[]
}
// obj, args, context, info
// https://www.graphql-tools.com/docs/resolvers

// We stray away from resolver functions as defined in https://www.graphql-tools.com/docs/resolvers
// and move from
//      resolver(obj, args, context, info)
// to
//      resolver({source, ctx, args, info})

// export type ResolverFn<TContext, TModel> = (source?: TModel, args?: any, context?: TContext, info?: any) => any
export type ResolverFn<TContext, TModel> = ({source, ctx, args, info}: {source?: TModel, args?: any, ctx?: TContext, info?: any}) => any
export type ResolverMap<TContext, TModel> = Record<string, Record<string, ResolverFn<TContext, TModel>>>

export type GQLEndpointArgs<TContext, TModel> = {
    context?: TContext, 
    model?: TModel, 
    query: string, 
    variables: Record<string, any>
}

export type GQLEndpoint<TContext, TModel> = (args: GQLEndpointArgs<TContext, TModel>) => Promise<any>
