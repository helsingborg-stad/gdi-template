import * as jwt from 'jsonwebtoken'
import * as createError from 'http-errors'
import { getEnv } from '../get-env'

export interface AuthorizationService {
    /**
     * Given a JWT, if not null/empty, 
     * extract user from payload.
     * 
     * Should throw if JWT validation fails
     */
    tryGetUserFromJwt: (token: string) => any
}

/**
 * Recognize JWT exceptions and map them to http 401 exceptions
 * 
 */
const mapErrors = <T>(fn: () => T): T => {
	try {
		return fn()
	}
	catch (err) {
		if (err instanceof jwt.JsonWebTokenError) {
			throw createError(401, err)
		}
		throw err
	}
}

export const createAuthorizationService = (sharedSecret: string): AuthorizationService => ({
	tryGetUserFromJwt: token => mapErrors(() => token ? jwt.verify(token, sharedSecret, { complete: true })?.payload : null),
})

export const createAuthorizationServiceFromEnv = () => createAuthorizationService(getEnv('JWT_SHARED_SECRET'))
