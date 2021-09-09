import Vue from 'vue'
import router from './router.js'
import store from './store.js'
import App from './App.vue'

import ViixetUser from './Viixet/User'

import '../scss/frame.scss'

Vue.use(ViixetUser, { store })

new Vue({
	el: '#app',
	render: h => h(App),
	router,
	store
})
