'use strict'

import { tap } from '@supercharge/goodies'
import { HttpRequest } from '@supercharge/contracts'

type InertiaSharedDataType = Record<string, any>

declare module '@supercharge/contracts' {
  export interface HttpStateData {
    'inertia': InertiaSharedDataType
  }
}

export class SharesData {
  /**
   * Stores the reference to the HTTP request.
   */
  protected readonly request: HttpRequest

  /**
   * Create a new instance.
   */
  constructor (request: HttpRequest) {
    this.request = request
  }

  /**
   * Assign shared data that will be merged into the response props.
   */
  share (data: InertiaSharedDataType): this {
    return tap(this, () => {
      this.request.state().merge({ inertia: data })
    })
  }

  /**
   * Returns the shared Inertia data.
   */
  sharedData (): InertiaSharedDataType {
    return this.request.state().get('inertia', {})
  }
}
