'use strict'

import { Inertia } from './inertia'
import { ServiceProvider } from '@supercharge/support'
import { Application, HttpRequest, HttpRequestCtor, HttpResponse, HttpResponseCtor, ViewEngine } from '@supercharge/contracts'

/**
 * Extend the Supercharge request interface with the macro’ed inertia properties.
 */
declare module '@supercharge/contracts' {
  export interface HttpRequest {
    isInertia (): boolean
    inertiaVersion (): string
  }

  export interface HttpResponse {
    inertia (): Inertia
  }
}

export class InertiaServiceProvider extends ServiceProvider {
  /**
   * Register MongoDB services into the container.
   */
  override register (): void {
    this.registerInertiaRequestMacros()
    this.registerInertiaResponseMacros()
  }

  /**
   * Register the inertia request macros.
   */
  private registerInertiaRequestMacros (): void {
    const Request = this.app().make<HttpRequestCtor>('request')

    Request
      .macro('isInertia', function (this: HttpRequest) {
        return this.hasHeader('X-Inertia')
      })
      .macro('inertiaVersion', function (this: HttpRequest) {
        return this.header('X-Inertia-Version')
      })
  }

  /**
   * Register the inertia resposne macros.
   */
  private registerInertiaResponseMacros (): void {
    const app = this.app().make<Application>('app')
    const inertiaConfig = app.config().get('inertia', {})
    const Response = this.app().make<HttpResponseCtor>('response')

    Response.macro('inertia', function (this: HttpResponse) {
      return new Inertia(app, this.ctx(), inertiaConfig)
    })
  }
}
