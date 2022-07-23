'use strict'

export interface PageContract {
  component: string
  props?: Record<string, unknown>
  url: string
  version?: string
}

export class Page {
  private readonly page: PageContract

  constructor (page: PageContract) {
    this.page = page
  }

  /**
   * Returns a page instance for the given `data`.
   *
   * @returns {Page}
   */
  static from (page: PageContract): Page {
    return new this(page)
  }

  toJSON (): PageContract {
    return {
      component: this.component(),
      url: this.url()
    }
  }

  component (): PageContract['component'] {
    return this.page.component
  }

  props (): PageContract['props'] {
    return this.page.props
  }

  url (): PageContract['url'] {
    return this.page.url
  }

  version (): PageContract['version'] {
    return this.page.version
  }
}
