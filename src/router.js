import Vue from 'vue'
import VueRouter from 'vue-router'
import UserService from './Viixet/UserService.js'

// lazy loaded 
const Viixet = () => import('./views/Viixet.vue')

Vue.use(VueRouter)

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
    }
]

export default new VueRouter({
    routes: routes.concat(UserService.getRoutes())
})