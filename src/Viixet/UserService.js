import axios from 'axios'
import settings from '../settings.js'
import User from './User.js'

import Login from './LoginView.vue'
import Registration from './RegistrationView.vue'

const storageSpace = settings.userStorage

class UserService {
    constructor() {
        this.user = new User();
        this.otherwise = '/signin';
        this.callbackState = '/';
        this.callbacks = [];
        this.authenticated = 0;
    }

    reset() {
        this.callbackState = '/'
        this.callbacks = []
    }

    setToken(token) {
        axios.defaults.headers.common['authorization'] = token;
        this.authenticated = Date.now();
    }

    removeToken() {
        axios.defaults.headers.common['authorization'] = '';
        this.user.token = '';
        
        this.delete()
    }
    
    authenticate() {
        return axios.get('authenticate')
    }

    login(username, password) {
        return new Promise((resolve, reject) => {
            axios.post('login', {
                username,
                password
            })
            .then((response) => {
                const data = response.data;
                
                if (data.success) {
                    this.user.token = data.user.token;
                    this.user.username = data.user.username;
                    this.user.viixetId = data.user.viixetId;

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

    logout() {
        this.removeToken()

        return axios.get('logout')
    }

    registration(user) {
        return axios.post('registration', user)
    }

    load() {
        const storage = localStorage[storageSpace]

        if (!!storage) {
            const data = JSON.parse(storage);

            this.user.token = data.token;
            this.user.username = data.username;
            this.user.viixetId = data.viixetId;

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
        const threshold = (45 * 60 * 1000) / 2;

        if (!this.user.token) {
            this.removeToken();
            next(this.otherwise);
        } else {
            if (Date.now() - this.authenticated < threshold) {
                next();
            } else {
                this.authenticate()
                    .then((response) => {
                        const data = response.data;
        
                        if (data.success) {
                            this.authenticated = Date.now();
                            next();
                        } else {
                            this.removeToken();
                            next(this.otherwise);
                        }
                    })
            }
        }
    }
}

export default new UserService()