import path = require('path');
import { createApplication } from '../../../application'
import { jwtUserModule } from '../../../modules/jwt-user-module'
import swaggerModule from '../../../modules/swagger-module'
import webFrameworkModule from '../../../modules/web-framework-module'
import { createAuthorizationService } from '../../../services/authorization-service'
import { Application } from '../../../types'
import testGqlModule from './test-gql-module'

const createTestApp = (sharedSecret: string): Application => createApplication({
	openApiDefinitionPath: path.join(__dirname, './test-app.openapi.yml'),
	validateResponse: true,
})
	.use(webFrameworkModule())
	.use(swaggerModule())
	.use(jwtUserModule(createAuthorizationService(sharedSecret)))
	.use(testGqlModule())


export { createTestApp }