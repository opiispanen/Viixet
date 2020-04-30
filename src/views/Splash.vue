<template>
<page>
    <div class="row">
        <div class="col-xs-12 col-sm-8">
			<h1>Vue-Express Viixet boilerplate</h1>
			<p>
				Okay okay, we're all hungry but we're all gonna get to our hot plates soon enough.
			</p>
			<p>
				What is this? This is a personal project to build a full stack vue-express-nodejs-mysql
				framework for a small project. It's always evolving, maybe not the best idea to pick this 
				up and use in production.
			</p>
			<p>
				
			</p>
		</div>
        <div class="col-xs-12 col-sm-4">
            <div class="card-base card bg-white" style="min-height: 500px;">
                <tabs :headings="['Login','Registration']">
                    <login></login>
                    <registration></registration>
                </tabs>
            </div>
        </div>
    </div>
</page>
</template>

<script>
import Page from '../components/Page.vue'
import login from '../Viixet/Login.vue'
import registration from '../Viixet/Registration.vue'
import tabs from '../Viixet/components/Tabs.vue'

export default {
    components: {
        Page,
        login,
        registration,
        tabs
    },
    mounted() {
        this.$store.commit('user/setCallbackState', '/dashboard')
    }
}
</script>