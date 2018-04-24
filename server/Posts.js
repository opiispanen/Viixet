const Viixet = require('./Viixet.js')
const send = require('./send.js')

class Posts {
    constructor() {
        this.posts = []
    }

    getRoutes() {
        return {
            '/posts': {
                authenticate: {
                    get: true,
                    post: true
                },  
                get: (req, res, user) => {
                    const 
                        data = {
                            posts: this.posts
                        }
        
                    send(res, data)
                },
                post: (req, res, user) => {
                    const 
                        body = req.body,
                        data = {
                            success: true
                        },
                        post = this.createPost(
                            body.content, 
                            user.viixetId, 
                            this.posts.length
                        );
                    
                    this.posts.push(post);
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
                            post: this.getPost(params.id, user.viixetId)
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
                        post = this.getPost(params.id, user.viixetId);
        
                    if (!!post) {
                        post.content = body.content;
                        data.post = post;
                        data.success = true;
                    }
        
                    send(res, data)
                }
            }
        }
    }

    getPost(id, viixetId) {
        return this.posts.filter(post => post.id === id && post.viixetId === viixetId)[0];
    }

    createPost(content, viixetId, i) {
        return {
            id: Viixet.hash(''+viixetId+i),
            viixetId: viixetId,
            content: content,
            timestamp: Date.now()
        }
    }
}