
const Viixet = require('./Viixet.js')
const send = require('./send.js')

const posts = []

const routes = Object.assign(Viixet.getRoutes(), {
    '/posts': {
        authenticate: {
            get: true,
            post: true
        },  
        get: (req, res, user) => {
            const data = {
                posts: posts
            }

            send(res, data)
        },
        post: (req, res, user) => {
            const 
                body = req.body,
                data = {
                    success: true
                }

            posts.push(req.body);
            send(res, data)
        }
    }
})

module.exports = routes