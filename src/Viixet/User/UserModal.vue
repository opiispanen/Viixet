<template>
<portal to="user-modal">
    <div class="container-fluid">
        <div class="row">
            <div class="col-xs-12">
                <tabs :headings="['Login','Registration']">
                    <login @onLogin="onLogin"></login>
                    <div>
                        <h3>Creating a Viixet account you'll understand and accept the following:</h3>
                        <ul style="list-style-position: inside;">
                            <li>Viixet.com doesn't have any organisation behind it.</li>
                            <li>Using your real name as your username is not recommended. Username is not handled as personal data.</li>
                            <li>Everything you publish is on your responsibility. Behave and sharing any personal information is not encouraged.</li>
                            <li>The server itself is physically located in Amsterdam, Netherlands (<a href="https://digitalocean.com" target="_blank">@DigitalOcean</a>)</li>
                            <li>By registering you accept all these conditions.</li>
                        </ul>
                        <registration @onLogin="onLogin"></registration>
                    </div>
                </tabs>
            </div>
        </div>
        <div class="row modal__footer">
            <div class="col-xs-4">
                <button 
                    @click="$store.commit('toggleModal', false)" 
                    class="button button-primary button-bare">
                    <span>{{ $translate('CANCEL') }}</span>
                </button>
            </div>
            <div class="col-xs" style="text-align:right;">
                
            </div>
        </div>
    </div>
</portal>
</template>

<script>
import Login from './Login.vue'
import Registration from './Registration.vue'
import Tabs from '../components/Tabs.vue'

export default {
    components: {
        Login,
        Registration,
        Tabs
    },
    data: () => ({
    }),
    computed: {
        
    },
    methods: {
        onLogin(value) {
            this.$emit('onLogin', value)
        }
    }
}
</script>