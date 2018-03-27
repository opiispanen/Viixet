
const Viixet = require('./Viixet.js')
const send = require('./send.js')

const posts = []

const getPost = (id, viixetId) => posts.filter(post => post.id === id && post.viixetId === viixetId)[0];
const createPost = (content, viixetId, i) => ({
    id: Viixet.hash(''+viixetId+i),
    viixetId: viixetId,
    content: content,
    timestamp: Date.now()
})

const routes = Object.assign(Viixet.getRoutes(), {
    '/posts': {
        authenticate: {
            get: true,
            post: true
        },  
        get: (req, res, user) => {
            const 
                data = {
                    posts: posts
                }

            send(res, data)
        },
        post: (req, res, user) => {
            const 
                body = req.body,
                data = {
                    success: true
                },
                post = createPost(body.content, user.viixetId, posts.length);
            
            posts.push(post);
            data.post = post;

            send(res, data)
        }
    },
    '/posts/:id': {
        authenticate: {
            get: true,
            put: true
        },
        get: (req, res, user) => {
            const 
                params = req.params,
                data = {
                    post: getPost(params.id, user.viixetId)
                };

            send(res, data)
        },
        put: (req, res, user) => {
            const 
                params = req.params,
                body = req.body,
                data = {
                    success: false
                },
                post = getPost(params.id, user.viixetId);

            if (!!post) {
                post.content = body.content;
                data.post = post;
                data.success = true;
            }

            send(res, data)
        }
    }
})

module.exports = routes