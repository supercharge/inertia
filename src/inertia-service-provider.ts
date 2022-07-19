'use strict'

import { Application, HttpRequest } from '@supercharge/contracts'
import { ServiceProvider } from '@supercharge/support'
import { Inertia } from './inertia'

export class InertiaServiceProvider extends ServiceProvider {
  /**
   * Register MongoDB services into the container.
   */
  override register (): void {
    this.registerTbd()
    this.registerInertiaRequestMacro()
  }

  /**
   * Register TBD.
   */
  private registerTbd (): void {
    this.app().singleton('inertia', () => {
      return 'TODO'
    })
  }

  /**
   * Register the `request.inertia()` macro.
   */
  private registerInertiaRequestMacro (): void {
    const app = this.app().make<Application>('app')
    const Request = this.app().make<HttpRequest>('request')

    Request.macro('inertia', function (this: HttpRequest) {
      const inertiaConfig = {}

      return new Inertia(app, this.ctx(), inertiaConfig)
    })
  }
}
