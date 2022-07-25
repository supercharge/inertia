'use strict'

const Koa = require('koa')
const Supertest = require('supertest')
const { test } = require('@japa/runner')
const { createApp: setupApp } = require('./helpers')
const { HttpContext } = require('@supercharge/http')

test.group('InertiaServiceProvider', () => {
  test('register inertia service provider', async () => {
    const app = await setupApp()

    const server = new Koa().use(ctx => {
      const { response } = HttpContext.wrap(ctx, app)

      return response.inertia().render('Users/List', {
        users: [{ name: 'Marcus' }]
      })
    })

    await Supertest(server.callback())
      .get('/')
      .expect(200)
  }).skip()
})
