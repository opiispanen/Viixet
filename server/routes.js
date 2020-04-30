const Viixet = require('./Viixet.js')
const Files = require('./Files.js')
// Combine all the routes to export

module.exports = {
    ...Viixet.routes,
    ...Files
}