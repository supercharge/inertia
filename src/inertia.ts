'use strict'

import Fs from '@supercharge/fs'
import { createHash } from 'node:crypto'
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

    // TODO support partial props. For now, just resolve everything

    const page: PageContract = {
      component,
      props: responseProps ?? {},
      version: await this.version(),
      url: this.request.fullUrl(),
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
     * Initial page rendering requests receive a HTML response. This renders the
     * configured `config.inertia.view` layout. The layout contains the root
     * <div> element for the Inertia application which renders the view.
     */
    return this.response.view(this.config.view, { page })
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
    return this.request.isMethod('GET') && this.request.inertiaVersion() !== await this.version()
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
      'X-Inertia-Location': this.request.fullUrl()
    })
  }
}
