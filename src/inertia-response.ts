'use strict'

import Os from 'node:os'
import { SharesData } from './shares-data.js'
import { isAsyncFunction } from '@supercharge/goodies'
import { resolveRenderFunctionFrom } from './utils.js'
import { Application, HttpContext, HttpResponse } from '@supercharge/contracts'
import { InertiaConfig, InertiaVersionValue, PageContract } from './contracts/index.js'

export class InertiaResponse extends SharesData {
  /**
   * Stores the reference to application instance.
   */
  private readonly app: Application

  /**
   * Stores the reference to the HTTP response.
   */
  private readonly response: HttpResponse

  /**
   * Stores the reference to the Inertia configuration.
   */
  private readonly config: InertiaConfig

  /**
   * Create a new instance.
   */
  constructor (app: Application, { request, response }: HttpContext, config: InertiaConfig) {
    super(request)

    this.app = app
    this.config = config
    this.response = response
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
   * Returns a server-initiated Inertia redirect to the given `url`.
   *
   * @param {String} url
   *
   * @returns {HttpResponse}
   */
  location (url: string): HttpResponse {
    return this.response.status(409).withHeaders({ 'X-Inertia-Location': url })
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

    const page: PageContract = {
      component,
      props: await this.resolveProps(responseProps ?? {}, component),
      version: await this.version(),
      url: this.request.req().url!
    }

    /**
     * Subsequent Inertia requests receive a JSON response. We detect subsequent
     * requests using the `X-Inertia` header. This header is evaluated on the
     * request object and we determine whether this is an Inertia request.
     */
    if (this.request.isInertia()) {
      return this.response.payload(page).withHeaders({ 'X-Inertia': 'true' })
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
    return this.request.inertia().version() !== await this.version()
  }

  /**
   * Determine what to do when the Inertia asset versions don’t match. This
   * mismatch happens when the calculated asset version on server-side
   * is different than the version as part of the client’s request.
   *
   * @param request
   * @param response
   *
   * @returns {HttpResponse}
   */
  protected onVersionConflict (): HttpResponse {
    return this.location(this.request.req().url!)
  }

  /**
   * Returns the resolved response `props`. Resolving the props means filtering
   * for partial reloads and evaluating lazy prop functions if any is present.
   */
  protected async resolveProps (props: Record<string, unknown>, component: string): Promise<Record<string, unknown>> {
    props = this.share(props).sharedData()

    if (this.request.inertia().shouldPartiallyReload(component)) {
      props = this.filterPartialData(props)
    }

    return await this.resolvePropertyInstances(props)
  }

  /**
   * Returns only those props that should be reloaded.
   */
  protected filterPartialData (props: Record<string, unknown>): Record<string, unknown> {
    const partials = Object.entries(props).filter(([key]) => {
      return this.request.inertia().partialData().includes(key)
    })

    return Object.fromEntries(partials)
  }

  /**
   * Returns the resolved response `props`. Resolving the props means evaluating
   * all lazy props functions if any is present. Lazy props are functions that
   * will be resolved when needed and the related value assigned to the prop.
   *
   * @see https://inertiajs.com/partial-reloads#lazy-data-evaluation
   */
  protected async resolvePropertyInstances (props: Record<string, unknown>): Promise<Record<string, unknown>> {
    for (const [key, value] of Object.entries(props)) {
      if (isAsyncFunction(value)) {
        props[key] = await value()
      } else if (typeof value === 'function') {
        props[key] = value()
      } else if (typeof value === 'object' && value !== null) {
        props[key] = await this.resolvePropertyInstances(value as Record<string, unknown>)
      }
    }

    return props
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
    const render = await resolveRenderFunctionFrom(this.config.ssr!.resolveRenderFunctionFrom!)

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
