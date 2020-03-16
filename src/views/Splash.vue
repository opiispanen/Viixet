<template>
<div class="container">
    <div class="row">
        <div class="col-xs-8 col-xs-offset-2">
            <div class="card-base card bg-white" style="min-height: 500px;">
                <tabs :headings="['Login','Registration']">
                    <login></login>
                    <registration></registration>
                </tabs>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import login from '../Viixet/Login.vue'
import registration from '../Viixet/Registration.vue'
import tabs from '../Viixet/components/Tabs.vue'

export default {
    components: {
        login,
        registration,
        tabs
    },
    mounted() {
        this.$store.commit('user/setCallbackState', '/')
    }
}
</script>