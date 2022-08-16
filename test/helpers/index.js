'use strict'

const Path = require('path')
const { InertiaServiceProvider } = require('../../dist')
const { HttpServiceProvider } = require('@supercharge/http')
const { ViewServiceProvider } = require('@supercharge/view')
const { Application, ErrorHandler } = require('@supercharge/core')

/**
 * Returns a test application.
 *
 * @param {import('../../dist').InertiaOptions} [inertiaConfig]
 *
 * @returns {Application}
 */
function createApp (inertiaConfig = {}) {
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

  return app
    .register(new ViewServiceProvider(app))
    .register(new HttpServiceProvider(app))
    .register(new InertiaServiceProvider(app))
}

/**
 * Returns a test application with Inertia SSR enabled.
 *
 * @param {import('../../dist').InertiaOptions} [inertiaSsrConfig]
 *
 * @returns {Application}
 */
function createSsrApp (inertiaSsrConfig = {}) {
  return createApp({
    ssr: {
      enabled: true,
      ...inertiaSsrConfig
    }
  })
}

module.exports = {
  createApp,
  createSsrApp
}
