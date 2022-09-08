'use strict'

import Fs from 'node:fs'
import dedent from 'dedent'
import { InertiaOptions } from './contracts'
import { InertiaRequest } from './inertia-request'
import { resolveRenderFunctionFrom } from './utils'
import { InertiaResponse } from './inertia-response'
import { ServiceProvider } from '@supercharge/support'
import { Application, HttpRequest, HttpRequestCtor, HttpResponse, HttpResponseCtor, ViewEngine } from '@supercharge/contracts'

/**
 * Extend the Supercharge request interface with the macro’ed inertia properties.
 */
declare module '@supercharge/contracts' {
  export interface HttpRequest {
    /**
     * Returns the Inertia request instance.
     */
    inertia (): InertiaRequest

    /**
     * Determine whether the request is an Inertia request.
     */
    isInertia (): boolean

    /**
     * Determine whether the request is not an Inertia request.
     */
    isNotInertia (): boolean
  }

  export interface HttpResponse {
    /**
     * Returnst the Inertia response instance.
     */
    inertia (): InertiaResponse
  }
}

export class InertiaServiceProvider extends ServiceProvider {
  /**
   * Decorate the request and response instances with Inertia methods.
   */
  override async boot (): Promise<void> {
    this.registerInertiaPartialViews()
    this.registerInertiaRequestMacros()
    this.registerInertiaResponseMacros()
  }

  /**
   * Register the Inertia partial view.
   */
  protected registerInertiaPartialViews (): void {
    this.registerInertiaPartial()
    this.registerInertiaHeadPartial()
  }

  /**
   * Register the `inertia` partial view.
   */
  protected registerInertiaPartial (): void {
    this.app()
      .make<ViewEngine>('view')
      .registerPartial('inertia', dedent(`
        {{#if ssrBody}}
          {{{ ssrBody }}}
        {{ else }}
          <div id="app" data-page="{{ page }}"></div>
        {{/if}}
      `))
  }

  /**
   * Register the `inertiaHead` partial view.
   */
  protected registerInertiaHeadPartial (): void {
    this.app()
      .make<ViewEngine>('view')
      .registerPartial('inertiaHead', dedent(`
        {{#if ssrHead}}
        {{{ ssrHead }}}
        {{/if}}
      `))
  }

  /**
   * Register the Inertia request macros.
   */
  protected registerInertiaRequestMacros (): void {
    const Request = this.app().make<HttpRequestCtor>('request')

    Request
      .macro('inertia', function (this: HttpRequest) {
        return new InertiaRequest(this)
      })
      .macro('isInertia', function (this: HttpRequest) {
        return this.inertia().isInertia()
      })
      .macro('isNotInertia', function (this: HttpRequest) {
        return this.inertia().isNotInertia()
      })
  }

  /**
   * Register the Inertia resposne macros.
   */
  protected registerInertiaResponseMacros (): void {
    const app = this.app().make<Application>('app')
    const Response = this.app().make<HttpResponseCtor>('response')
    const inertiaConfig = app.config().get<InertiaOptions>('inertia', { view: 'app', ssr: { enabled: false } })

    if (inertiaConfig.ssr?.enabled) {
      this.ensureSsrRenderFunction(inertiaConfig)
    }

    Response.macro('inertia', function (this: HttpResponse) {
      return new InertiaResponse(app, this.ctx(), inertiaConfig)
    })
  }

  /**
   * Ensure the configured SSR render function is available.
   */
  protected ensureSsrRenderFunction (inertiaConfig: InertiaOptions): void {
    const renderFunctionPath = inertiaConfig.ssr?.resolveRenderFunctionFrom

    if (!renderFunctionPath) {
      throw new Error('Inertia SSR is enabled but the path to the file exporting the render function is missing.')
    }

    if (!Fs.existsSync(renderFunctionPath)) {
      throw new Error(`Inertia SSR is enabled but we cannot resolve the file at "${renderFunctionPath}".`)
    }

    resolveRenderFunctionFrom(renderFunctionPath)
  }
}
