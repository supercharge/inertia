'use strict'

module.exports = function render (page) {
  return {
    head: [
      '<title>Supercharge Inertia SSR</title>'
    ],
    body: `<h1>Hello Test SSR: ${page.props.name}</h1>`
  }
}
