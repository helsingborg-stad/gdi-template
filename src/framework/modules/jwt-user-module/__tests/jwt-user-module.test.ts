import * as request from 'supertest'
import { createApplication } from '../../../application'
import { AuthorizationService, createAuthorizationService } from '../../../services/authorization-service'
import { jwtUserModule } from '..'
import { StatusCodes } from 'http-status-codes'

const createTestApp = (authorization: AuthorizationService) => createApplication({
	openApiDefinitionPath: './openapi.yml',
	validateResponse: true,
})
	.use(jwtUserModule(authorization))

describe('jwt-user-module', () => {
	it('ignores apa', async () => createTestApp(createAuthorizationService('test shared secret')).run(
		async server => {
			const { status } = await request(server)
				.get('/some/page/it/can/be/anyone/actally')
				.set('Authorization', 'Bearer apa')
			expect(status).toBe(StatusCodes.UNAUTHORIZED)
		}))
})