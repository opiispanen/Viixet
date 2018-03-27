const express = require('express')
const path = require('path')
const routes = require('./routes.js')
//const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express()
const port = 3000
const Viixet = require('./Viixet.js')
const send = require('./send.js')

app.use(bodyParser.json() );
app.use(bodyParser.urlencoded({
    extended: true
}))
//app.use(cookieParser());

app.use(
    '/', 
    express.static(
        __dirname + '/../', 
        { index: 'index.html' }
    )
)

Object
    .keys(routes)
    .forEach((name) => {
        const route = routes[name]
        const methods = ['get','post','put','delete']
        const register = (method) => {
            if (route.authenticate && route.authenticate[method])
                app[method](name, (req, res) => {
                    const token = req.header('authorization')

                    Viixet.authenticate(token)
                        .then((user) => {
                            route[method](req, res, user)
                        })
                        .catch((data) => send(
                            res, 
                            Object.assign(data, { success: false })
                        ))
                })
            else
                app[method](name, route[method])
        }
        
        methods.forEach((method) => {
            if (!!route[method])
                register(method)
        })
    })

app.listen(port, () => {
    console.log('Server started')
})