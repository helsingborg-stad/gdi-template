import { createAuthorizationServiceFromEnv } from './framework/services/authorization-service'
import { Services } from './types'


const createServicesFromEnv = (): Services => ({
	authorization: createAuthorizationServiceFromEnv(),
})

export { createServicesFromEnv }