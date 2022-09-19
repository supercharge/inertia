'use strict'

const { expect } = require('expect')
const Supertest = require('supertest')
const { test } = require('@japa/runner')
const { createApp } = require('./helpers')
const { Server } = require('@supercharge/http')
const { InertiaRequest, InertiaResponse } = require('../dist')

test.group('InertiaServiceProvider', () => {
  test('registers request macros', async () => {
    const app = await createApp()

    const server = new Server(app).use(({ request, response }) => {
      expect(typeof request.inertia === 'function').toBe(true)
      expect(request.inertia()).toBeInstanceOf(InertiaRequest)

      expect(typeof request.isInertia === 'function').toBe(true)
      expect(typeof request.isNotInertia === 'function').toBe(true)

      return response.payload({
        isInertia: request.isInertia(),
        isNotInertia: request.isNotInertia(),
        inertiaVersion: request.inertia().version()
      })
    })

    await Supertest(server.callback())
      .get('/')
      .set('X-Inertia-Version', 'test-version')
      .expect(200, {
        isInertia: false,
        isNotInertia: true,
        inertiaVersion: 'test-version'
      })
  })

  test('registers response macros', async () => {
    const app = await createApp()

    const server = new Server(app).use(({ response }) => {
      expect(typeof response.inertia === 'function').toBe(true)
      expect(response.inertia()).toBeInstanceOf(InertiaResponse)

      return response.payload('ok')
    })

    await Supertest(server.callback())
      .get('/')
      .expect(200, 'ok')
  })
})
