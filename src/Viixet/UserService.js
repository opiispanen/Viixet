import axios from 'axios'
import settings from '../settings.js'
import User from './User.js'

import Login from './LoginView.vue'
import Registration from './RegistrationView.vue'

const storageSpace = settings.userStorage;
const threshold = (45 * 60 * 1000) / 2;

class UserService {
    constructor() {
        this.user = new User();
        this.firstLoad = true;
        this.otherwise = '/signin';
        this.callbackState = '/';
        this.callbacks = [];
        this.authenticated = 0;
        this.heartbeatId = null;

        // hooks do their thing and return a boolean value
        // to determine if the user is to be redirected as is default
        // these functions is designed to be overwritten
        this.hooks = {
            // do nothing, allow default behaviour
            authenticationFail: () => true
        };
    }

    reset() {
        this.callbackState = '/'
        this.callbacks = []
    }

    setToken(token) {
        axios.defaults.headers.common['authorization'] = token;
        
        this.authenticated = Date.now();

        this.tokenHeartbeat();
    }

    tokenHeartbeat(authenticate = false) {
        if (!!this.heartbeatId) {
            clearTimeout(this.heartbeatId);
        }

        if (authenticate) {
            this.authenticate()
                .then((response) => {
                    const data = response.data;
    
                    if (data.success) {
                        this.authenticated = Date.now();
                    } else {
                        this.removeToken();
                    }
                }).catch(() => {
                    this.removeToken();
                })
        }

        setTimeout(() => {
            this.heartbeatId = this.tokenHeartbeat(true);
        }, threshold);
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

                    this.setToken(this.user.token);
                    this.save();

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
        return axios.get('logout').then(() => {
            this.removeToken()
        })
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

    getHook(name) {
        // play it safe with the hook and allow default behaviour
        return typeof this.hooks[name] === 'function' ? this.hooks[name] : () => true;
    }

    behindWall(to, from, next) {
        const authenticationFail = this.getHook('authenticationFail');
        
        if (!this.user.token) {
            this.removeToken();
            next(this.otherwise);
        } else {
            if (Date.now() - this.authenticated < threshold && !this.firstLoad) {
                next();
            } else {
                this.firstLoad = false;

                this.authenticate()
                    .then((response) => {
                        const data = response.data;
        
                        if (data.success) {
                            this.authenticated = Date.now();
                            next();
                        } else {
                            if (authenticationFail)  {
                                next(this.otherwise);
                            }

                            this.removeToken();
                        }
                    }).catch(() => {
                        if (authenticationFail)  {
                            next(this.otherwise);
                        }

                        this.removeToken();
                    })
            }
        }
    }
}

export default new UserService()