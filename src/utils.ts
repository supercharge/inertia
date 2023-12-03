'use strict'

interface RenderFunction {
  default?: Function | { render?: Function }
  render?: Function
}

/**
 * Returns the SSR "render" function from the given `path`.
 */
export async function resolveRenderFunctionFrom (renderFunctionPath: string): Promise<Function> {
  const renderFn: RenderFunction = await import(renderFunctionPath)

  if (typeof renderFn.render === 'function') {
    return renderFn.render
  }

  if (typeof renderFn.default === 'function') {
    return renderFn.default
  }

  if (typeof renderFn.default === 'object' && typeof renderFn.default.render === 'function') {
    return renderFn.default.render
  }

  throw new Error(`Inertia SSR is enabled but no "render" function is exported in "${renderFunctionPath}".`)
}
