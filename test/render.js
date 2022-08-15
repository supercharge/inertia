'use strict'

const { expect } = require('expect')
const Supertest = require('supertest')
const { test } = require('@japa/runner')
const { createApp } = require('./helpers')
const { Server } = require('@supercharge/http')

test.group('Inertia render response', () => {
  test('fails when not providing a component name', async () => {
    const app = await createApp()
    const server = new Server(app)

    server.use(({ response }) => {
      return response.inertia().render()
    })

    const response = await Supertest(server.callback())
      .get('/')
      .expect(500)

    expect(response.body).toMatchObject({
      statusCode: 500,
      message: 'Missing component name when calling "response.inertia().render(<component>)"'
    })
  })

  test('returns HTML on initial request', async () => {
    const app = await createApp()
    const server = new Server(app)

    server.use(({ response }) => {
      return response.inertia().render('Users/List', {
        users: [{ name: 'Marcus' }]
      })
    })

    const response = await Supertest(server.callback())
      .get('/')
      .expect(200)

    expect(response.text).toEqual(`<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Supercharge Inertia</title>
    </head>
    <body>
        <div id="app" data-page="{&quot;component&quot;:&quot;Users/List&quot;,&quot;props&quot;:{&quot;users&quot;:[{&quot;name&quot;:&quot;Marcus&quot;}]},&quot;version&quot;:&quot;1.0.0&quot;,&quot;url&quot;:&quot;/&quot;}"></div>
    </body>
    </html>
`)
  })

  test('returns JSON on subsequent request', async () => {
    const app = await createApp()
    const server = new Server(app)

    server.use(({ response }) => {
      return response.inertia().render('Users/List', {
        users: [{ name: 'Marcus' }]
      })
    })

    const response = await Supertest(server.callback())
      .get('/')
      .set('X-Inertia', 'true')
      .set('X-Inertia-Version', '1.0.0')
      .expect(200)

    expect(response.body).toEqual({
      component: 'Users/List',
      props: { users: [{ name: 'Marcus' }] },
      version: '1.0.0',
      url: '/'
    })
  })

  test('returns the URL with query parameters', async () => {
    const app = await createApp()
    const server = new Server(app)

    server.use(({ response }) => {
      return response.inertia().render('Users/List', { users: [] })
    })

    const response = await Supertest(server.callback())
      .get('/some/path?with=query&parameters=foo')
      .set('X-Inertia', 'true')
      .set('X-Inertia-Version', '1.0.0')
      .expect(200)

    expect(response.body).toEqual({
      component: 'Users/List',
      props: { users: [] },
      version: '1.0.0',
      url: '/some/path?with=query&parameters=foo'
    })
  })

  test('defaults to an empty props object', async () => {
    const app = await createApp()
    const server = new Server(app)

    server.use(({ response }) => {
      return response.inertia().render('Users/List')
    })

    const response = await Supertest(server.callback())
      .get('/some/path?foo=bar')
      .set('X-Inertia', 'true')
      .set('X-Inertia-Version', '1.0.0')
      .expect(200)

    expect(response.body).toEqual({
      component: 'Users/List',
      props: {},
      version: '1.0.0',
      url: '/some/path?foo=bar'
    })
  })
})
