'use strict'

import { test } from 'uvu'
import { expect } from 'expect'
import Supertest from 'supertest'
import { createApp, createServer } from './helpers/index.js'

test('fails when not providing a component name', async () => {
  const app = await createApp()
  const server = createServer(app)

  server.use(({ response }) => {
    return response.inertia().render()
  })

  const response = await Supertest(server.callback())
    .get('/')
    .set('accept', 'application/json')
    .expect(500)

  expect(response.body).toMatchObject({
    statusCode: 500,
    message: 'Missing component name when calling "response.inertia().render(<component>)"'
  })
})

test('returns HTML on initial request', async () => {
  const app = await createApp()
  const server = createServer(app)

  server.use(({ response }) => {
    return response.inertia().render('Users/List', {
      users: [{ name: 'Supercharge' }]
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
        <div id="app" data-page="{&quot;component&quot;:&quot;Users/List&quot;,&quot;props&quot;:{&quot;users&quot;:[{&quot;name&quot;:&quot;Supercharge&quot;}]},&quot;version&quot;:&quot;1.0.0&quot;,&quot;url&quot;:&quot;/&quot;}"></div>
    </body>
  </html>
`)
})

test('returns JSON on subsequent request', async () => {
  const app = await createApp()
  const server = createServer(app)

  server.use(({ response }) => {
    return response.inertia().render('Users/List', {
      users: [{ name: 'Supercharge' }]
    })
  })

  const response = await Supertest(server.callback())
    .get('/')
    .set('X-Inertia', 'true')
    .set('X-Inertia-Version', '1.0.0')
    .expect(200)

  expect(response.body).toEqual({
    component: 'Users/List',
    props: { users: [{ name: 'Supercharge' }] },
    version: '1.0.0',
    url: '/'
  })
})

test('returns the URL with query parameters', async () => {
  const app = await createApp()
  const server = createServer(app)

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
  const server = createServer(app)

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

test('resolves lazy props', async () => {
  const app = await createApp()
  const server = createServer(app)

  server.use(({ response }) => {
    return response.inertia().render('Users/List', {
      users: () => [{ name: 'Supercharge' }],
      name: async () => {
        return await new Promise(resolve => {
          setTimeout(resolve('Supercharge'), 10)
        })
      },
      nested: {
        users: () => [{ name: 'Supercharge' }],
        name: async () => {
          return await new Promise(resolve => {
            setTimeout(resolve('Supercharge'), 10)
          })
        }
      }
    })
  })

  const response = await Supertest(server.callback())
    .get('/some/path?foo=bar')
    .set('X-Inertia', 'true')
    .set('X-Inertia-Version', '1.0.0')
    .expect(200)

  expect(response.body).toEqual({
    component: 'Users/List',
    props: {
      name: 'Supercharge',
      users: [{ name: 'Supercharge' }],
      nested: {
        name: 'Supercharge',
        users: [{ name: 'Supercharge' }]
      }
    },
    version: '1.0.0',
    url: '/some/path?foo=bar'
  })
})

test('returns partial data', async () => {
  const app = await createApp()
  const server = createServer(app)

  server.use(({ response }) => {
    return response.inertia().render('Users/List', {
      users: () => [{ name: 'Supercharge' }],
      name: 'Supercharge',
      'keep-me': 'Supercharge'
    })
  })

  const response = await Supertest(server.callback())
    .get('/some/path?foo=bar')
    .set('X-Inertia', 'true')
    .set('X-Inertia-Version', '1.0.0')
    .set('X-Inertia-Partial-Data', 'users,keep-me')
    .set('X-Inertia-Partial-Component', 'Users/List')
    .expect(200)

  expect(response.body.props.name).toBeUndefined()
  expect(response.body).toEqual({
    component: 'Users/List',
    props: {
      users: [{ name: 'Supercharge' }],
      'keep-me': 'Supercharge'
    },
    version: '1.0.0',
    url: '/some/path?foo=bar'
  })
})

test('returns partial data and supports spaces between partial data keys', async () => {
  const app = await createApp()
  const server = createServer(app)

  server.use(({ response }) => {
    return response.inertia().render('Users/List', {
      users: () => [{ name: 'Supercharge' }],
      name: 'Supercharge',
      'keep-me': 'Supercharge'
    })
  })

  const response = await Supertest(server.callback())
    .get('/some/path?foo=bar')
    .set('X-Inertia', 'true')
    .set('X-Inertia-Version', '1.0.0')
    .set('X-Inertia-Partial-Data', 'users, keep-me')
    .set('X-Inertia-Partial-Component', 'Users/List')
    .expect(200)

  expect(response.body.props.name).toBeUndefined()
  expect(response.body).toEqual({
    component: 'Users/List',
    props: {
      users: [{ name: 'Supercharge' }],
      'keep-me': 'Supercharge'
    },
    version: '1.0.0',
    url: '/some/path?foo=bar'
  })
})

test('returns full data when rendering different component', async () => {
  const app = await createApp()
  const server = createServer(app)

  server.use(({ response }) => {
    return response.inertia().render('Users/List', {
      users: () => [{ name: 'Supercharge' }],
      name: 'Supercharge'
    })
  })

  const response = await Supertest(server.callback())
    .get('/some/path?foo=bar')
    .set('X-Inertia', 'true')
    .set('X-Inertia-Version', '1.0.0')
    .set('X-Inertia-Partial-Data', 'users')
    .set('X-Inertia-Partial-Component', 'Other/Component')
    .expect(200)

  expect(response.body).toEqual({
    component: 'Users/List',
    props: {
      name: 'Supercharge',
      users: [{ name: 'Supercharge' }]
    },
    version: '1.0.0',
    url: '/some/path?foo=bar'
  })
})

test('shares data', async () => {
  const app = await createApp()
  const server = createServer(app)

  server
    .use(async ({ request, response }, next) => {
      response.inertia().share({
        appName: 'Supercharge',
        shared: async () => 'async-shared-data'
      })

      request.inertia().share({
        user: () => {
          return { name: 'Marcus' }
        }
      })

      await next()
    })
    .use(({ response }) => {
      return response.inertia().render('Users/List', {
        users: [{ name: 'Supercharge' }]
      })
    })

  const response = await Supertest(server.callback())
    .get('/')
    .set('X-Inertia', 'true')
    .set('X-Inertia-Version', '1.0.0')
    .expect(200)

  expect(response.body).toEqual({
    component: 'Users/List',
    props: {
      appName: 'Supercharge',
      user: { name: 'Marcus' },
      shared: 'async-shared-data',
      users: [{ name: 'Supercharge' }]
    },
    version: '1.0.0',
    url: '/'
  })
})

test('shared data: is filerable when requesting partial data', async () => {
  const app = await createApp()
  const server = createServer(app)

  server
    .use(async ({ request, response }, next) => {
      response.inertia().share({
        appName: 'Supercharge',
        shared: async () => 'async-shared-data'
      })

      request.inertia().share({
        user: () => {
          return { name: 'Marcus' }
        }
      })

      await next()
    })
    .use(({ response }) => {
      return response.inertia().render('Users/List', {
        users: [{ name: 'Supercharge' }]
      })
    })

  const response = await Supertest(server.callback())
    .get('/')
    .set('X-Inertia', 'true')
    .set('X-Inertia-Version', '1.0.0')
    .set('X-Inertia-Partial-Data', 'users, appName')
    .set('X-Inertia-Partial-Component', 'Users/List')
    .expect(200)

  expect(response.body).toEqual({
    component: 'Users/List',
    props: {
      appName: 'Supercharge',
      users: [{ name: 'Supercharge' }]
    },
    version: '1.0.0',
    url: '/'
  })
})

test.run()
