import axios from 'axios'
import settings from '../settings'

const storageSpace = settings.userStorage;
const user = {
    viixetId: null,
    username: null,
    authenticated: false
}

export default {
    namespaced: true,
    state: {
        user,
        firstLoad: true,
        otherwise: settings.defaultOtherwise || '/',
        callbackState: '/',
        callbacks: [],
        afterLogin: [],
        baseUrl: ''
    },
    getters: {
        isLoggedIn(state) {
            return !!state.user.authenticated;
        },
        username(state) {
            return state.user.username;
        }
    },
    mutations: {
        setFirstLoad(state, value) {
            state.firstLoad = value;
        },
        setAfterLogin(state, afterLogin) {
            state.afterLogin = afterLogin;
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
        userLoggedIn(context) {
            axios.defaults.headers.common['withCredentials'] = true;
            
            context.state.user.authenticated = true;
        },
        userLoggedOut(context, source = '') {
            axios.defaults.headers.common['withCredentials'] = false;
            context.state.user.authenticated = false;
            context.dispatch('delete').catch(() => {})
        },
        authenticate(context) {
            return axios.get(context.state.baseUrl + 'authenticate')
                .then((response) => {
                    const data = response.data;

                    if (data.success) {
                        context.state.user = {
                            ...data.user,
                            authenticated: true
                        }
                        context.state.afterLogin.forEach(callback => callback());

                        return response;
                    } else {
                        return Promise.reject();
                    }
                }).catch(() => {
                    context.dispatch('userLoggedOut','authenticate')
                    return Promise.reject()
                })
        },
        login(context, details) {
            return new Promise((resolve, reject) => {
                axios.post(context.state.baseUrl + 'login', details)
                .then((response) => {
                    const data = response.data;
                    
                    if (data.success) {
                        context.state.user = data.user;
                        context.dispatch('userLoggedIn');
                        context.dispatch('save');
                        context.state.afterLogin.forEach(callback => callback())

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
                context.dispatch('userLoggedOut','logout');
            })
        },
        registration(context, user) {
            return axios.post(context.state.baseUrl + 'registration', user)
        },
        save(context) {
            const userData = {
                ...context.state.user,
                timestamp: Date.now()
            }
            localStorage[storageSpace] = JSON.stringify(userData)
        },
        delete() {
            const storage = localStorage[storageSpace]
            
            if (!!storage) {
                delete localStorage[storageSpace]
    
                return Promise.resolve()
            }
    
            return Promise.reject()
        },
        behindWall(context, helper) {
            const otherwise = context.state.otherwise;
            const firstLoad = context.state.firstLoad;
            const initLoginModal = () => {
                context.commit('setCallbackState', helper.to.path)
                context.commit('setCallbacks', [() => context.commit('toggleModal', false, { root:true })])
                context.commit('setActivePortal','user-modal', { root:true })
                context.commit('toggleModal', true, { root:true })
                helper.next(otherwise)
            }

            context.dispatch('authenticate')
                .then((response) => helper.next())
                .catch((err) => initLoginModal())
            
            context.commit('setFirstLoad', false)
        }
    }
}