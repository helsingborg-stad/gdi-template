import OpenAPIBackend from 'openapi-backend'
import * as Router from 'koa-router'
import * as Koa from 'koa'
import { Server } from 'node:http'

export interface ApplicationContext {
    app: Koa,
    api: OpenAPIBackend,
    router: typeof Router,
    application: Application,
    registerKoaApi: (handlers: Record<string, Koa.Middleware>) => void
}

export type ApplicationModule = (context: ApplicationContext) => void

export interface Application {
    getContext(): ApplicationContext
    use(module: ApplicationModule): Application
    start(port: number|string): Promise<Server>
    run(handler: ((server: Server) => Promise<any>), port?: number): Promise<void>
}
