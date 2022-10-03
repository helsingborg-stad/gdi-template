import { createApplication } from '@helsingborg-stad/gdi-api-node'
import healthCheckModule from '@helsingborg-stad/gdi-api-node/modules/healthcheck'
import jwtUserModule from '@helsingborg-stad/gdi-api-node/modules/jwt-user'
import swaggerModule from '@helsingborg-stad/gdi-api-node/modules/swagger'
import webFrameworkModule from '@helsingborg-stad/gdi-api-node/modules/web-framework'
import { Application } from '@helsingborg-stad/gdi-api-node/types'
import helloWorldModule from './hello-world'
import { Services } from './types'

/** Create fully packaged web application, given dependencies */
export const createApp = ({ services, validateResponse }: {services: Services, validateResponse?: boolean}): Application =>
	createApplication({
		openApiDefinitionPath: './openapi.yml',
		validateResponse,
	})
		.use(webFrameworkModule())
		.use(swaggerModule())
		.use(jwtUserModule(services.authorization))
		.use(healthCheckModule())
		.use(helloWorldModule())
		// TODO: add application module here

