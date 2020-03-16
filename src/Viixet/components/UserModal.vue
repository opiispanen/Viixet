<template>
<portal to="user-modal">
    <div class="container-fluid" style="padding-top: 1em;padding-bottom: 1em;">
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
                            <li>Personal data like your IP, full name, address or email are not stored on the server or shared to 3rd parties in any way.</li>
                            <li>The server itself is physically located in Amsterdam, Netherlands (<a href="https://digitalocean.com" target="_blank">@DigitalOcean</a>)</li>
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
                    <span>{{ $translate($store.state.lang, 'CANCEL') }}</span>
                </button>
            </div>
            <div class="col-xs" style="text-align:right;">
                
            </div>
        </div>
    </div>
</portal>
</template>

<script>
import login from '../Login.vue'
import registration from '../Registration.vue'
import tabs from './Tabs.vue'

export default {
    components: {
        login,
        registration,
        tabs
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