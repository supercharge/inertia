'use strict'

import { HttpContext, NextHandler } from '@supercharge/contracts'

export class HandleInertiaRequestsMiddleware {
  /**
   * Handle the incoming request.
   *
   * @param {HttpContext} ctx
   * @param {NextHandler} next
   */
  async handle ({ request, response }: HttpContext, next: NextHandler): Promise<void> {
    //

    await next()

    response.header('Vary', 'X-Inertia')
  }
}
