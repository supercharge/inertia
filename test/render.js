'use strict'

const Koa = require('koa')
const Supertest = require('supertest')
const { test } = require('@japa/runner')
const { HttpContext } = require('@supercharge/http')
const { setup } = require('./helpers/setup')

test.group('InertiaServiceProvider', () => {
  test('register inertia service provider', async () => {
    const app = await setup()

    const server = new Koa().use(ctx => {
      const { response } = HttpContext.wrap(ctx, app)

      return response.inertia().render('Users/List', {
        users: [{ name: 'Marcus' }]
      })
    })

    await Supertest(server.callback())
      .get('/')
      .expect(200)
  })
})
