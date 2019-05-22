import settings from '../settings'

export default {
    state: {
        loggedIn: false,
        username: '',
        lang: localStorage['ViixetLang'] || settings.defaultLang,
        showModal: false,
        sideDrawerOpened: false,
        activePortal: '',
        activeMenuRightPortal: '',
        activeMenuLeftPortal: '',
        isMobileSize: false
    },
    getters: {
    },
    mutations: {
        setLang(state, lang) {
            state.lang = lang;
            localStorage['ViixetLang'] = lang;
        },
        toggleModal(state, value) {
            state.showModal = value;
        },
        setActivePortal(state, value) {
            state.activePortal = value;
        },
        setActiveMenuRightPortal(state, value) {
            state.activeMenuRightPortal = value;
        },
        setActiveMenuLeftPortal(state, value) {
            state.activeMenuLeftPortal = value;
        },
        setIsMobile(state, value) {
            state.isMobileSize = value;
        },
        login(state, obj) {
            state.loggedIn = obj.loggedIn;
            state.username = obj.username;
        },
        logout(state) {
            state.loggedIn = false;
            state.username = '';
        }
    },
    actions: {
        windowResize(context, innerWidth) {
            context.commit('setIsMobile', innerWidth <= 48 * 16); // same as col-xs breakpoint
        }
    }
}