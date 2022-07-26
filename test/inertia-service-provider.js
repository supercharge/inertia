'use strict'

const { expect } = require('expect')
const Supertest = require('supertest')
const { Inertia } = require('../dist')
const { test } = require('@japa/runner')
const { createApp } = require('./helpers')
const { Server } = require('@supercharge/http')

const app = createApp()

test.group('InertiaServiceProvider', () => {
  test('registers request macros', async () => {
    const server = new Server(app).use(({ request, response }) => {
      expect(typeof request.isInertia === 'function').toBe(true)
      expect(typeof request.isNotInertia === 'function').toBe(true)
      expect(typeof request.inertiaVersion === 'function').toBe(true)

      return response.payload({
        isInertia: request.isInertia(),
        isNotInertia: request.isNotInertia(),
        inertiaVersion: request.inertiaVersion()
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
    const server = new Server(app).use(({ request, response }) => {
      expect(typeof response.inertia === 'function').toBe(true)
      expect(response.inertia()).toBeInstanceOf(Inertia)

      return response.payload('ok')
    })

    await Supertest(server.callback())
      .get('/')
      .expect(200, 'ok')
  })
})
