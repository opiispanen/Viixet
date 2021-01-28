import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './store.js'

// lazy loaded 
const Viixet = () => import('./views/Viixet.vue')
const Splash = () => import('./views/Splash.vue')
const PageNotFound = () => import('./views/PageNotFound.vue')
const ForgotPassword = () => import('./views/ForgotPassword.vue')

Vue.use(VueRouter)

store.commit('user/setAfterLogin', [
    // functions to run after login, usually store.dispatch actions
    // () => store.dispatch('yourAction')
])
store.commit('user/setOtherwise', '/')

const authRequired = ['Viixet'];
//const behindWall = (to, from, next) => store.dispatch('user/behindWall', { to, from, next });
const routes = [
    { 
        path: '/dashboard', 
        name:'Viixet', 
        component: Viixet
    },
    {
        path: '/',
        name: 'Splash',
        component: Splash
    },
    {
        path: '/resetpassword/:token',
        name: 'ForgotPassword',
        component: ForgotPassword
    },
    {
        path: '*', 
        component: PageNotFound 
    }
]

const router = new VueRouter({
    routes: routes
})

router.beforeEach((to, from, next) => {
    if (authRequired.indexOf(to.name) > -1) {
        store.dispatch('user/behindWall', { to, from, next })
    } else {
        next();
    }
})

export default router