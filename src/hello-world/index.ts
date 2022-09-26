import { makeGqlEndpoint } from '../framework/gql/make-gql-endpoint'
import { makeGqlMiddleware } from '../framework/gql/make-gql-middleware'
import { GQLModule } from '../framework/gql/types'
import { requireJwtUser } from '../framework/modules/jwt-user-module'
import { ApplicationContext, ApplicationModule } from '../framework/types'

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
