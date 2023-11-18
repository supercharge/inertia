'use strict'

import { InertiaOptions } from './config-contract.js'

/**
 * Defines the Inertia page contract.
 */
export interface PageContract {
  component: string
  props: Record<string, unknown>
  url?: string
  version?: InertiaOptions['version']
}
