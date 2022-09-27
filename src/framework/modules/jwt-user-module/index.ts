import { StatusCodes } from 'http-status-codes'
import * as Koa from 'koa'
import { AuthorizationService } from '../../services/authorization-service'
import { ApplicationContext, ApplicationModule } from '../../types'
import { getTokenFromAuthorizationHeader } from './get-token-from-authorization-header'

/** Module that updates __ctx.user__ with payload extracted from JWT bearer token, if present in request headers */
export const jwtUserModule = (authorization: AuthorizationService): ApplicationModule => ({ app }: ApplicationContext) => app.use(async (ctx, next) => {
	ctx.user = ctx.user || authorization.tryGetUserFromJwt(getTokenFromAuthorizationHeader(ctx.headers))
	return next()
})

/** Koa middleware that prevent futher processing if __user__ is not present in Koa context */
export const requireJwtUser = (mv: Koa.Middleware): Koa.Middleware => (ctx, next) => ctx.user ? mv(ctx, next) : ctx.throw(StatusCodes.UNAUTHORIZED)
