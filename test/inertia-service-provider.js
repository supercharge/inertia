'use strict'

const { test } = require('@japa/runner')
const { InertiaServiceProvider } = require('../dist')

test.group('InertiaServiceProvider', () => {
  test('register inertia service provider', async () => {
    console.log(InertiaServiceProvider)
  }).skip()
})
