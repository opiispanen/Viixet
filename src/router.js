import Vue from 'vue'
import VueRouter from 'vue-router'
import UserService from './Viixet/UserService.js'
import User from './Viixet/User.js'

// lazy loaded 
const Viixet = () => import('./views/Viixet.vue')
const Splash = () => import('./views/Splash.vue')

Vue.use(VueRouter)

UserService.otherwise = '/splash'

if (UserService.load())
    UserService.setToken(UserService.user.token)

Vue.prototype.$userService = UserService

const behindWall = UserService.behindWall.bind(UserService)
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
    },
    ...UserService.getRoutes()
]

export default new VueRouter({
    routes
})