'use strict'

const Path = require('path')
const { InertiaServiceProvider } = require('../../dist')
const { HttpServiceProvider } = require('@supercharge/http')
const { Application, ErrorHandler } = require('@supercharge/core')

/**
 * Returns a test application.
 *
 * @param {import('../../dist').InertiaOptions} [inertiaConfig]
 *
 * @returns {Promise<Application>}
 */
exports.createApp = function makeApp (inertiaConfig = {}) {
  const app = Application
    .createWithAppRoot(Path.resolve(__dirname))
    .withErrorHandler(ErrorHandler)

  app.bind('view', () => viewMock)

  app.config()
    .set('app.key', 'app-key-1234')
    .set('inertia', {
      view: 'inertia',
      version: '1.0.0',
      ...inertiaConfig
    })

  return app
    .register(new HttpServiceProvider(app))
    .register(new InertiaServiceProvider(app))
}

const viewMock = {
  render () {
    return '<h1>error-view</h1>'
  },
  exists (view) {
    return view === 'errors/401'
  }
}
