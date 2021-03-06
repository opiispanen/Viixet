import BasicModal from './BasicModal.vue'
import Card from './Card.vue'
import DropDown from './DropDown.vue'
import ListItem from './ListItem.vue'
import NavBar from './NavBar.vue'
import NavTabs from './NavTabs.vue'
import Tabs from './Tabs.vue'
import FormInput from './FormInput.vue'

const components = {
    BasicModal,
    Card,
    DropDown,
    ListItem,
    NavBar,
    NavTabs,
    Tabs,
    FormInput
}

components.install = (Vue, options = {}) => {
    const names = Object.keys(components);
    
    names.forEach((name) => {
        const component = components[name]

        if (component && name !== 'install') {
            if (component.type === 'filter')
                Vue.filter(name, component.action)
            else
                Vue.component(name, component)
        }
            
    })
}

export default components