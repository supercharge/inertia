'use strict'

import { HttpContext, NextHandler } from '@supercharge/contracts'

export class HandleInertiaRequestsMiddleware {
  /**
   * Handle the incoming request.
   *
   * @param {HttpContext} ctx
   * @param {NextHandler} next
   */
  async handle (ctx: HttpContext, next: NextHandler): Promise<any> {
    const { request, response } = ctx

    request.inertia().share(await this.share(ctx))

    await next()

    response.header('Vary', 'X-Inertia')

    if (request.isNotInertia()) {
      return response
    }

    if (response.hasStatus(302) && request.isMethod(['POST', 'PUT', 'PATCH'])) {
      response.status(303)
    }
  }

  /**
   * Returns the props that are shared by default.
   *
   * @see https://inertiajs.com/shared-data
   *
   * @param  {HttpContext} _ctx
   */
  async share (_ctx: HttpContext): Promise<Record<string, unknown>> {
    return {
      //
    }
  }
}
