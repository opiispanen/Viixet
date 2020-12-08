import FileIcon from './FileIcon.vue'
import FileUpload from './FileUpload.vue'
import FilesStore from './files.js'

const components = {
    FileIcon,
    FileUpload
}

export default {
    install(Vue, { store }) {
        Object.keys(components).forEach((name) => {
            const component = components[name];
    
            Vue.component(name, component);    
        })

        if (typeof store !== 'undefined') {
            store.registerModule('files', FilesStore)
        }
    }
}