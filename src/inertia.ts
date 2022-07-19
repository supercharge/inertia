'use strict'

import { Application, HttpContext } from '@supercharge/contracts'

export class Inertia {
  private readonly app: Application
  private readonly ctx: HttpContext
  private readonly config: any

  constructor (app: Application, ctx: HttpContext, config: any) {
    this.app = app
    this.ctx = ctx
    this.config = config
  }

  tbd (): void {
    // for now: this is just to keep the TS compiler quiet :)
    console.log(this.app, this.ctx, this.config)
  }
}
