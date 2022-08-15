'use strict'

import Fs from 'node:fs'
import dedent from 'dedent'
import { Inertia } from './inertia'
import { InertiaOptions } from './contracts'
import { resolveRenderFunctionFrom } from './utils'
import { ServiceProvider } from '@supercharge/support'
import { Application, HttpRequest, HttpRequestCtor, HttpResponse, HttpResponseCtor, ViewEngine } from '@supercharge/contracts'

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
    this.registerInertiaPartialViews()
    this.registerInertiaRequestMacros()
    this.registerInertiaResponseMacros()
  }

  /**
   * Register the Inertia partial view.
   */
  private registerInertiaPartialViews (): void {
    this.registerInertiaPartial()
    this.registerInertiaHeadPartial()
  }

  /**
   * Register the `inertia` partial view.
   */
  private registerInertiaPartial (): void {
    this.app()
      .make<ViewEngine>('view')
      .registerPartial('inertia', dedent(`
        {{#if ssrBody}}
          {{ ssrBody }}
        {{ else }}
          <div id="app" data-page="{{ page }}"></div>
        {{/if}}
      `))
  }

  /**
   * Register the `inertiaHead` partial view.
   */
  private registerInertiaHeadPartial (): void {
    this.app()
      .make<ViewEngine>('view')
      .registerPartial('inertiaHead', '{{ ssrHead }}')
  }

  /**
   * Register the Inertia request macros.
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
   * Register the Inertia resposne macros.
   */
  private registerInertiaResponseMacros (): void {
    const app = this.app().make<Application>('app')
    const Response = this.app().make<HttpResponseCtor>('response')
    const inertiaConfig = app.config().get<InertiaOptions>('inertia', { view: 'app', ssr: { enabled: false } })

    if (inertiaConfig.ssr?.enabled) {
      this.ensureSsrRenderFunction(inertiaConfig)
    }

    Response.macro('inertia', function (this: HttpResponse) {
      return new Inertia(app, this.ctx(), inertiaConfig)
    })
  }

  /**
   * Ensure the configured SSR render function is available.
   */
  private ensureSsrRenderFunction (inertiaConfig: InertiaOptions): void {
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
