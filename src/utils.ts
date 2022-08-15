'use strict'

import { esmRequire } from '@supercharge/goodies'

type RenderFunction = Function | { render: Function }

/**
 * Returns the SSR "render" function from the given `path`.
 */
export function resolveRenderFunctionFrom (renderFunctionPath: string): Function {
  // TODO: cache require() calls
  const renderFn = esmRequire<RenderFunction>(renderFunctionPath)

  if (typeof renderFn === 'function') {
    return renderFn
  }

  if (typeof renderFn === 'object' && typeof renderFn.render === 'function') {
    return renderFn.render
  }

  throw new Error(`Inertia SSR is enabled but no "render" function is exported in "${renderFunctionPath}".`)
}
