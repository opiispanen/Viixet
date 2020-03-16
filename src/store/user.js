import axios from 'axios'
import settings from '../settings'

const storageSpace = settings.userStorage;
const threshold = (45 * 60 * 1000) / 2;
const user = {
    viixetId: null,
    token: null,
    username: null
}

export default {
    namespaced: true,
    state: {
        user,
        firstLoad: true,
        otherwise: settings.defaultOtherwise || '/',
        callbackState: '/',
        callbacks: [],
        authenticated: 0,
        heartbeatId: null,
        baseUrl: ''
    },
    getters: {
        token(state) {
            return state.user.token;
        },
        isLoggedIn(state) {
            return !!state.user.token;
        },
        authenticated(state) {
            return Date.now() - state.authenticated < threshold;
        }
    },
    mutations: {
        setFirstLoad(state, value) {
            state.firstLoad = value;
        },
        setCallbacks(state, callbacks) {
            state.callbacks = callbacks;
        },
        setCallbackState(state, callbackState) {
            state.callbackState = callbackState;
        },
        setOtherwise(state, otherwise) {
            state.otherwise = otherwise;
        }
    },
    actions: {
        reset(context) {
            context.state.callbackState = '/'
            context.state.callbacks = []
        },
        setToken(context, token) {
            axios.defaults.headers.common['authorization'] = token;
            
            context.state.authenticated = Date.now();
            context.dispatch('tokenHeartbeat');
        },
        removeToken(context) {
            axios.defaults.headers.common['authorization'] = '';
            context.state.user.token = '';
            context.state.authenticated = 0;
            context.dispatch('delete').catch(() => {})
        },
        tokenHeartbeat(context, authenticate = false) {
            if (!!context.state.heartbeatId) {
                clearTimeout(context.state.heartbeatId);
            }
    
            if (authenticate) {
                context.dispatch('authenticate')
                    .then((response) => {
                        const data = response.data;
        
                        if (data.success) {
                            context.state.authenticated = Date.now();
                        } else {
                            context.dispatch('removeToken');
                        }
                    }).catch(() => {
                        context.dispatch('removeToken');
                    })
            }
    
            setTimeout(() => {
                context.dispatch('tokenHeartbeat', true)
                    .then((result) => {
                        context.state.heartbeatId = result;
                    })
            }, threshold);
        },
        authenticate(context) {
            return axios.get(context.state.baseUrl + 'authenticate')
                .then((response) => {
                    const data = response.data;
        
                    if (data.success) {
                        context.state.authenticated = Date.now();
                    } else {
                        context.dispatch('removeToken')

                        if (authenticationFail)  {
                            return Promise.reject();
                        }
                    }
                }).catch(() => context.dispatch('removeToken'))
        },
        login(context, details) {
            return new Promise((resolve, reject) => {
                axios.post(context.state.baseUrl + 'login', details)
                .then((response) => {
                    const data = response.data;
                    
                    if (data.success) {
                        context.state.user.token = data.user.token;
                        context.state.user.username = data.user.username;
                        context.state.user.viixetId = data.user.viixetId;
    
                        context.dispatch('setToken', data.user.token);
                        context.dispatch('save');
    
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
        },
        logout(context) {
            return axios.get(context.state.baseUrl + 'logout').then(() => {
                context.dispatch('removeToken');
            })
        },
        registration(context, user) {
            return axios.post(context.state.baseUrl + 'registration', user)
        },
        load(context) {
            const storage = localStorage[storageSpace]
    
            if (!!storage) {
                const data = JSON.parse(storage)
    
                context.state.user.token = data.token;
                context.state.user.username = data.username;
                context.state.user.viixetId = data.viixetId;
    
                context.dispatch('setToken', data.token)

                return Promise.resolve()
            }
    
            return Promise.reject()
        },
        save(context) {
            localStorage[storageSpace] = JSON.stringify(context.state.user)
        },
        delete() {
            const storage = localStorage[storageSpace]
            
            if (!!storage) {
                delete localStorage[storageSpace]
    
                return Promise.resolve()
            }
    
            return Promise.reject()
        }
    }
}