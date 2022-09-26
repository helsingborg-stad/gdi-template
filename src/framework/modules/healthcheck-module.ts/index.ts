import { ApplicationModule } from '../../types'

/** Module for the healthCheck operation (which should be described in our openapi spec) */
export const healthCheckModule = (checkHealth?: ((namespace: string) => Promise<any> | any )): ApplicationModule => ({ registerKoaApi }) => registerKoaApi({
	healthCheck: async ctx => {
		const { params: { namespace } } = ctx
		const hc = await checkHealth?.(namespace)

		ctx.body = {
			status: 'ok',
			namespace,
			...hc,
		}
	},
})