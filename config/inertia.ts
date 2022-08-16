'use strict'

import { Application } from '@supercharge/contracts'
import { Inertia, InertiaOptions } from '@supercharge/inertia'

const inertiaConfig: InertiaOptions = {
  /**
   * Defines the root template view that will be loaded on the first page visit.
   * This root view template should be provided in the resources directory of
   * the framework. Precisely, put the file in the `resources/views` folder.
   */
  view: 'app',

  /**
   * This setting defines the asset version generated on the server-side. This
   * asset version will be used by Inertia when sending requests. An Inertia
   * request includes the latest version in the `X-Inertia-Version` header.
   *
   * @see https://inertiajs.com/the-protocol#asset-versioning
   *
   * The version can either be a value or a function that resolves to a value.
   * A value can be a string, a number, or simply undefined. When providing
   * a function, you may also use an async function resolving to a string.
   */
  version: async (app: Application) => {
    return Inertia.manifestFile(
      app.publicPath('js/manifest.json')
    )
  },

  /**
   * This setting configures the server-side rendering when using Inertia. You
   * can disable server-side rendering generally by using the toggle setting
   * `enabled`. When enabled, you must provide a render function file path.
   */
  ssr: {
    /**
     * This setting controls whether server-side rendering is enabled or not.
     * SSR is useful when you want to render the application on the server
     * and deliver the rendered HTML to the client.
     */
    enabled: true,

    /**
     * This setting defines the file path that exposes a render function. The
     * render function is required for Inertia to create the rendered HTML.
     * Your file may use a default export or a named "render" export.
     */
    resolveRenderFunctionFrom: 'bootstrap/ssr.js'
  }
}

export default inertiaConfig
