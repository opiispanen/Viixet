// Load all the npm based depedencies needed here
const express = require('express')
const bodyParser = require('body-parser')

// Load local Viixet dependencies
const routes = require('./routes.js')
const Viixet = require('./Viixet.js')
const send = require('./send.js')

// Initialize the express app and define a port for it
const app = express()
const port = 3000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))

// The root route is reserved for the Vue based front end
app.use(
    '/', 
    express.static(
        __dirname + '/../', 
        { index: 'index.html' }
    )
)

// Routes come in an object so get the keys and iterate
// through them to access the routes themselves
Object
    .keys(routes)
    .forEach((name) => {
        const route = routes[name]
        const methods = ['get','post','put','delete']

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

// This launches the app itself with the port defined earlier
app.listen(port, () => {
    console.log('Server started')
})