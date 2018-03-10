import axios from 'axios'
import User from './User.js'

import Login from './Login.vue'
import Registration from './Registration.vue'

const storageSpace = 'JerryUser'

class UserService {
    constructor() {
        this.user = new User()
    }

    setToken(token) {
        axios.defaults.headers.common['authorization'] = token;
    }
    
    authenticate() {
        return axios.get('/authenticate')
    }

    login(username, password) {
        return new Promise((resolve, reject) => {
            axios.post('/login', {
                username,
                password
            })
            .then((response) => {
                const data = response.data;
                
                if (data.success) {
                    this.user.token = data.user.token;
                    this.user.username = data.user.username;
                    this.user.email = data.user.email;

                    this.setToken(this.user.token)
                    this.save()

                    resolve({
                        success: true
                    })
                } else {
                    reject({
                        success: false
                    })
                }
            })
            .catch(reject)
        })
    }

    registration(user) {
        return axios.post('/registration', user)
    }

    load() {
        const storage = localStorage[storageSpace]

        if (!!storage) {
            const data = JSON.parse(storage);

            this.user.token = data.token;
            this.user.username = data.username;
            this.user.email = data.email;

            return true
        }

        return false
    }

    save() {
        localStorage[storageSpace] = JSON.stringify(this.user)
    }

    delete() {
        const storage = localStorage[storageSpace]

        if (!!storage) {
            delete localStorage[storageSpace]

            return true
        }

        return false
    }

    getRoutes() {
        return [
            {
                path: '/signin',
                name: 'SignIn',
                component: Login
            },
            {
                path: '/signup',
                name: 'SignUp',
                component: Registration
            }
        ]
    }

    behindWall(to, from, next) {
        if (!this.user.token)
            next('/signin')
        else {
            this.authenticate()
                .then((response) => {
                    const data = response.data
    
                    if (data.success)
                        next()
                    else
                        next('/signin')
                })
        }
    }
}

export default new UserService()