
// Load the Viixet model for the authentication routes
const Viixet = require('./Viixet.js')
// Example custom module outside the Viixet system
const Posts = require('./Posts.js')

// Combine all the routes to export
const routes = Object.assign(
    Viixet.getRoutes(),
    Posts.getRoutes()
)

module.exports = routes