const Viixet = require('./Viixet.js')
const send = require('./send.js')
const routes = require('./routes.js')
const tokenName = process.env.AUTH_TOKENNAME

const methods = ['get','post','put','delete']

function initRoutes(app) {
    // Routes come in an object so get the keys and iterate
    // through them to access the routes themselves
    Object
        .keys(routes)
        .forEach((name) => {
            const route = routes[name]
            
            const registerRoute = (method) => {
                const authRequired = route.authenticate && route.authenticate[method];
                const publicRoute = !route.authenticate || !route.authenticate[method];

                app[method](name, async (req, res) => {
                    const token = req.cookies[tokenName];
                    
                    try {
                        const user = await Viixet.authenticate(token, req, res)
                        let allow = false;
    
                        if (authRequired && user !== false) {
                            allow = true;
                        } else if (publicRoute) {
                            allow = true;
                        }
    
                        if (allow) {
                            route[method](req, res, user)
                        } else {
                            send(
                                res, 
                                { success: false, error: 'USER_NOT_ALLOWED_2' },
                                401
                            )
                        }
                    } catch (err) {
                        if (publicRoute) {
                            route[method](req, res, false)
                        } else {
                            send(
                                res, 
                                { success: false, error: 'USER_NOT_ALLOWED_1', err },
                                401
                            )
                        }
                    }
                })
            }
            
            // Iterate through supported methods and register routes
            methods.forEach((method) => {
                // Check if active route has the actual 
                // method iterated here
                if (!!route[method])
                    registerRoute(method)
            })
        })
}

module.exports = initRoutes