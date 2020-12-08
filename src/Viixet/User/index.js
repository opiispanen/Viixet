import Login from './Login.vue'
import Registration from './Registration.vue'
import UserModal from './UserModal.vue'
import UserStore from './user.js'

const components = {
    Login,
    Registration,
    UserModal
}

export default {
    install(Vue, { store }) {
        Object.keys(components).forEach((name) => {
            const component = components[name];
    
            Vue.component(name, component);    
        })

        if (typeof store !== 'undefined') {
            store.registerModule('user', UserStore)
        }
    }
}