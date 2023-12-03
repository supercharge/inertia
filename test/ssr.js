'use strict'

import { test } from 'uvu'
import Path from 'node:path'
import { expect } from 'expect'
import Supertest from 'supertest'
import { fileURLToPath } from 'node:url'
import { createSsrApp, createServer } from './helpers/index.js'

const __dirname = Path.dirname(fileURLToPath(import.meta.url))

test('fails when not providing a path from where to resolve the render function', async () => {
  expect(createSsrApp())
    .rejects.toThrow('Inertia SSR is enabled but the path to the file exporting the render function is missing.')
})

test('fails when provided path to render function does not exist', async () => {
  await expect(createSsrApp({ resolveRenderFunctionFrom: './does-not-exist.js' }))
    .rejects.toThrow('Inertia SSR is enabled but we cannot resolve the file at "./does-not-exist.js".')
})

test('fails when provided path to render function does not export a function', async () => {
  const resolveRenderFunctionFrom = Path.resolve(__dirname, 'fixtures', 'ssr.string-export.js')

  await expect(createSsrApp({ resolveRenderFunctionFrom }))
    .rejects.toThrow(`Inertia SSR is enabled but no "render" function is exported in "${resolveRenderFunctionFrom}".`)
})

test('resolves render function from named "render" export', async () => {
  const app = await createSsrApp({
    resolveRenderFunctionFrom: Path.resolve(__dirname, 'fixtures', 'ssr.named-export.js')
  })

  const server = createServer(app)

  server.use(({ response }) => {
    return response.inertia().render('Some/Page', {
      name: 'Supercharge'
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

      <title>Supercharge Inertia SSR</title>
    </head>
    <body>
        <h1>Hello Test SSR: Supercharge</h1>
    </body>
  </html>
`)
})

test('resolves render function from default export', async () => {
  const app = await createSsrApp({
    resolveRenderFunctionFrom: Path.resolve(__dirname, 'fixtures', 'ssr.default-export.js')
  })

  const server = createServer(app)

  server.use(({ response }) => {
    return response.inertia().render('Some/Page', {
      name: 'Supercharge'
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

      <title>Supercharge Inertia SSR</title>
    </head>
    <body>
        <h1>Hello Test SSR: Supercharge</h1>
    </body>
  </html>
`)
})

test('resolves render function from ESM default export', async () => {
  const app = await createSsrApp({
    resolveRenderFunctionFrom: Path.resolve(__dirname, 'fixtures', 'ssr.default-export.js')
  })

  const server = createServer(app)

  server.use(({ response }) => {
    return response.inertia().render('Some/Page', {
      name: 'Supercharge'
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

      <title>Supercharge Inertia SSR</title>
    </head>
    <body>
        <h1>Hello Test SSR: Supercharge</h1>
    </body>
  </html>
`)
})

test('resolves render function from CommonJS module.exports', async () => {
  const app = await createSsrApp({
    resolveRenderFunctionFrom: Path.resolve(__dirname, 'fixtures', 'ssr.default-export-commonjs.cjs')
  })

  const server = createServer(app)

  server.use(({ response }) => {
    return response.inertia().render('Some/Page', {
      name: 'Supercharge'
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

      <title>Supercharge Inertia SSR</title>
    </head>
    <body>
        <h1>Hello Test SSR: Supercharge</h1>
    </body>
  </html>
`)
})

test('resolves render function from CommonJS named "render" export', async () => {
  const app = await createSsrApp({
    resolveRenderFunctionFrom: Path.resolve(__dirname, 'fixtures', 'ssr.named-export-commonjs.cjs')
  })

  const server = createServer(app)

  server.use(({ response }) => {
    return response.inertia().render('Some/Page', {
      name: 'Supercharge'
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

      <title>Supercharge Inertia SSR</title>
    </head>
    <body>
        <h1>Hello Test SSR: Supercharge</h1>
    </body>
  </html>
`)
})

test.run()
