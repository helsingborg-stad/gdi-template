import * as Debug from 'debug'
const debug = Debug('application')
import * as Koa from 'koa'
import * as Router from 'koa-router'
import OpenAPIBackend, { Context } from 'openapi-backend'

import { Application, ApplicationModule } from './types'
import { mapValues } from './util'

const TEST_PORT = 4444

interface CreateApplicationArgs {
	openApiDefinitionPath: string,
	validateResponse?: boolean
}

// simple memoization - at most one evaluation, evalauation as late as possible
const ensureOnce = <T>(fn: (() => Promise<T>)): (() => Promise<T>) => {
	let value: Promise<T> | null = null
	return async () => {
		if (!value) {
			value = fn()
		}
		return value
	}
}

const performResponseValidation = (c: Context, ctx: Koa.Context) => {
	/**
	 * Perform response validation
	 * 
	 * Typically, this is done in tests only
	 * 
	 * To make life simpler, we only validate 2xx results
	 * Also, header validation is probably not needed
	 */
	const { status } = ctx
	if (!((status >= 200) && (status < 300))) {
		return
	}
	// https://github.com/anttiviljami/openapi-backend#response-validation
	([
		c.api.validateResponse(ctx.body, c.operation),
		/*
		c.api.validateResponseHeaders(ctx.headers, c.operation, {
			statusCode: ctx.status,
			setMatchType: SetMatchType.Superset,
		}),
		*/
	])
		.map(({ errors }) => errors)
		.filter(errors => errors && errors.length)
		.map(errors => {
			debug({
				body: ctx.body,
				operation: c.operation,
				errors,
			})
			ctx.throw(502)
		})
}
	
/**
 * ### createWebApplication 
 * create web application by wrapping with reasonable defaults
 * -  Koa web application
 * - routing
 * - openapi
 * 	- with default request validation
 * - with optional response validation
 */
export function createApplication({ openApiDefinitionPath, validateResponse }: CreateApplicationArgs): Application {
	// create app
	const app = new Koa()
	// create API backend
	const api = new OpenAPIBackend({ definition: openApiDefinitionPath })
	// create routes
	const router = new Router()

	// setup reasonable defaults
	api.register({
		// https://github.com/anttiviljami/openapi-backend#quick-start
		notFound: (c, ctx) => ctx.throw(404),
		validationFail: (c, ctx) => {
			ctx.body = { errors: c.validation.errors }
			ctx.status = 400
		},
	})
	
	// register response validation if wanted
	api.register({
		postResponseHandler: async (c, ctx) => {
			// turn off all caching of all API responses
			ctx.set('Cache-Control', 'no-store')
			return validateResponse && performResponseValidation(c, ctx)
		},
	})

	const init = ensureOnce(async () => {
		// finalize api
		await api.init()
		return app
		// wire all custom routes
			.use(router.routes())
			.use(router.allowedMethods())
		// wire in API endpoints
			.use((ctx, next) => api.handleRequest(ctx.request, ctx, next))					
	})

	return {
		getContext() {
			return {
				app,
				router,
				api,
				application: this,
				registerKoaApi: handlers => api.register(mapValues(handlers, handler => (c, ctx, next) => {
					// we copy params manually to be compatible with 
					// libraries such as https://github.com/koajs/router/blob/master/API.md#url-parameters
					// In short, openapi path parameters are parsed and made visible in koa context 
					ctx.params = c.request.params
					handler(ctx, next)
				})),
			}
		}, 
		use(module: ApplicationModule) {
			module(this.getContext())
			return this
		},
		async start(port) {
			return (await init())
				.listen(port, () => debug(`Server listening to port ${port}`))
		},
		async run(handler, port = TEST_PORT) {
			const server = await this.start(port)
			try {
				await handler(server)
			} finally {
				await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve(null)))
			}
		},
	}
} 