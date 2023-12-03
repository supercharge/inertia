'use strict'

import Path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ViewServiceProvider } from '@supercharge/view'
import { InertiaServiceProvider } from '../../dist/index.js'
import { Application, ErrorHandler } from '@supercharge/core'
import { HttpServiceProvider, Server } from '@supercharge/http'

const __dirname = Path.dirname(fileURLToPath(import.meta.url))

/**
 * Returns a test application.
 *
 * @param {import('../../dist').InertiaOptions} [inertiaConfig]
 *
 * @returns {Promise<Application>}
 */
export async function createApp (inertiaConfig = {}) {
  const app = Application
    .createWithAppRoot(Path.resolve(__dirname))
    .withErrorHandler(ErrorHandler)

  app.config()
    .set('app.key', 'app-key-1234')
    .set('inertia', {
      view: 'inertia',
      version: '1.0.0',
      ...inertiaConfig
    })
    .set('view', {
      driver: 'handlebars',
      handlebars: {
        views: app.resourcePath('views'),
        partials: app.resourcePath('views/partials'),
        helpers: app.resourcePath('views/helpers'),
        layouts: app.resourcePath('views/layouts'),
        defaultLayout: 'app'
      }
    })

  await app
    .register(new ViewServiceProvider(app))
    .register(new HttpServiceProvider(app))
    .register(new InertiaServiceProvider(app))
    .boot()

  return app
}

/**
 * Returns a test application with Inertia SSR enabled.
 *
 * @param {import('../../dist').InertiaOptions} [inertiaSsrConfig]
 *
 * @returns {Promise<Application>}
 */
export async function createSsrApp (inertiaSsrConfig = {}) {
  return await createApp({
    ssr: {
      enabled: true,
      ...inertiaSsrConfig
    }
  })
}

/**
 * @param {Application} app
 */
export function createServer (app) {
  return new Server(
    app,
    app.config().get('app', {}),
    app.config().get('http', {})
  )
}
