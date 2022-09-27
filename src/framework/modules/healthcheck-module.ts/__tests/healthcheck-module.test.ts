import { StatusCodes } from 'http-status-codes'
import * as request from 'supertest'
import { healthCheckModule } from '..'
import { createApplication } from '../../../application'
import swaggerModule from '../../swagger-module'
import webFrameworkModule from '../../web-framework-module'

const createTestApp = () => createApplication({
	openApiDefinitionPath: './openapi.yml',
	validateResponse: true,
})
	.use(webFrameworkModule())
	.use(swaggerModule())


describe('GET /api/v1/{api-namespace-name}/healthcheck', () => {
	it('gives HTTP 200 OK by default', () => createTestApp()
		.use(healthCheckModule())
		.run(async server => {
			const { status } = await request(server)
				.get('/api/v1/my-actual-api-namespace/healthcheck')
			expect(status).toBe(StatusCodes.OK)
		})
	)
	it('can be configured with custom logic', () => createTestApp()
		.use(healthCheckModule(() => ({ message: 'It\'s all good' })))
		.run(async server => {
			const { status, body } = await request(server)
				.get('/api/v1/my-actual-api-namespace/healthcheck')
			expect(status).toBe(StatusCodes.OK)
			expect(body).toMatchObject({
				status: 'ok',
				namespace: 'my-actual-api-namespace',
				message: 'It\'s all good',
			})
		})
	)
})