import * as cors from '@koa/cors' 
import * as bodyparser from 'koa-bodyparser'
import { ApplicationContext, ApplicationModule } from '../types'

/** Module thet handles basic CORS and body parsing for your convenience 🍻 */
const webFramworkModule = (): ApplicationModule => ({ app }: ApplicationContext) => app
	.use(cors())
	.use(bodyparser())

export default webFramworkModule