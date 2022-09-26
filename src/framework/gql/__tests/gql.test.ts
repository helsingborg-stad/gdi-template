import * as jwt from 'jsonwebtoken'
import * as request from 'supertest'
import { createTestApp } from './test-app'
import { StatusCodes } from 'http-status-codes'

const TEST_SHARED_SECRET = 'shared secret for test'

const createAuthorizationHeadersFor = (id: string, secret: string = TEST_SHARED_SECRET) => ({
	authorization: `Bearer ${jwt.sign({ id }, secret)}`,
})

describe('GraphQL', () => {
	it('POST /api/v1/test/graphql validates parameters ({query, variables} = body)', () => createTestApp(TEST_SHARED_SECRET)
		.run(async server => {
			const { status, body: { data } } = await request(server)
				.post('/api/v1/test/graphql')
				.set(createAuthorizationHeadersFor('test-person-id-123'))
				.send({
					query: `
                        query TestQuery {
                            testData {
                                idFromToken
                            }
                        }`,
					variables: {},

				})
			expect(status).toBe(StatusCodes.OK)
			expect(data).toMatchObject({
				testData: {
					idFromToken: 'test-person-id-123',
				},
			})
		}))

	it('POST /api/v1/test/graphql validates parameters ({query, variables} = body)', () => createTestApp(TEST_SHARED_SECRET)
		.run(async server => {
			const { status } = await request(server)
				.post('/api/v1/test/graphql')
				.set(createAuthorizationHeadersFor('test-person-id-123'))
				.send({ 'the-body-is': 'missing query and variables' })
                
			expect(status).toBe(StatusCodes.BAD_REQUEST)
		}))

	it('POST /api/v1/test/graphql requires valid authorization header', () => createTestApp(TEST_SHARED_SECRET)
		.run(async server => {
			const { status } = await request(server)
				.post('/api/v1/test/graphql')
                
				.send({ query: 'a', variables: {} })
                
			expect(status).toBe(StatusCodes.UNAUTHORIZED)
		}))
})


 