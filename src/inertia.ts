'use strict'

import { Application, HttpContext, HttpRequest, HttpResponse } from '@supercharge/contracts'

export class Inertia {
  private readonly config: any
  private readonly app: Application
  private readonly request: HttpRequest
  private readonly response: HttpResponse

  constructor (app: Application, { request, response }: HttpContext, config: any) {
    this.app = app
    this.config = config
    this.request = request
    this.response = response
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

    // for now: this is just to keep the TS compiler quiet :)

    const page = {}

    if (this.request.isInertia()) {
      return this.response.payload(page)
    }

    return this.response.view(component, { page })
  }
}
