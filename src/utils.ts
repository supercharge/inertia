'use strict'

import { resolveDefaultImport } from '@supercharge/goodies'

type RenderFunction = Function | { render: Function }

/**
 * Returns the SSR "render" function from the given `path`.
 */
export async function resolveRenderFunctionFrom (renderFunctionPath: string): Promise<Function> {
  const renderFn = await resolveDefaultImport<{ default: RenderFunction | undefined }>(renderFunctionPath)

  if (typeof renderFn === 'function') {
    return renderFn
  }

  if (typeof renderFn === 'object' && typeof renderFn.render === 'function') {
    return renderFn.render
  }

  throw new Error(`Inertia SSR is enabled but no "render" function is exported in "${renderFunctionPath}".`)
}
