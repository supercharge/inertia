'use strict'

import { Inertia } from './inertia'
import { InertiaOptions } from './contracts'
import { ServiceProvider } from '@supercharge/support'
import { Application, HttpRequest, HttpRequestCtor, HttpResponse, HttpResponseCtor } from '@supercharge/contracts'

/**
 * Extend the Supercharge request interface with the macro’ed inertia properties.
 */
declare module '@supercharge/contracts' {
  export interface HttpRequest {
    isInertia (): boolean
    isNotInertia (): boolean
    inertiaVersion (): string | undefined
  }

  export interface HttpResponse {
    inertia (): Inertia
  }
}

export class InertiaServiceProvider extends ServiceProvider {
  /**
   * Decorate the request and response instances with Inertia methods.
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
        return this.hasHeader('x-inertia')
      })
      .macro('isNotInertia', function (this: HttpRequest) {
        return !this.isInertia()
      })
      .macro('inertiaVersion', function (this: HttpRequest) {
        return this.header('x-inertia-version')
      })
  }

  /**
   * Register the inertia resposne macros.
   */
  private registerInertiaResponseMacros (): void {
    const app = this.app().make<Application>('app')
    const Response = this.app().make<HttpResponseCtor>('response')
    const inertiaConfig = app.config().get<InertiaOptions>('inertia', { view: 'app' })

    Response.macro('inertia', function (this: HttpResponse) {
      return new Inertia(app, this.ctx(), inertiaConfig)
    })
  }
}
