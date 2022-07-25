'use strict'

import { HttpContext, NextHandler } from '@supercharge/contracts'

export class HandleInertiaRequestsMiddleware {
  /**
   * Handle the incoming request.
   *
   * @param {HttpContext} ctx
   * @param {NextHandler} next
   */
  async handle ({ request, response }: HttpContext, next: NextHandler): Promise<any> {
    await next()

    response.header('Vary', 'X-Inertia')

    if (request.isNotInertia()) {
      return response
    }

    // @ts-expect-error
    if (response.hasStatus(302) && request.isMethod(['POST', 'PUT', 'PATCH'])) {
      response.status(303)
    }
  }
}
