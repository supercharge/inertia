'use strict'

import Os from 'node:os'
import Fs from '@supercharge/fs'
import { createHash } from 'node:crypto'
import { resolveRenderFunctionFrom } from './utils'
import { InertiaOptions, InertiaVersionValue, PageContract } from './contracts'
import { Application, HttpContext, HttpRequest, HttpResponse } from '@supercharge/contracts'

export class Inertia {
  /**
   * Stores the reference to application instance.
   */
  private readonly app: Application

  /**
   * Stores the reference to the HTTP request.
   */
  private readonly request: HttpRequest

  /**
   * Stores the reference to the HTTP response.
   */
  private readonly response: HttpResponse

  /**
   * Stores the reference to the Inertia configuration.
   */
  private readonly config: InertiaOptions

  /**
   * Create a new instance.
   */
  constructor (app: Application, { request, response }: HttpContext, config: InertiaOptions) {
    this.app = app
    this.config = config
    this.request = request
    this.response = response
  }

  /**
   * Returns the MD5 hash for the content of the given `manifestFilePath`.
   *
   * @param manifestFilePath
   *
   * @returns {Promise<string>}
   */
  public static async manifestFile (manifestFilePath: string): Promise<string> {
    if (await Fs.exists(manifestFilePath)) {
      const content = await Fs.content(manifestFilePath)

      return createHash('md5').update(content).digest('hex')
    }

    throw new Error(`Manifest file "${manifestFilePath}" does not exist.`)
  }

  /**
   * Returns the resolved Inertia asset version.
   */
  async version (): Promise<InertiaVersionValue> {
    const version = this.config.version

    return typeof version === 'function'
      ? await version(this.app)
      : version
  }

  /**
   * Render the inertia component.
   *
   * @param component
   * @param responseProps
   *
   * @returns {*}
   */
  async render (component: string, responseProps?: Record<string, unknown>): Promise<string | Record<string, unknown> | HttpResponse> {
    if (!component) {
      throw new Error('Missing component name when calling "response.inertia().render(<component>)"')
    }

    if (await this.hasVersionConflict()) {
      return this.onVersionConflict()
    }

    //

    // TODO: support partial props. For now, just resolve everything

    const page: PageContract = {
      component,
      props: responseProps ?? {},
      version: await this.version(),
      url: this.request.req().url!
    }

    /**
     * Subsequent Inertia requests receive a JSON response. We detect subsequent
     * requests using the `X-Inertia` header. This header is evaluated on the
     * request object and we determine whether this is an Inertia request.
     */
    if (this.request.isInertia()) {
      return this.response.payload(page).header('X-Inertia', 'true')
    }

    /**
     * When using server-side rendering (SSR), we render the page using the
     * configured "render" function. The "render" function returns HTML
     * strings for `head` and `body`. We’re using them as the response.
     */
    if (this.shouldSsr()) {
      const { head, body } = await this.renderSsrPage(page)

      return await this.renderView({
        ssrHead: head.join(Os.EOL),
        ssrBody: body
      })
    }

    /**
     * Initial page rendering requests receive a HTML response. This renders the
     * configured `config.inertia.view` layout. The layout contains the root
     * <div> element for the Inertia application which renders the view.
     */
    return await this.renderView({
      page: JSON.stringify(page)
    })
  }

  /**
   * Determine whether the inertia version in the `X-Inertia-Version` request
   * header is different than the computed asset version on the server.
   *
   * @param request
   *
   * @returns {Boolean}
   */
  protected async hasVersionConflict (): Promise<boolean> {
    return this.isInertiaGetRequest() && await this.hasVersionMismatch()
  }

  /**
   * Determine whether the request comes from Inertia and is a GET request.
   *
   * @returns {boolean}
   */
  protected isInertiaGetRequest (): boolean {
    return this.request.isInertia() && this.request.isMethod('GET')
  }

  /**
   * Determine whether the Inertia version in the request is different than the server’s asset version.
   *
   * @returns {Promise<boolean>}
   */
  protected async hasVersionMismatch (): Promise<boolean> {
    return this.request.inertiaVersion() !== await this.version()
  }

  /**
   * Determine what to do when the Inertia asset versions don’t match. This
   * mismatch happens when the calculated asset version on server-side
   * is different than the version as part of the client’s request.
   *
   * @param request
   * @param response
   *
   * @returns
   */
  protected onVersionConflict (): HttpResponse {
    return this.response.status(409).withHeaders({
      'X-Inertia-Location': this.request.req().url!
    })
  }

  /**
   * Determine whether the Inertia version in the request is different than the server’s asset version.
   *
   * @returns {Promise<boolean>}
   */
  protected shouldSsr (): boolean {
    return this.config.ssr?.enabled ?? false
  }

  /**
   * Render the given `page` using the configured server-side rendering function.
   *
   * We’re already validating the existence of the render function in the Inertia
   * service provider. We can assume the referenced file exists and is exposing
   * a "render" function either via a "default" export a named "render" export.
   */
  protected async renderSsrPage (page: PageContract): Promise<{ head: string[], body: string }> {
    const render = resolveRenderFunctionFrom(this.config.ssr!.resolveRenderFunctionFrom!)

    return render(page)
  }

  /**
   * Returns the rendered HTML view using the given `props`.
   */
  protected async renderView (data: any): Promise<HttpResponse> {
    return this.response.view(this.config.view, data, view => {
      view.layout('') // use an empty layout to avoid rendering the configured default layout
    })
  }
}
