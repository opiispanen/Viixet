import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './store.js'

// lazy loaded 
const Viixet = () => import('./views/Viixet.vue')
const Splash = () => import('./views/Splash.vue')

Vue.use(VueRouter)

store.dispatch('user/load')
store.commit('user/setOtherwise', '/splash')

const behindWall = (to, from, next) => {
    const token = store.getters['user/token'];
    const authenticated = store.getters['user/authenticated'];
    const otherwise = store.state.user.otherwise;
    const firstLoad = store.state.user.firstLoad;
    const initLoginModal = () => {
        store.commit('user/setCallbackState', to.path)
        store.commit('user/setCallbacks', [() => store.commit('toggleModal', false)])
        store.commit('setActivePortal','user-modal')
        store.commit('toggleModal', true)
    }
    
    if (!token) {
        store.dispatch('user/removeToken')
        initLoginModal()
        next(otherwise)
        return;
    }

    if (authenticated && !firstLoad) {
        next();
        return;
    }

    store.commit('user/setFirstLoad', false)
    store.dispatch('user/authenticate')
        .then(() => next())
        .catch(() => {
            initLoginModal()
            next(otherwise)
        })
}
const routes = [
    { 
        path: '/', 
        name:'Viixet', 
        component: Viixet,
        beforeEnter: behindWall
    },
    {
        path: '/splash',
        name: 'Splash',
        component: Splash
    }
]

export default new VueRouter({
    routes
})