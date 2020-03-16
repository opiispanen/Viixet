import common from './common.js'
import user from './user.js'

export default {
    state: {
        ...common.state
    },
    getters: {
        ...common.getters
    },
    mutations: {
        ...common.mutations
    },
    actions: {
        ...common.actions
    },
    modules: {
        user
    }
}