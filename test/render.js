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

    app.config()
      .set('http.port', 1234)
      .set('http.host', 'localhost')

    await server.start()

    const response = await Supertest(server.startedServer())
      .get('/')
      .expect(200)

    await server.stop()

    expect(response.text).toEqual(`<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Supercharge Inertia</title>
    </head>
    <body>
      <div id="app" data-page="{&quot;component&quot;:&quot;Users/List&quot;,&quot;props&quot;:{&quot;users&quot;:[{&quot;name&quot;:&quot;Marcus&quot;}]},&quot;version&quot;:&quot;1.0.0&quot;,&quot;url&quot;:&quot;http://127.0.0.1:1234/&quot;}"></div>    </body>
    </html>
`)
  })
})
