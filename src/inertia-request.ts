'use strict'

import { SharesData } from './shares-data.js'

export class InertiaRequest extends SharesData {
  /**
   * Determine whether the request is an Inertia request.
   */
  isInertia (): boolean {
    return this.request.hasHeader('x-inertia')
  }

  /**
   * Determine whether the request is not an Inertia request.
   */
  isNotInertia (): boolean {
    return !this.isInertia()
  }

  /**
   * Returns the Inertia version if available, `undefined` otherwise. This
   * version will be `undefined` on the first request because there is
   * no version available to Inertia when making the initial request.
   */
  version (): string | undefined {
    return this.request.header('x-inertia-version') as string | undefined
  }

  /**
   * Determinew whether the request wants to partially reload data.
   */
  wantsPartialData (): boolean {
    return this.partialData().length > 0
  }

  /**
   * Returns the array of the desired props (data) keys that should be returned.
   *
   * @see https://inertiajs.com/the-protocol#partial-reloads
   */
  partialData (): string[] {
    return (this.request.header('x-inertia-partial-data', '') as string)
      .split(',')
      .map(key => key.trim())
  }

  /**
    * Returns the name of the component that is being partially reloaded.
    *
    * @see https://inertiajs.com/the-protocol#partial-reloads
    */
  partialComponent (): string {
    return this.request.header('x-inertia-partial-component', '') as string
  }

  /**
    * Determine whether the request is a partial reload. Partial reloads only
    * work for requests made to the same page component. If the destination
    * is a different component, then no partial reload will be performed.
    *
    * @see https://inertiajs.com/the-protocol#partial-reloads
    */
  shouldPartiallyReload (component: string): boolean {
    return this.wantsPartialData() && this.partialComponent() === component
  }
}
