const Viixet = require('./Viixet.js')
const send = require('./send.js')
const routes = require('./routes.js')

const methods = ['get','post','put','delete']

function initRoutes(app) {
    // Routes come in an object so get the keys and iterate
    // through them to access the routes themselves
    Object
        .keys(routes)
        .forEach((name) => {
            const route = routes[name]
            
            // The register function takes the route from its
            // surrounding scope and registers the method, name
            // and route to the Express app defined earlier (named "app")
            const register = (method) => {
                // If the route is defined to be behind authentication,
                // define a Viixet middleware for authentication
                if (route.authenticate && route.authenticate[method])
                    app[method](name, (req, res) => {
                        const token = req.header('authorization')

                        Viixet.authenticate(token)
                            .then((user) => {
                                // If the user is authenticated, just call
                                // the original route method with req, res
                                // provided along with the user object for
                                // further usage
                                route[method](req, res, user)
                            })
                            // User was not authenticated, handle the error
                            .catch((data) => send(
                                res, 
                                Object.assign(data, { success: false })
                            ))
                    })
                else
                    app[method](name, route[method]) // public route registration
            }
            
            // Iterate through supported methods and register routes
            methods.forEach((method) => {
                // Check if active route has the actual 
                // method iterated here
                if (!!route[method])
                    register(method)
            })
        })
}

module.exports = initRoutes