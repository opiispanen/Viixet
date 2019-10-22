// Load all the npm based depedencies needed here
const express = require('express')
const bodyParser = require('body-parser')

const initRoutes = require('./initRoutes.js')

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

// register all the app's routes
initRoutes(app)

// This launches the app itself with the port defined earlier
app.listen(port, () => {
    console.log('Server started', `http://localhost:${ port }`)
})