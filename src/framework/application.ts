import * as Debug from 'debug'
import { StatusCodes } from 'http-status-codes'
const debug = Debug('application')
import * as Koa from 'koa'
import * as Router from 'koa-router'
import OpenAPIBackend, { Context, Handler, ValidationResult } from 'openapi-backend'

import { Application, ApplicationModule } from './types'
import { mapValues } from './util'

const TEST_PORT = 4444

interface CreateApplicationArgs {
	openApiDefinitionPath: string,
	validateResponse?: boolean
}

/**  simple memoization - at most one evaluation, evalauation as late as possible */
const ensureOnce = <T>(fn: (() => Promise<T>)): (() => Promise<T>) => {
	let value: Promise<T> | null = null
	return async () => {
		if (!value) {
			value = fn()
		}
		return value
	}
}

const convertKoaMiddlewareToOpenAPIBackenHandler = (koaMiddleware: Koa.Middleware): Handler => (c, ctx, next) => {
	// we copy params manually to be compatible with 
	// libraries such as https://github.com/koajs/router/blob/master/API.md#url-parameters
	// In short, openapi path parameters are parsed and made visible in koa context 
	ctx.params = c.request.params
	return koaMiddleware(ctx, next)
}

const isNumberInRange = (number: number, min: number, max: number): boolean => (number >= min) && (number <= max)

const throwOnValidationErrors = (c: Context, ctx: Koa.Context, ...validationResults: ValidationResult[]) => validationResults
	.filter(r => r)
	.map(({ errors }) => errors)
	.filter(errors => errors && errors.length)
	.map(errors => {
		debug({
			body: ctx.body,
			operation: c.operation,
			errors,
		})
		ctx.throw(StatusCodes.BAD_GATEWAY)
	})

/**
 * Perform response validation
 * 
 * Typically, this is done in tests only
 * 
 * To make life simpler, we only validate 2xx results
 * Response ody is validated bu response headers are not...
 */
const performResponseValidation = (c: Context, ctx: Koa.Context) => {
	const { status } = ctx
	isNumberInRange(status, 200, 299) && throwOnValidationErrors(c, ctx, c.api.validateResponse(ctx.body, c.operation))
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
		notFound: (c, ctx) => ctx.throw(StatusCodes.NOT_FOUND),
		validationFail: (c, ctx) => {
			ctx.body = { errors: c.validation.errors }
			ctx.status = StatusCodes.BAD_REQUEST
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
				registerKoaApi: handlers => api.register(mapValues(handlers, convertKoaMiddlewareToOpenAPIBackenHandler)),
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