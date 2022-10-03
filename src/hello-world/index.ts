import { makeGqlEndpoint, makeGqlMiddleware } from '@helsingborg-stad/gdi-api-node/gql'
import { GQLModule } from '@helsingborg-stad/gdi-api-node/gql/types'
import { requireJwtUser } from '@helsingborg-stad/gdi-api-node/modules/jwt-user'
import { ApplicationContext, ApplicationModule } from '@helsingborg-stad/gdi-api-node/types'

const createHelloWorldModule = (): GQLModule => ({
	schema: `
        type Hello {
            world: String,
        }
        type Query {
            hello: Hello
        }
        `,
	resolvers: {
		Query: {
			// https://www.graphql-tools.com/docs/resolvers
			hello: ({ ctx: { user } }) => {
				return {
					world: `Hello ${user.id}`,
				}
			},
		},
	},
})

const helloWorldModule = (): ApplicationModule => ({ registerKoaApi }: ApplicationContext) => registerKoaApi({
	helloWorldGQL: requireJwtUser(makeGqlMiddleware(makeGqlEndpoint(createHelloWorldModule()))),
})

export default helloWorldModule
