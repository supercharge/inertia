'use strict'

import { test } from 'uvu'
import Path from 'node:path'
import { expect } from 'expect'
import Supertest from 'supertest'
import { fileURLToPath } from 'node:url'
import { Inertia } from '../dist/index.js'
import { createApp, createServer } from './helpers/index.js'

const __dirname = Path.dirname(fileURLToPath(import.meta.url))

test('returns 409 for different request and server asset versions', async () => {
  const app = await createApp()
  const server = createServer(app)

  server.use(({ response }) => {
    return response.inertia().render('Users/List')
  })

  const response = await Supertest(server.callback())
    .get('/some/path?foo=bar')
    .set('X-Inertia', 'true')
    .set('X-Inertia-Version', 'old')
    .expect(409)

  expect(response.headers).toMatchObject({
    'x-inertia-location': '/some/path?foo=bar'
  })
})

test('supports versioning using a function', async () => {
  const version = '1.0.0'

  const app = await createApp()
  app.config().set('inertia.version', () => version)

  const server = createServer(app).use(({ response }) => {
    return response.inertia().render('Users/List')
  })

  await Supertest(server.callback())
    .get('/')
    .set('X-Inertia', 'true')
    .set('X-Inertia-Version', version)
    .expect(200)
})

test('supports versioning using an async function', async () => {
  const version = '1.0.0'

  const app = await createApp()
  app.config().set('inertia.version', async () => {
    return await new Promise(resolve => {
      setTimeout(() => resolve(version), 10)
    })
  })

  const server = createServer(app).use(({ response }) => {
    return response.inertia().render('Users/List')
  })

  await Supertest(server.callback())
    .get('/')
    .set('X-Inertia', 'true')
    .set('X-Inertia-Version', version)
    .expect(200)
})

test('conflicts when using a different version from manifest file', async () => {
  const version = '1.0.0'

  const app = await createApp()
  app.config().set('inertia.version', async () => {
    return Inertia.manifestFile(
      Path.resolve(__dirname, 'fixtures/manifest.json')
    )
  })

  const server = createServer(app).use(({ response }) => {
    return response.inertia().render('Users/List')
  })

  await Supertest(server.callback())
    .get('/')
    .set('X-Inertia', 'true')
    .set('X-Inertia-Version', version)
    .expect(409)
})

test('fails when using a non-existing manifest file', async () => {
  const version = '1.0.0'
  const manifestFilePath = Path.resolve(__dirname, 'fixtures/non-existent-manifest.json')

  const app = await createApp()
  app.config().set('inertia.version', async () => {
    return Inertia.manifestFile(manifestFilePath)
  })

  const server = createServer(app).use(({ response }) => {
    return response.inertia().render('Users/List')
  })

  const response = await Supertest(server.callback())
    .get('/')
    .set('X-Inertia', 'true')
    .set('X-Inertia-Version', version)
    .set('accept', 'application/json')
    .expect(500)

  expect(response.body).toMatchObject({
    message: `Manifest file "${manifestFilePath}" does not exist.`
  })
})

test.run()
