'use strict'

import { InertiaConfig } from './config-contract.js'

/**
 * Defines the Inertia page contract.
 */
export interface PageContract {
  component: string
  props: Record<string, unknown>
  url?: string
  version?: InertiaConfig['version']
}
