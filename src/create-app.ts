import { createApplication } from './framework'
import { healthCheckModule } from './framework/modules/healthcheck-module.ts'
import { jwtUserModule } from './framework/modules/jwt-user-module'
import swaggerModule from './framework/modules/swagger-module'
import webFrameworkModule from './framework/modules/web-framework-module'
import { Application } from './framework/types'
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

