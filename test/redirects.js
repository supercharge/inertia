'use strict'

import { test } from 'uvu'
import Supertest from 'supertest'
import { createApp, createServer } from './helpers/index.js'
import { HandleInertiaRequestsMiddleware } from '../dist/index.js'

test('keeps response status code 302 for GET requests', async () => {
  const app = await createApp()
  const server = createServer(app)
    .use(HandleInertiaRequestsMiddleware)
    .use(({ response }) => {
      return response.redirect('/some/path')
    })

  await Supertest(server.callback())
    .get('/')
    .set('X-Inertia', 'true')
    .expect(302)
})

test('uses response status code 303 for POST requests', async () => {
  const app = await createApp()
  const server = createServer(app)
    .use(HandleInertiaRequestsMiddleware)
    .use(({ response }) => {
      return response.redirect('/some/path')
    })

  await Supertest(server.callback())
    .post('/')
    .set('X-Inertia', 'true')
    .expect(303)
})

test('keeps response status code 302 for non-Inertia POST requests', async () => {
  const app = await createApp()
  const server = createServer(app)
    .use(HandleInertiaRequestsMiddleware)
    .use(({ response }) => {
      return response.redirect('/some/path')
    })

  await Supertest(server.callback())
    .post('/')
    .expect(302)
})

test('uses response status code 303 for PUT requests', async () => {
  const app = await createApp()
  const server = createServer(app)
    .use(HandleInertiaRequestsMiddleware)
    .use(({ response }) => {
      return response.redirect('/some/path')
    })

  await Supertest(server.callback())
    .put('/')
    .set('X-Inertia', 'true')
    .expect(303)
})

test('keeps response status code 302 for non-Inertia PUT requests', async () => {
  const app = await createApp()
  const server = createServer(app)
    .use(HandleInertiaRequestsMiddleware)
    .use(({ response }) => {
      return response.redirect('/some/path')
    })

  await Supertest(server.callback())
    .put('/')
    .expect(302)
})

test('uses response status code 303 for PATCH requests', async () => {
  const app = await createApp()
  const server = createServer(app)
    .use(HandleInertiaRequestsMiddleware)
    .use(({ response }) => {
      return response.redirect('/some/path')
    })

  await Supertest(server.callback())
    .patch('/')
    .set('X-Inertia', 'true')
    .expect(303)
})

test('keeps response status code 302 for non-Inertia PATCH requests', async () => {
  const app = await createApp()
  const server = createServer(app)
    .use(HandleInertiaRequestsMiddleware)
    .use(({ response }) => {
      return response.redirect('/some/path')
    })

  await Supertest(server.callback())
    .patch('/')
    .expect(302)
})

test('keeps response status code 302 for DELETE requests', async () => {
  const app = await createApp()
  const server = createServer(app)
    .use(HandleInertiaRequestsMiddleware)
    .use(({ response }) => {
      return response.redirect('/some/path')
    })

  await Supertest(server.callback())
    .delete('/')
    .set('X-Inertia', 'true')
    .expect(302)
})

test('uses response status code 409 for internal redirect', async () => {
  const app = await createApp()
  const server = createServer(app)
    .use(HandleInertiaRequestsMiddleware)
    .use(({ response }) => {
      return response.inertia().location('/profile')
    })

  await Supertest(server.callback())
    .get('/')
    .set('X-Inertia', 'true')
    .expect(409)
})

test('uses response status code 409 for external redirect', async () => {
  const app = await createApp()
  const server = createServer(app)
    .use(HandleInertiaRequestsMiddleware)
    .use(({ response }) => {
      return response.inertia().location('https://superchargejs.com')
    })

  await Supertest(server.callback())
    .get('/')
    .set('X-Inertia', 'true')
    .expect(409)
})

test.run()
