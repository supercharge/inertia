'use strict'

const { Application } = require('@supercharge/application')

const app = Application.createWithAppRoot(__dirname)

/**
 * Returns booted application.
 *
 * @returns {Application}
 */
async function setup () {
  await app.boot()

  return app
}

module.exports = {
  setup
}
