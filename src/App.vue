<template>
<div>
	<nav-bar class="bg-black"
        :fixed="true" 
        :rounded="true">
		<div class="col-xs"></div>
		<div class="col-xs" style="text-align:center;">
			<p>Viixet Vue-Express</p>
		</div>
		<div class="col-xs" style="text-align:center;">
			<span 
				@click="logout" 
				v-if="$store.getters['user/isLoggedIn']"
				style="cursor:pointer;">
				logout
			</span>
		</div>
	</nav-bar>
	<router-view class="main-view"></router-view>
    <basic-modal
        :show="$store.state.showModal" 
        :wide="false"
        @close="$store.commit('toggleModal', false)">
        <portal-target :name="$store.state.activePortal"></portal-target>
    </basic-modal>
    <user-modal></user-modal>
</div>
</template>

<script>
import NavBar from './Viixet/components/NavBar.vue'
import BasicModal from './Viixet/components/BasicModal.vue'
import UserModal from './Viixet/components/BasicModal.vue'

export default {
	name: 'app',
	components: {
		NavBar,
        BasicModal,
        UserModal
	},
	computed: {
    },
	methods: {
        logout() {
            this.$store.dispatch('user/logout')
                .then(() => {
                    this.$router.push('/')
                })
        }
	},
	beforeCreate() {
        this.$store.dispatch('windowResize', window.innerWidth);

        window.addEventListener('resize', () => {
            this.$store.dispatch('windowResize', window.innerWidth);
        })
    }
}
</script>