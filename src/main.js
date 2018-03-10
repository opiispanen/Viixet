import Vue from 'vue'
import VueRouter from 'vue-router'
import UserService from './Viixet/UserService.js'

import App from './App.vue'
import Viixet from './Viixet.vue'

if (UserService.load())
    UserService.setToken(UserService.user.token)

Vue.prototype.$userService = UserService;
Vue.use(VueRouter);

const behindWall = UserService.behindWall.bind(UserService)
const routes = [
	{ 
        path: '/', 
        name:'Viixet', 
        component: Viixet,
        beforeEnter: behindWall
    }
]

new Vue({
	el: '#app',
	render: h => h(App),
	router: new VueRouter({
		routes: routes.concat(UserService.getRoutes())
	})
})
