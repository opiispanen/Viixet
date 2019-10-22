import BasicModal from './BasicModal.vue'
import Card from './Card.vue'
import DropDown from './DropDown.vue'
import ListItem from './ListItem.vue'
import LoadingIcon from './LoadingIcon.vue'
import NavBar from './NavBar.vue'
import NavTabs from './NavTabs.vue'
import SideDrawer from './Drawer.vue'
import Tabs from './Tabs.vue'
import Search from './Search.vue'
import FormInput from './FormInput.vue'
import FormButton from './FormButton.vue'

const components = {
    BasicModal,
    Card,
    DropDown,
    ListItem,
    LoadingIcon,
    NavBar,
    NavTabs,
    Tabs,
    Search,
    SideDrawer,
    FormInput,
    FormButton
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