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
				v-if="loggedIn"
				style="cursor:pointer;">
				logout
			</span>
		</div>
	</nav-bar>
	<router-view></router-view>
</div>
</template>

<script>
import { EventBus } from './Viixet/EventBus.js'
import NavBar from './Viixet/components/NavBar.vue'

export default {
	name: 'app',
	components: {
		NavBar
	},
	computed: {
        loggedIn() {
            return this.$store.state.loggedIn;
        }
    },
	methods: {
        logout() {
            this.$userService
                .logout()
                .then(() => {
                    this.$router.push({ path: this.$userService.otherwise })
                    this.$store.commit('logout');
                })
		}
	},
	beforeCreate() {
        this.$store.dispatch('windowResize', window.innerWidth);

        window.addEventListener('resize', () => {
            this.$store.dispatch('windowResize', window.innerWidth);
        })

        if (!!this.$userService.user.token) {
            this.$store.commit('login', {
                loggedIn: true,
                username: this.$userService.user.username
            });
        }

        EventBus.$on('Viixet.loginRequired', () => {
            this.$router.push({ name:'SignIn' });
        })

        EventBus.$on('Viixet.onLogin', (val) => {
            this.$store.commit('login', {
                loggedIn: val,
                username: this.$userService.user.username
            });
		});
    }
}
</script>