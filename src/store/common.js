import settings from '../settings'
import languages from '../translations'

export default {
    state: {
        lang: localStorage['ViixetLang'] || settings.defaultLang,
        languages,
        showModal: false,
        activePortal: '',
        isMobileSize: false
    },
    getters: {
        isMobile(state) {
            return state.isMobileSize;
        },
        translate(state) {
            return (placeholder) => {
                const activeLang = state.languages[state.lang] || {};
                
                if (!activeLang[placeholder]) {
                    if (typeof window.missingTranslations === 'undefined') {
                        window.missingTranslations = {}
                    } else if (typeof window.missingTranslations[placeholder] === 'undefined') {
                        window.missingTranslations[placeholder] = '';
                    }

                    return placeholder;
                }
        
                return activeLang[placeholder];
            }
        }
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
        setIsMobile(state, value) {
            state.isMobileSize = value;
        }
    },
    actions: {
        windowResize(context, innerWidth) {
            context.commit('setIsMobile', innerWidth <= 48 * 16); // same as col-xs breakpoint
        }
    }
}